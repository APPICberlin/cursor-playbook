import fs from 'node:fs';
import path from 'node:path';

const QA_DIR = 'qa';
const RESULTS_JSON = path.join(QA_DIR, 'results.json');
const AXE_DIR = path.join(QA_DIR, 'axe');
const OUT_MD = path.join(QA_DIR, 'report.md');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function summarizePlaywright(json) {
  if (!json) return { passed: 0, failed: 0, skipped: 0, tests: [] };
  const tests = [];
  let passed = 0, failed = 0, skipped = 0;
  for (const suite of json.suites || []) {
    for (const s of suite.suites || []) {
      for (const spec of s.specs || []) {
        for (const t of spec.tests || []) {
          const ok = t.results?.every(r => r.status === 'passed') ?? false;
          const sk = t.results?.every(r => r.status === 'skipped') ?? false;
          if (ok) passed++; else if (sk) skipped++; else failed++;
          tests.push({ title: spec.title, testId: t.testId, status: ok ? 'passed' : (sk ? 'skipped' : 'failed') });
        }
      }
    }
  }
  return { passed, failed, skipped, tests };
}

function loadAxeFindings() {
  if (!fs.existsSync(AXE_DIR)) return [];
  const files = fs.readdirSync(AXE_DIR).filter(f => f.endsWith('.json'));
  const rows = [];
  for (const f of files) {
    const data = readJsonSafe(path.join(AXE_DIR, f));
    if (!data) continue;
    const violations = data.results?.violations || [];
    rows.push({ route: data.route || f.replace(/\.json$/, ''), count: violations.length, violations });
  }
  return rows.sort((a, b) => b.count - a.count);
}

function main() {
  ensureDir(QA_DIR);
  const pw = readJsonSafe(RESULTS_JSON);
  const pwSummary = summarizePlaywright(pw);
  const axe = loadAxeFindings();

  let md = '';
  md += `# QA Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## Playwright summary\n`;
  md += `- Passed: ${pwSummary.passed}\n`;
  md += `- Failed: ${pwSummary.failed}\n`;
  md += `- Skipped: ${pwSummary.skipped}\n\n`;

  if (pwSummary.failed > 0) {
    md += `### Failing tests\n`;
    for (const t of pwSummary.tests.filter(t => t.status === 'failed')) {
      md += `- ${t.title}\n`;
    }
    md += `\n`;
  }

  md += `## Accessibility (axe)\n`;
  if (axe.length === 0) {
    md += `- No axe reports found.\n`;
  } else {
    for (const row of axe) {
      md += `- ${row.route}: ${row.count} violations\n`;
      for (const v of row.violations.slice(0, 10)) {
        md += `  - ${v.id}: ${v.help} (impact: ${v.impact})\n`;
      }
    }
  }

  const pwa = readJsonSafe(path.join(QA_DIR, 'pwa.json'));
  md += `\n## PWA\n`;
  if (pwa) {
    md += `- Manifest: ${pwa.manifestHref ? 'OK' : 'Missing'}\n`;
    md += `- Icons: ${Array.isArray(pwa.manifest?.icons) ? pwa.manifest.icons.length : 0}\n`;
    md += `- Service worker supported by browser: ${pwa.swSupported ? 'Yes' : 'No'}\n`;
  } else {
    md += `- No pwa.json found.\n`;
  }

  fs.writeFileSync(OUT_MD, md);
  console.log(`Wrote ${OUT_MD}`);
}

main();


