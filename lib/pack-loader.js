const path = require('node:path');
const { listFiles, readJson } = require('./fs-utils');

function collectPackFiles(packRoot, childDir, predicate) {
  const root = path.join(packRoot, childDir);
  return listFiles(root)
    .filter(predicate)
    .map((filePath) => ({
      absolutePath: filePath,
      relativePath: path.relative(root, filePath),
    }));
}

function loadPacks(packsDir) {
  const packJsonFiles = listFiles(packsDir).filter((filePath) => path.basename(filePath) === 'pack.json');
  return packJsonFiles.map((packJsonPath) => {
    const packRoot = path.dirname(packJsonPath);
    const metadata = readJson(packJsonPath);
    if (!metadata.name) {
      throw new Error(`Pack missing name: ${packJsonPath}`);
    }

    return {
      ...metadata,
      root: packRoot,
      commands: collectPackFiles(packRoot, 'commands', (filePath) => filePath.endsWith('.md')),
      skills: collectPackFiles(packRoot, 'skills', (filePath) => path.basename(filePath) === 'SKILL.md'),
      templates: collectPackFiles(packRoot, 'templates', (filePath) => filePath.endsWith('.md')),
      obsidianFiles: collectPackFiles(packRoot, 'obsidian', () => true),
      instructionFiles: collectPackFiles(packRoot, 'instructions', (filePath) => filePath.endsWith('.md')),
      mcpFiles: collectPackFiles(packRoot, 'mcp', () => true),
      integrationFiles: collectPackFiles(packRoot, 'integrations', () => true),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { loadPacks };
