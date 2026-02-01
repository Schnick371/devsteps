#!/usr/bin/env node
const esbuild = require('esbuild');
const _path = require('node:path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').BuildOptions}
 */
const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.bundled.mjs', // .mjs extension for ESM
  format: 'esm', // ESM needed for top-level await
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  external: [
    // ONLY keep Node.js built-in modules external
    // Everything else (npm packages + workspace packages) gets bundled
    'node:*',
  ],
  banner: {
    js: '// DevSteps MCP Server - bundled for VS Code Extension Host',
  },
  // Ignore warnings for intentional patterns
  logOverride: {
    'indirect-require': 'silent', // We use static imports only
    'empty-glob': 'silent', // Dynamic handler imports are runtime-resolved, not build-time
  },
  logLevel: 'info',
};

async function main() {
  const ctx = await esbuild.context(buildOptions);

  if (watch) {
    console.log('[watch] build started');
    await ctx.watch();
  } else {
    console.log('[build] build started');
    await ctx.rebuild();
    await ctx.dispose();
    console.log('[build] build finished');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
