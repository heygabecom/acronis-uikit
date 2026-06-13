#!/usr/bin/env node
// figma-to-json-plus/emit-primitives.mjs
// Entry point for Step 6a: emit tiers/primitives.json from the current snapshot.
//
// Prerequisites: snapshot/figma-snapshot.json must exist (run figma-snapshot-build.mjs).
//
// Usage: node figma-to-json-plus/emit-primitives.mjs

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PrimitivesEmitter } from './helpers/emit-primitives-builder.mjs';

const SNAPSHOT_PATH = fileURLToPath(new URL('./snapshot/figma-snapshot.json', import.meta.url));

if (!fs.existsSync(SNAPSHOT_PATH)) {
  console.error(`Missing snapshot: ${SNAPSHOT_PATH}`);
  console.error('Run figma-snapshot-build.mjs (Phase 2) first.');
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
const emitter = new PrimitivesEmitter(snapshot);
emitter.emit();
console.log(`Wrote ${emitter.outputPath}`);
