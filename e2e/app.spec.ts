import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

import type { WeatherResponse } from '../src/app/weather-services/weather.models';

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => process.stderr.write(`Browser error: ${error.message}\n`));
});

// Deliberately artificial test data, used only by intercepted browser tests.
// Production code never imports fixtures or substitutes weather on network failure.
const fixture: WeatherResponse = {
  timezone: 'Asia/Manila',
  utc_offset_seconds: 28800,
  current: {
    time: '2026-10-28T00:15',
    temperature_2m: 0,
    apparent_temperature: null,
    relative_humidity_2m: 0,
    wind_speed_10m: 0,
    weather_code: 0,
  },
  current_units: {
    temperature_2m: '°C',
    apparent_temperature: '°C',
    relative_humidity_2m: '%',
    wind_speed_10m: 'km/h',
  },
  daily_units: { temperature_2m_min: '°C', temperature_2m_max: '°C', precipitation_probability_max: '%' },
  daily: {
    time: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'],
    weather_code: [0, 1, 2, 3, 61, 95, 1234],
    temperature_2m_min: [0, 1, 2, 3, 4, 5, 6],
    temperature_2m_max: [10, 11, 12, 13, 14, 15, 16],
    precipitation_probability_max: [0, 10, 20, 30, 40, 50, null],
  },
};

async function selectCity(page: Page, name: string): Promise<void> {
  await page.locator('ion-select').click();
  await page.getByRole('radio', { name, exact: true }).click();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
}

test('home selection, forecast route, cached data, About and back navigation', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: fixture }));
  await page.goto('/home');
  await expect(page.getByTestId('current-temperature')).toHaveText('0°C');
  await selectCity(page, 'Gapan');
  await expect(page.locator('.weather-hero h2')).toHaveText('Gapan');
  await page.getByRole('link', { name: 'View Forecast' }).click();
  await expect(page).toHaveURL(/\/details\/gapan$/);
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  await expect(page.locator('app-details .retrieved')).toContainText('Cached');
  await page.locator('app-details ion-back-button').click();
  await expect(page).toHaveURL(/\/home$/);
  await page.locator('app-home .about-link').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('app-about')).toContainText('[Course / Year / Section]');
  await expect(page.locator('app-about .team-list ion-item')).toHaveCount(3);
  await expect(page.locator('app-about')).toContainText('not an official warning service');
  await page.locator('app-about ion-back-button').click();
  await expect(page).toHaveURL(/\/home$/);
});

test('dark mode toggles and persists across reloads', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: fixture }));
  await page.goto('/home');

  const toggle = page.getByRole('button', { name: 'Toggle dark mode' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('ecija-weather-theme'))).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/ion-palette-dark/);
  await expect(page.getByRole('button', { name: 'Toggle dark mode' })).toHaveAttribute('aria-pressed', 'true');
});

test('direct details, reload, zero and missing measurements, fresh refresh', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    requests++;
    return route.fulfill({ json: fixture });
  });
  await page.goto('/details/munoz');
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  await expect(page.getByTestId('current-temperature')).toHaveText('0°C');
  await expect(page.getByTestId('humidity')).toHaveText('0%');
  await expect(page.locator('.metrics')).toContainText('Unavailable');
  await expect(page.getByTestId('forecast-day').last()).toContainText('Unknown condition');
  await expect(page.getByTestId('forecast-day').first()).toContainText('Wed, Oct 28');
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect.poll(() => requests).toBe(2);
  await page.reload();
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  await page.locator('ion-back-button').click();
  await expect(page).toHaveURL(/\/home$/);
});

test('loading, network failure, Retry and provider missing-data states', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.open-meteo.com/**', async (route) => {
    requests++;
    if (requests === 1) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.abort('failed');
    } else {
      await route.fulfill({ json: {} });
    }
  });
  await page.goto('/home');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Check your internet');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByTestId('current-temperature')).toHaveText('Unavailable');
  await page.getByRole('link', { name: 'View Forecast' }).click();
  await expect(page.locator('app-details')).toContainText('Forecast unavailable');
  await expect(page.locator('app-details .hero-time')).toContainText('Unavailable');
});

test('invalid location avoids API access and offers Home', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    requests++;
    return route.fulfill({ json: fixture });
  });
  await page.goto('/details/not-a-city');
  await expect(page.getByRole('heading', { name: "Let's head back." })).toBeVisible();
  expect(requests).toBe(0);
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test('narrow 320px screen has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: fixture }));
  await page.goto('/details/munoz');
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  const widths = await page
    .locator('.page-shell')
    .evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test('live Open-Meteo works through the browser application without CORS bypass', async ({ page }) => {
  test.skip(
    process.env['RUN_LIVE_WEATHER'] !== '1',
    'Opt in with RUN_LIVE_WEATHER=1; this test calls the real public API.',
  );
  test.setTimeout(90_000);
  await mkdir('artifacts', { recursive: true });
  const responsePromise = page.waitForResponse((response) =>
    response.url().startsWith('https://api.open-meteo.com/v1/forecast'),
  );
  await page.goto('/home');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const body = (await response.json()) as WeatherResponse;
  expect(body.timezone).toBe('Asia/Manila');
  expect(body.utc_offset_seconds).toBe(28800);
  expect(body.current_units?.temperature_2m).toBe('°C');
  expect(body.current_units?.wind_speed_10m).toBe('km/h');
  expect(body.daily?.time).toHaveLength(7);
  for (const values of [
    body.daily?.weather_code,
    body.daily?.temperature_2m_min,
    body.daily?.temperature_2m_max,
    body.daily?.precipitation_probability_max,
  ])
    expect(values).toHaveLength(7);
  await expect(page.getByTestId('current-temperature')).toHaveText(`${body.current?.temperature_2m}°C`);
  await writeFile(
    'artifacts/live-weather-response.json',
    JSON.stringify(
      { url: response.url(), status: response.status(), headers: await response.allHeaders(), body },
      null,
      2,
    ),
  );
  await page.screenshot({ path: 'artifacts/home-live.png', fullPage: true, animations: 'disabled' });
  const secondResponse = page.waitForResponse((result) =>
    result.url().startsWith('https://api.open-meteo.com/v1/forecast'),
  );
  await selectCity(page, 'San Jose City');
  expect((await secondResponse).status()).toBe(200);
  await expect(page.locator('.weather-hero h2')).toHaveText('San Jose City');
  await page.getByRole('link', { name: 'View Forecast' }).click();
  await expect(page).toHaveURL(/\/details\/san-jose$/);
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  await page.waitForFunction(() => !document.getAnimations().some((animation) => animation.playState === 'running'));
  await page.screenshot({ path: 'artifacts/details-live.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('heading', { name: '7-day forecast' }).scrollIntoViewIfNeeded();
  await page.locator('app-details ion-content').evaluate(async (element) => {
    const content = element as HTMLElement & { getScrollElement(): Promise<HTMLElement> };
    const scrollElement = await content.getScrollElement();
    scrollElement.scrollTop = 650;
  });
  await page.screenshot({ path: 'artifacts/forecast-live.png', fullPage: true, animations: 'disabled' });
  await page.reload();
  await expect(page.getByTestId('forecast-day')).toHaveCount(7);
  await page.getByRole('link', { name: 'About Our Group', exact: true }).click();
  await expect(page.locator('app-about h1')).toBeVisible();
  await page.waitForFunction(() => !document.getAnimations().some((animation) => animation.playState === 'running'));
  await page.screenshot({ path: 'artifacts/about.png', fullPage: true, animations: 'disabled' });
});
