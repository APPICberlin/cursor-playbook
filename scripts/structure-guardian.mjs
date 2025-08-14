#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const fail = (m) => { console.error(m); process.exitCode = 1; };

const flavorPath = path.join(process.cwd(), 'project.flavor.json');
if (!fs.existsSync(flavorPath)) {
  fail('project.flavor.json missing. Add {"framework":"nextjs|redwood|node","language":"ts"}.');
  process.exit();
}

const flavor = JSON.parse(fs.readFileSync(flavorPath, 'utf8'));
const has = (p) => fs.existsSync(path.join(process.cwd(), p));

// Language enforcement
if (flavor.language === 'ts') {
  // Disallow .js under app code paths
  const forbidRoots = ['src', 'web/src', 'api/src'];
  for (const root of forbidRoots) {
    const rootAbs = path.join(process.cwd(), root);
    if (!fs.existsSync(rootAbs)) continue;
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.jsx?$/.test(e.name)) fail(`Use TypeScript: ${p}`);
      }
    };
    walk(rootAbs);
  }
}

// Mixed-framework guard
const hasNext = has('src/app') || has('pages');
const hasRedwood = has('web/src') || has('api/src');
if ((hasNext && hasRedwood) || (flavor.framework === 'nextjs' && hasRedwood) || (flavor.framework === 'redwood' && hasNext)) {
  fail('Mixed or conflicting structure detected (Next.js vs Redwood). Align with docs/ARCHITECTURE.md or update project.flavor.json and open an ADR.');
}

// Archive import guard
const searchImportFromArchive = () => {
  const roots = ['src', 'web/src', 'api/src'];
  for (const root of roots) {
    const rootAbs = path.join(process.cwd(), root);
    if (!fs.existsSync(rootAbs)) continue;
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(t|j)sx?$/.test(e.name)) {
          const s = fs.readFileSync(p, 'utf8');
          if (/from\s+['"]\.\.\/.*ARCHIVE\//.test(s) || /from\s+['"]~?\/ARCHIVE\//.test(s)) {
            fail(`Do not import from ARCHIVE/: ${p}`);
          }
        }
      }
    };
    walk(rootAbs);
  }
};

searchImportFromArchive();


