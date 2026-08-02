import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/balanced-brackets/',
    screenshot: 'on',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/balanced-brackets/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
