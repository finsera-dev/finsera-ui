/*
 * Toegankelijkheidstest van de documentatiepagina: axe-core (WCAG 2.1 A en AA), in licht en donker,
 * op desktop en mobiel, met toasts zichtbaar. Een nieuw onderdeel dat hier faalt, is niet klaar.
 * Vereist internet: de pagina laadt ECharts, Lucide, TanStack, vanilla-sonner en het lettertype van een CDN.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const thema = ['light', 'dark'];
const schermen = { desktop: { width: 1280, height: 900 }, mobiel: { width: 390, height: 844 } };

for (const kleur of thema) {
  for (const [naam, viewport] of Object.entries(schermen)) {
    test(`axe: ${kleur}, ${naam}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport, colorScheme: kleur, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/index.html');

      // Wacht tot de externe onderdelen er zijn: grafieken, tabel, iconen.
      await page.waitForSelector('#lijn svg', { timeout: 20_000 });
      await page.waitForSelector('#staaf svg');
      await page.waitForSelector('#dossiers table');
      await page.waitForSelector('.fs-nav svg');

      // Toon een paar toasts, want ook die moeten toegankelijk en leesbaar zijn.
      for (const soort of ['succes', 'waarschuwing', 'fout']) await page.click(`[data-toast=${soort}]`);
      await page.waitForSelector('[data-sonner-toaster] li');
      await page.waitForTimeout(600); // aanloopanimatie

      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const samenvatting = violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n   ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
      expect(violations, `Toegankelijkheidsfouten:\n${samenvatting}`).toEqual([]);
      await context.close();
    });
  }
}

test('geen horizontale scroll op mobiel', async ({ browser }) => {
  const context = await browser.newContext({ viewport: schermen.mobiel });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  const breder = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(breder, 'de pagina scrolt horizontaal').toBe(false);
  await context.close();
});
