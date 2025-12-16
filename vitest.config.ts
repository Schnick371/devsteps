import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Only test source files, not dist/
		include: ['packages/*/src/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
		
		// Run tests in parallel for speed
		threads: true,
		
		// Reasonable timeout for tests
		testTimeout: 10000,
	},
});
