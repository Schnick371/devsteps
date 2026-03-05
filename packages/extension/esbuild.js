#!/usr/bin/env node

/**
 * Dual-Target Build System for DevSteps Extension
 *
 * Builds two separate bundles following GitLens architecture pattern:
 * 1. Extension bundle (with vscode API) - 50KB target
 * 2. MCP server bundle (no vscode API) - 500KB target
 *
 * @see SPIKE-007 - GitLens/GitKraken research
 * @see STORY-056 - Dual-target build system transformation
 */
import esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Extension bundle configuration
 * @type {esbuild.BuildOptions}
 */
const extensionBuildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'esm',
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
  mainFields: ['module', 'main'],
  conditions: ['node'],
  metafile: true,
};

/**
 * MCP Server bundle configuration
 * Bundles the HTTP server entry point for in-process use by the VS Code extension.
 * @type {esbuild.BuildOptions}
 */
const mcpServerBuildOptions = {
  entryPoints: ['../mcp-server/src/http-server.ts'],
  bundle: true,
  outfile: 'dist/mcp-server.js',
  external: [], // Bundle everything - no vscode API used
  format: 'esm',
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
  mainFields: ['module', 'main'],
  conditions: ['node'],
};

async function buildExtension() {
  console.log('📦 Building extension bundle...');
  if (watch) {
    const context = await esbuild.context(extensionBuildOptions);
    await context.watch();
  } else {
    const result = await esbuild.build(extensionBuildOptions);
    const size = result.metafile ? Object.values(result.metafile.outputs)[0].bytes : 0;
    const sizeKB = (size / 1024).toFixed(1);
    console.log(`✅ Extension bundle: ${sizeKB} KB`);
  }
}

async function buildMcpServer() {
  console.log('📦 Building MCP server bundle...');
  if (watch) {
    const context = await esbuild.context(mcpServerBuildOptions);
    await context.watch();
  } else {
    await esbuild.build(mcpServerBuildOptions);
    // Note: metafile not enabled on MCP bundle to save build time
    console.log('✅ MCP server bundle built: dist/mcp-server.js');
  }
}

async function main() {
  try {
    if (watch) {
      console.log('👀 Watching for changes...');
      await Promise.all([buildExtension(), buildMcpServer()]);
      console.log('✨ Watch mode active for both bundles');
    } else {
      await buildExtension();
      await buildMcpServer();
      console.log('✅ Dual-target build complete');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();
