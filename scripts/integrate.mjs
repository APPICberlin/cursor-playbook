#!/usr/bin/env node
// Local integration branch creator to avoid CI minutes.
// Requires: git, gh, node >= 18

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const [k, v] = process.argv[i].split('=');
  args.set(k.replace(/^--/, ''), v ?? '');
}

const base = args.get('base') || 'main';
const slug = args.get('slug') || `integration-${Date.now()}`;
const branchesArg = args.get('branches') || '';
const branches = branchesArg ? branchesArg.split(',').map(s => s.trim()).filter(Boolean) : [];
const drop = (args.get('drop') || 'qa/**,test-results/**,screens/**').split(',').map(s => s.trim()).filter(Boolean);
const restore = (args.get('restore') || 'package.json,playwright.config.ts,.github/workflows/ci.yml,.gitignore').split(',').map(s => s.trim()).filter(Boolean);

const run = (cmd, opts = {}) => {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
};

const tryRun = (cmd, opts = {}) => {
  console.log(`$ ${cmd}`);
  try { execSync(cmd, { stdio: 'inherit', ...opts }); } catch (e) { /* keep going */ }
};

function ensureGh() {
  const res = spawnSync('gh', ['--version'], { stdio: 'ignore' });
  if (res.status !== 0) {
    console.error('GitHub CLI (gh) is required. Install from https://cli.github.com/');
    process.exit(1);
  }
}

function ensureClean() {
  const s = execSync('git status --porcelain').toString();
  if (s.trim()) {
    console.error('Working tree is dirty. Commit or stash changes first.');
    process.exit(1);
  }
}

function createBranch() {
  run('git fetch --all --prune');
  run(`git checkout -B integ/${slug} origin/${base}`);
}

function mergeBranches() {
  for (const b of branches) {
    tryRun(`git fetch origin ${b}`);
    run(`git merge --no-ff -m "Merge ${b} into integ/${slug}" -X theirs origin/${b}`);
  }
}

function normalize() {
  // Drop artifact paths
  for (const p of drop) {
    tryRun(`git rm -r --cached -f --ignore-unmatch ${p}`);
    tryRun(`rm -rf ${p}`);
  }
  // Restore important files from base
  for (const f of restore) {
    tryRun(`git checkout origin/${base} -- ${f}`);
  }
  // Commit normalization if needed
  const diff = execSync('git diff').toString();
  if (diff.trim()) {
    run('git add -A');
    run('git commit -m "chore(integration): drop artifacts and restore base configs"');
  }
}

function qa() {
  run('npm ci');
  tryRun('npm run lint');
  tryRun('npm run typecheck || npx tsc --noEmit');
  tryRun('npm run build');
}

function openPr() {
  const body = [
    '## What',
    '',
    'Single integration PR merging trains:',
    ...branches.map(b => `- ${b}`),
    '',
    '## Acceptance Criteria — verification',
    '',
    '- [ ] All merged trains build and lint clean',
    '- [ ] Conflicts resolved per policy (docs kept, artifacts dropped)',
    '- [ ] Frontend only: inline screenshots pasted below',
    '',
    '## Screenshots (inline)',
    '',
    '- Paste representative PNGs here (download from local run).',
    '',
    '## QA Checklist',
    '',
    '- [ ] npm run lint',
    '- [ ] npm run typecheck (or tsc --noEmit)',
    '- [ ] npm run build'
  ].join('\n');
  const tmp = path.join(os.tmpdir(), `integration-body-${Date.now()}.md`);
  fs.writeFileSync(tmp, body);
  run(`git push -u origin integ/${slug}`);
  run(`gh pr create --base ${base} --head integ/${slug} --title "Integration: ${slug}" --body-file "${tmp}"`);
}

ensureGh();
ensureClean();
createBranch();
mergeBranches();
normalize();
qa();
openPr();


