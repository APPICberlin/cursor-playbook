import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || process.env.SMOKE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});


