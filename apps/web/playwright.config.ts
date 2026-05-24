import { defineConfig, devices } from '@playwright/test';

const webServerCommand = process.env.CI
	? 'bun run preview'
	: 'bun run dev -- --host 127.0.0.1 --port 5173';

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	expect: {
		timeout: 5_000
	},
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: webServerCommand,
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
