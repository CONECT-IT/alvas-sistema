import { expect, test } from '@playwright/test';

test('la app publica carga la experiencia inicial', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle(/ALVAS|alvas/i);
	await expect(page.locator('body')).toBeVisible();
});
