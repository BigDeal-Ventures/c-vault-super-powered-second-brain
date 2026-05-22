const fs = require('node:fs');
const path = require('node:path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result.sort();
}

function copyFile(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function copyTree(source, destination) {
  for (const file of listFiles(source)) {
    const rel = path.relative(source, file);
    copyFile(file, path.join(destination, rel));
  }
}

function removeDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

module.exports = {
  copyFile,
  copyTree,
  ensureDir,
  listFiles,
  readJson,
  removeDir,
  writeFile,
};
