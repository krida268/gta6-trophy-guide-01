// Leonida Trophy Atlas — the entry program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// What this program does, in three moves: it takes the guide's static files (app/) and the
// screenshots the maker took of it (screenshots/) from beside this file, places copies of them
// under the output directory, and writes dossier.json there — the summary the judge reads
// (the screenshots, the first load's files and bytes, and the guide's source), built with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts untouched: the scorer rebuilds
// the dossier with its own copy of that library and requires a byte-for-byte match.
//
// The guide itself is plain static files: app/index.html opens in desktop Chrome with the
// network off, its trophy list and guides live in app/data/trophies.json, and it loads nothing
// from outside app/. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice and both runs must write identical bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate (reference/gate.json): text_max_bytes shapes the dossier's
// text; the rest refuse an entry the scorer would refuse — more than 4 screenshots, one over
// 256 KiB, or app/ past 993 files and directories / 48 MiB (app/ shares /output's own
// 1000-entry cap with screenshots/ and dossier.json, so leave them room). A run writes the
// same bytes every time: no timestamps, no randomness, no host-dependent paths in the output.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
