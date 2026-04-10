import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

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
    // import.meta polyfill: the source code resolves paths as dist/commands/<file>, going 2 levels up
    // to reach the CLI package root. In the CJS bundle the actual file is dist/index.cjs (1 level
    // below root), so we fake the url to be dist/commands/bundle.cjs to preserve the same depth.
    js: '#!/usr/bin/env node\nvar __importMeta = {url: require("url").pathToFileURL(require("path").join(__dirname, "commands", "_bundle.cjs")).href};\n',
  },
  // Fix: import.meta is unavailable in CJS format — define it via banner-injected __importMeta
  define: {
    'import.meta': '__importMeta',
  },
  // External: None - bundle everything except Node.js built-ins (auto-detected by platform: 'node')
  minify: false,
  sourcemap: false,
  // Keep command line usage readable
  keepNames: true,
});

console.log('[CLI] Bundle complete! Created standalone dist/index.cjs (861KB bundled)');
