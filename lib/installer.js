const fs = require('node:fs');
const path = require('node:path');
const { copyFile, listFiles, writeFile } = require('./fs-utils');

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
        destination: path.join(target, path.relative(sourceRoot, source)),
      });
    }
  }

  return { actions, target, tool, scope: options.scope || 'project' };
}

function install(options = {}) {
  const plan = buildInstallPlan(options);
  if (options.dryRun) {
    return { ...plan, dryRun: true };
  }

  const manifest = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    tool: plan.tool,
    scope: plan.scope,
    files: [],
  };

  for (const action of plan.actions) {
    copyFile(action.source, action.destination);
    manifest.files.push(action.destination);
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
  if (options.dryRun) {
    return { manifestPath, removedFiles: manifest.files.length, dryRun: true };
  }

  let removedFiles = 0;
  for (const filePath of manifest.files.slice().reverse()) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
      removedFiles += 1;
    }
  }
  fs.rmSync(manifestPath, { force: true });
  return { manifestPath, removedFiles, dryRun: false };
}

module.exports = {
  buildInstallPlan,
  install,
  uninstall,
};
