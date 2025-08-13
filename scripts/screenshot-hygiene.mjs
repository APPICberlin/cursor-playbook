#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const screensDir = path.join(root, 'screens');

const fail = (msg) => {
  console.error(msg);
  process.exitCode = 1;
};

if (!fs.existsSync(screensDir)) {
  process.exit(0);
}

const files = fs.readdirSync(screensDir);
const debug = files.filter(f => /^debug-.*\.(png|jpe?g)$/i.test(f));
if (debug.length) fail(`Remove debug screenshots: ${debug.join(', ')}`);

// If screens/ contains changes in CI, guardian enforces reference; locally we only ban debug-
process.exit(0);


