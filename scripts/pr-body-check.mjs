#!/usr/bin/env node
import fs from 'node:fs';

const body = process.argv[2] || '';
const required = [
  /##\s*Acceptance Criteria/i,
  /##\s*Screenshots\s*\(inline\)/i,
  /##\s*QA Checklist/i,
];

let ok = true;
for (const r of required) {
  if (!r.test(body)) {
    console.error(`Missing section in PR body: ${r}`);
    ok = false;
  }
}
process.exit(ok ? 0 : 1);


