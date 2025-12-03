import esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('[CLI] Bundling with esbuild...');

// Read the original file and remove shebang before bundling
let originalCode = readFileSync(join(__dirname, 'dist/index.js'), 'utf-8');
const tempFile = join(__dirname, 'dist/index.temp.js');

// Remove shebang from original
if (originalCode.startsWith('#!')) {
  originalCode = originalCode.replace(/^#!.*\n/, '');
}
writeFileSync(tempFile, originalCode);

// Bundle the main CLI file as CommonJS (better compatibility with dependencies)
await esbuild.build({
  entryPoints: [tempFile],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  // External: None - bundle everything except Node.js built-ins (auto-detected by platform: 'node')
  minify: false,
  sourcemap: false,
  // Keep command line usage readable
  keepNames: true,
});

console.log('[CLI] Bundle complete! Created standalone dist/index.cjs (861KB bundled)');
