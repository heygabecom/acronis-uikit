import { Buffer } from 'node:buffer';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';
import { optimize, type Config } from 'svgo';

const require = createRequire(import.meta.url);

const currentDir = dirname(fileURLToPath(import.meta.url));

// Resolve the icons-svg sources via the package itself, not a hard-coded
// relative path, so this keeps working if the repo layout moves.
const iconsSvgPackageJson = require.resolve('@acronis-platform/icons-svg/package.json');
const iconsSourceDir = resolve(dirname(iconsSvgPackageJson), 'src');

// Output to "sprites/" (not "dist/") because the repo-root .gitignore ignores
// any "dist" dir; these artifacts are committed, like tokens-pd's css/ output.
const outputDir = resolve(currentDir, '../sprites');
const outputFile = resolve(outputDir, 'iconsprite.svg');
const outputFileMono = resolve(outputDir, 'iconsprite-mono.svg');
const outputFileMulti = resolve(outputDir, 'iconsprite-multi.svg');

type IconType = 'monocolor' | 'multicolor';

/**
 * SVGO configuration for sprite generation.
 *
 * For sprite files we must preserve defs and symbols even though there are no
 * <use> references inside the sprite itself (they live in external files).
 * SVGO v4 already keeps viewBox by default (removeViewBox is no longer part of
 * preset-default), so it is not overridden here.
 */
const svgoConfig: Config = {
  multipass: false, // Disable multipass - can be too aggressive for sprites
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // CRITICAL: Don't remove "unused" defs - they're used externally!
          removeUselessDefs: false,
          removeHiddenElems: false,
          removeEmptyContainers: false,

          // KEEP these for correctness
          removeUnknownsAndDefaults: {
            keepDataAttrs: false,
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },

          // Tune optimizations (removeEmptyAttrs and convertTransform are
          // already enabled by preset-default, so they are not overridden).
          collapseGroups: false, // Keep symbol structure
          convertColors: {
            currentColor: false,
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
            shortname: true,
          },

          // Path optimization
          mergePaths: false,
          convertPathData: {
            floatPrecision: 3,
            transformPrecision: 5,
          },
          removeUselessStrokeAndFill: false,

          // Don't touch IDs at all
          cleanupIds: false,
        },
      },
    },
    'removeComments',
    'removeEditorsNSData',
    'sortDefsChildren',
  ],
};

/**
 * Lists all SVG files (recursively) under a directory, as absolute paths.
 */
function listSvgFiles(dir: string): string[] {
  try {
    return readdirSync(dir, { recursive: true })
      .map((entry) => String(entry))
      .filter((entry) => entry.endsWith('.svg'))
      .map((entry) => resolve(dir, entry))
      .sort();
  } catch {
    return [];
  }
}

/**
 * Processes a single SVG file into a <symbol> element.
 */
function processSvg(filePath: string, type: IconType): string {
  const content = readFileSync(filePath, 'utf-8');
  const filename = basename(filePath, extname(filePath));

  // Use shorter prefixes: monocolor -> m, multicolor -> c
  const prefix = type === 'monocolor' ? 'm' : 'c';
  const iconId = `${prefix}-${filename}`;

  // Replace 'paint' with a unique prefix to avoid ID collisions across icons
  let processedContent = content.replace(/paint/g, `${iconId}_p_`);

  // Remove namespace declarations that can cause issues
  processedContent = processedContent
    .replace(/xmlns:rdf="[^"]*"/g, '')
    .replace(/xmlns:dc="[^"]*"/g, '')
    .replace(/xmlns:cc="[^"]*"/g, '');

  const $ = load(processedContent, { xmlMode: true });

  // Remove namespace-prefixed elements that cause issues
  $('rdf\\:RDF, metadata').remove();

  // For monocolor icons: replace fill colors with currentColor and drop styles,
  // so they inherit color from CSS while preserving fill-rule behavior.
  if (type === 'monocolor') {
    $('[fill]').each((_index, element) => {
      const $el = $(element);
      const fillValue = $el.attr('fill');
      if (fillValue && fillValue !== 'none' && fillValue !== 'transparent') {
        $el.attr('fill', 'currentColor');
      }
    });
    $('[style]').removeAttr('style');
    $('rect').remove();
  }

  const $svg = $('svg');
  const viewBox = $svg.attr('viewBox');

  // Extract inner content (width/height are intentionally dropped — viewBox is
  // sufficient and keeps symbols flexible).
  const innerContent = $svg.html() ?? '';

  // Carry over the root fill attribute (e.g. fill="none") so paths that inherit
  // it don't fall back to the default black fill.
  const fill = $svg.attr('fill');
  const fillAttr = fill ? ` fill="${fill}"` : '';
  const viewBoxAttr = viewBox ? ` viewBox="${viewBox}"` : '';

  return `<symbol id="${iconId}"${viewBoxAttr}${fillAttr}>${innerContent}</symbol>`;
}

/**
 * Wraps symbols in a sprite root.
 */
function createSprite(symbols: string[]): string {
  // No XML declaration — it adds bytes and isn't required for inline SVG.
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${symbols.join('')}</defs></svg>`;
}

interface OptimizeResult {
  success: boolean;
  data?: string;
  error?: string;
}

function optimizeSprite(content: string): OptimizeResult {
  try {
    const optimized = optimize(content, svgoConfig);
    if (optimized.data && optimized.data.length > 100) {
      return { success: true, data: optimized.data };
    }
    return { success: false, error: `Invalid SVGO output (length: ${optimized.data?.length ?? 0})` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Writes a sprite, optimizing it when possible and falling back to the raw sprite.
 */
function writeSprite(target: string, symbols: string[], label: string): void {
  const sprite = createSprite(symbols);
  const optimized = optimizeSprite(sprite);

  if (optimized.success && optimized.data) {
    writeFileSync(target, optimized.data, 'utf-8');
    const size = Buffer.byteLength(optimized.data, 'utf-8');
    const original = Buffer.byteLength(sprite, 'utf-8');
    const savings = ((1 - size / original) * 100).toFixed(1);
    console.log(`   ${label}: ${formatSize(size)} (${symbols.length} icons, ${savings}% reduction)`);
  } else {
    writeFileSync(target, sprite, 'utf-8');
    console.log(`   ⚠️  ${label}: SVGO failed (${optimized.error}), using unoptimized sprite`);
  }
}

function generateSprite(): void {
  console.log('🎨 Generating icon sprites...\n');

  const monochromeIcons = listSvgFiles(resolve(iconsSourceDir, 'monocolor-icons'));
  const multicolorIcons = listSvgFiles(resolve(iconsSourceDir, 'multicolor-icons'));

  console.log(`📦 Found ${monochromeIcons.length} monocolor icons`);
  console.log(`📦 Found ${multicolorIcons.length} multicolor icons\n`);

  if (monochromeIcons.length === 0 && multicolorIcons.length === 0) {
    throw new Error(`No icons found under ${iconsSourceDir}. Did @acronis-platform/icons-svg sync run?`);
  }

  const monoSymbols: string[] = [];
  for (const iconPath of monochromeIcons) {
    try {
      monoSymbols.push(processSvg(iconPath, 'monocolor'));
    } catch (error) {
      console.error(`❌ Error processing ${basename(iconPath)}:`, (error as Error).message);
    }
  }

  const multiSymbols: string[] = [];
  for (const iconPath of multicolorIcons) {
    try {
      multiSymbols.push(processSvg(iconPath, 'multicolor'));
    } catch (error) {
      console.error(`❌ Error processing ${basename(iconPath)}:`, (error as Error).message);
    }
  }

  console.log(`✅ Processed ${monoSymbols.length + multiSymbols.length} icons total\n`);

  mkdirSync(outputDir, { recursive: true });

  console.log('⚡ Generating + optimizing sprites with SVGO...');
  writeSprite(outputFile, [...monoSymbols, ...multiSymbols], 'Combined');
  writeSprite(outputFileMono, monoSymbols, 'Monocolor');
  writeSprite(outputFileMulti, multiSymbols, 'Multicolor');

  console.log('\n🎉 Sprite generation complete!');
  console.log('\n📄 Generated files:');
  console.log(`   • ${outputFile}`);
  console.log(`   • ${outputFileMono}`);
  console.log(`   • ${outputFileMulti}`);
}

try {
  generateSprite();
} catch (error) {
  console.error('❌ Failed to generate sprite:', error);
  process.exit(1);
}
