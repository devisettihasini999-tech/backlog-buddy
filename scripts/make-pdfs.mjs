/**
 * Builds the PDF manifest (list of files + text lines) from the same
 * generator the app uses, then hands it to generate_pdfs.py.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildPdfManifest } from '../src/data/generator.js';

const here = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(here, '../src/data/seed.json'), 'utf8'));
const manifest = buildPdfManifest(seed);
writeFileSync(join(here, 'pdf-manifest.json'), JSON.stringify(manifest));
console.log(`Manifest written: ${manifest.length} PDFs to generate`);
