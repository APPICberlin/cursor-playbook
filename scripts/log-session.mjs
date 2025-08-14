#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const now = new Date().toISOString();
function git(cmd) { return require('child_process').execSync(`git ${cmd}`).toString().trim(); }

const user = process.env.GIT_AUTHOR_NAME || git('config user.name');
const branch = git('rev-parse --abbrev-ref HEAD');
const lastMsg = git('log -1 --pretty=%s');
const changed = git('diff --name-only HEAD~1..HEAD || echo').split(/\r?\n/).filter(Boolean);
const ids = (branch + '\n' + lastMsg).match(/\b([A-Z]{1,6}-\d{1,5}|E\d{1,3}-\d{1,3})\b/g) || [];

const dir = path.join('docs', 'AGENTS');
fs.mkdirSync(dir, { recursive: true });

const md = path.join(dir, 'SESSIONS.md');
const json = path.join(dir, 'SESSIONS.json');

const entry = { ts: now, user, branch, tickets: ids, lastCommit: lastMsg, changed };

fs.appendFileSync(md, `- ${now} — ${user} — ${branch} — tickets: ${ids.join(', ') || '(none)'} — ${lastMsg}\n`);
let arr = [];
if (fs.existsSync(json)) arr = JSON.parse(fs.readFileSync(json, 'utf8'));
arr.push(entry);
fs.writeFileSync(json, JSON.stringify(arr, null, 2));
console.log('Logged agent session.');

