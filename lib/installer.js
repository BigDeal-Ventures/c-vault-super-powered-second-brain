const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { copyFile, ensureDir, listFiles, writeFile } = require('./fs-utils');

const MANIFEST = '.c-vault-install.json';
const TOOL_DIRS = {
  'claude-code': ['generated/claude-code'],
  codex: ['generated/codex'],
  cursor: ['generated/cursor'],
  opencode: ['generated/opencode'],
  obsidian: ['generated/obsidian', 'generated/common'],
  auto: ['generated/claude-code', 'generated/codex', 'generated/cursor', 'generated/opencode', 'generated/obsidian', 'generated/common'],
};

function assertTool(tool) {
  if (!TOOL_DIRS[tool]) {
    throw new Error(`Unsupported tool: ${tool}. Supported tools: ${Object.keys(TOOL_DIRS).join(', ')}`);
  }
}

function buildInstallPlan(options) {
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  const target = path.resolve(options.target || process.cwd());
  const tool = options.tool || 'auto';
  assertTool(tool);

  const actions = [];
  for (const relSourceRoot of TOOL_DIRS[tool]) {
    const sourceRoot = path.join(repoRoot, relSourceRoot);
    for (const source of listFiles(sourceRoot)) {
      actions.push({
        type: 'copy',
        source,
        sourceHash: fileHash(source),
        destination: path.join(target, path.relative(sourceRoot, source)),
      });
    }
  }

  return { actions: dedupeActions(actions), target, tool, scope: options.scope || 'project' };
}

function dedupeActions(actions) {
  const byDestination = new Map();
  for (const action of actions) {
    const existing = byDestination.get(action.destination);
    if (!existing) {
      byDestination.set(action.destination, action);
      continue;
    }
    if (existing.sourceHash !== action.sourceHash) {
      throw new Error(`Conflicting generated outputs target the same path: ${action.destination}`);
    }
  }
  return Array.from(byDestination.values()).sort((left, right) => left.destination.localeCompare(right.destination));
}

function hashBuffer(buffer) {
  return `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
}

function fileHash(filePath) {
  return hashBuffer(fs.readFileSync(filePath));
}

function readManifest(target) {
  const manifestPath = path.join(target, MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function normalizeManifestFiles(manifest) {
  if (!manifest || !Array.isArray(manifest.files)) {
    return [];
  }
  return manifest.files.map((entry) => {
    if (typeof entry === 'string') {
      return {
        path: entry,
        sourceHash: null,
        installedHash: null,
        legacy: true,
      };
    }
    return {
      path: entry.path,
      sourceHash: entry.sourceHash || null,
      installedHash: entry.installedHash || entry.sourceHash || null,
      legacy: false,
    };
  }).filter((entry) => entry.path);
}

function emptySummary() {
  return {
    create: 0,
    update: 0,
    unchanged: 0,
    conflict: 0,
    forceOverwrite: 0,
    remove: 0,
    forceRemove: 0,
    orphan: 0,
    orphanConflict: 0,
  };
}

function summarize(actions) {
  const summary = emptySummary();
  for (const action of actions) {
    if (Object.prototype.hasOwnProperty.call(summary, action.status)) {
      summary[action.status] += 1;
    }
  }
  return summary;
}

function classifyInstallPlan(plan, options = {}) {
  const previousManifest = readManifest(plan.target);
  const previousFiles = new Map(normalizeManifestFiles(previousManifest).map((entry) => [entry.path, entry]));
  const plannedDestinations = new Set(plan.actions.map((action) => action.destination));
  const actions = [];

  for (const action of plan.actions) {
    const previous = previousFiles.get(action.destination);
    if (!fs.existsSync(action.destination)) {
      actions.push({ ...action, status: 'create', previous });
      continue;
    }

    const currentHash = fileHash(action.destination);
    if (currentHash === action.sourceHash) {
      actions.push({ ...action, status: 'unchanged', currentHash, previous });
    } else if (previous && previous.installedHash && currentHash === previous.installedHash) {
      actions.push({ ...action, status: 'update', currentHash, previous });
    } else if (options.force) {
      actions.push({ ...action, status: 'forceOverwrite', currentHash, previous });
    } else {
      actions.push({ ...action, status: 'conflict', currentHash, previous });
    }
  }

  for (const previous of previousFiles.values()) {
    if (plannedDestinations.has(previous.path)) {
      continue;
    }
    if (!options.clean) {
      actions.push({ type: 'orphan', destination: previous.path, status: 'orphan', previous });
      continue;
    }
    if (!fs.existsSync(previous.path)) {
      continue;
    }
    const currentHash = fileHash(previous.path);
    if (previous.installedHash && currentHash === previous.installedHash) {
      actions.push({ type: 'remove', destination: previous.path, status: 'remove', currentHash, previous });
    } else if (options.force) {
      actions.push({ type: 'remove', destination: previous.path, status: 'forceRemove', currentHash, previous });
    } else {
      actions.push({ type: 'remove', destination: previous.path, status: 'orphanConflict', currentHash, previous });
    }
  }

  return {
    ...plan,
    actions,
    conflicts: actions.filter((action) => action.status === 'conflict' || action.status === 'orphanConflict'),
    previousManifest,
    summary: summarize(actions),
  };
}

function backupFile(filePath) {
  const backupPath = `${filePath}.bak`;
  ensureDir(path.dirname(backupPath));
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function manifestEntryFor(action) {
  return {
    path: action.destination,
    sourceHash: action.sourceHash,
    installedHash: action.sourceHash,
  };
}

function install(options = {}) {
  const plan = classifyInstallPlan(buildInstallPlan(options), options);
  if (options.dryRun) {
    return { ...plan, dryRun: true };
  }

  const manifest = {
    schemaVersion: 2,
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    tool: plan.tool,
    scope: plan.scope,
    files: [],
  };

  for (const action of plan.actions) {
    if (action.status === 'create' || action.status === 'update') {
      copyFile(action.source, action.destination);
      manifest.files.push(manifestEntryFor(action));
    } else if (action.status === 'forceOverwrite') {
      if (options.backup && fs.existsSync(action.destination)) {
        action.backupPath = backupFile(action.destination);
      }
      copyFile(action.source, action.destination);
      manifest.files.push(manifestEntryFor(action));
    } else if (action.status === 'unchanged') {
      manifest.files.push(manifestEntryFor(action));
    } else if ((action.status === 'conflict' || action.status === 'orphan' || action.status === 'orphanConflict') && action.previous) {
      manifest.files.push(action.previous);
    } else if (action.status === 'remove') {
      fs.rmSync(action.destination, { force: true });
    } else if (action.status === 'forceRemove') {
      if (options.backup && fs.existsSync(action.destination)) {
        action.backupPath = backupFile(action.destination);
      }
      fs.rmSync(action.destination, { force: true });
    }
  }

  writeFile(path.join(plan.target, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...plan, dryRun: false, manifestPath: path.join(plan.target, MANIFEST) };
}

function uninstall(options = {}) {
  const target = path.resolve(options.target || process.cwd());
  const manifestPath = path.join(target, MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    return { manifestPath, removedFiles: 0, missingManifest: true };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = normalizeManifestFiles(manifest);
  if (options.dryRun) {
    const removableFiles = [];
    const skipped = [];
    for (const entry of files) {
      if (!fs.existsSync(entry.path)) {
        removableFiles.push(entry);
        continue;
      }
      if (options.force) {
        removableFiles.push(entry);
        continue;
      }
      if (entry.installedHash && fileHash(entry.path) === entry.installedHash) {
        removableFiles.push(entry);
      } else {
        skipped.push(entry);
      }
    }
    return {
      manifestPath,
      removedFiles: removableFiles.length,
      skippedFiles: skipped.length,
      skipped,
      dryRun: true,
    };
  }

  let removedFiles = 0;
  const skipped = [];
  for (const entry of files.slice().reverse()) {
    if (!fs.existsSync(entry.path)) {
      removedFiles += 1;
      continue;
    }
    const currentHash = fileHash(entry.path);
    const canRemove = options.force || (entry.installedHash && currentHash === entry.installedHash);
    if (canRemove) {
      if (options.force && options.backup && entry.installedHash && currentHash !== entry.installedHash) {
        backupFile(entry.path);
      }
      fs.rmSync(entry.path, { force: true });
      removedFiles += 1;
    } else {
      skipped.push(entry);
    }
  }
  if (skipped.length > 0) {
    const nextManifest = { ...manifest, files: skipped };
    writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
  } else {
    fs.rmSync(manifestPath, { force: true });
  }
  return { manifestPath, removedFiles, skippedFiles: skipped.length, skipped, dryRun: false };
}

module.exports = {
  buildInstallPlan,
  classifyInstallPlan,
  install,
  uninstall,
};
