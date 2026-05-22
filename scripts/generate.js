#!/usr/bin/env node
const { generateAll } = require('../lib/generator');

const result = generateAll();
console.log(`Generated adapters for ${result.packs} packs at ${result.outputDir}`);
