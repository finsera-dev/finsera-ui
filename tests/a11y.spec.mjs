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

/* ---------- Dialoog ---------- */
for (const kleur of thema) {
  test(`dialoog: axe, ${kleur}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: schermen.desktop, colorScheme: kleur, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/index.html');
    await page.waitForSelector('#dossiers table');
    for (const knop of ['#dialoog-open', '#dialoog-verwijder']) {
      await page.click(knop);
      await page.waitForSelector('dialog[open]');
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const samenvatting = violations.map((v) => `${v.id}: ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
      expect(violations, `Fouten in dialoog bij ${knop}:\n${samenvatting}`).toEqual([]);
      await page.keyboard.press('Escape');
      await page.waitForSelector('dialog[open]', { state: 'detached' }).catch(() => {});
    }
    await context.close();
  });
}

test('dialoog: toetsenbord, focus en sluiten', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  const dialoog = page.locator('#dialoog-nieuw');

  // Openen: focus gaat naar binnen, Esc sluit en focus keert terug naar de knop.
  await page.focus('#dialoog-open');
  await page.keyboard.press('Enter');
  await expect(dialoog).toHaveJSProperty('open', true);
  expect(await page.evaluate(() => document.activeElement.closest('dialog')?.id)).toBe('dialoog-nieuw');
  await page.keyboard.press('Escape');
  await expect(dialoog).toHaveJSProperty('open', false);
  await expect(page.locator('#dialoog-open')).toBeFocused();

  // Een klik op de achtergrond sluit; een klik in het venster niet.
  await page.click('#dialoog-open');
  await dialoog.locator('.fs-dialoog__titel').click();
  await expect(dialoog).toHaveJSProperty('open', true);
  await page.mouse.click(5, 5);
  await expect(dialoog).toHaveJSProperty('open', false);

  // Verplicht veld: leeg opslaan sluit niet; ingevuld opslaan sluit en toont een toast.
  await page.click('#dialoog-open');
  await dialoog.getByRole('button', { name: 'Dossier aanmaken' }).click();
  await expect(dialoog).toHaveJSProperty('open', true);
  await dialoog.getByLabel('Bedrijfsnaam').fill('Bakkerij Test');
  await dialoog.getByRole('button', { name: 'Dossier aanmaken' }).click();
  await expect(dialoog).toHaveJSProperty('open', false);
  await expect(page.locator('[data-sonner-toaster] li', { hasText: 'Dossier aangemaakt' })).toBeVisible();

  // Pagina erachter scrolt niet zolang de dialoog open is.
  await page.click('#dialoog-open');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
});

test('bevestig: veilige keuze heeft de focus; annuleren geeft false, bevestigen true', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  const toast = (tekst) => page.locator('[data-sonner-toaster] li', { hasText: tekst });

  await page.click('#dialoog-verwijder');
  const bevestigDialoog = page.getByRole('alertdialog', { name: 'Dossier verwijderen?' });
  await expect(bevestigDialoog).toBeVisible();
  await expect(bevestigDialoog.getByRole('button', { name: 'Annuleren' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toast('Niets verwijderd')).toBeVisible();
  await expect(page.locator('dialog.fs-dialoog[aria-labelledby^=fs-bevestig]')).toHaveCount(0); // netjes opgeruimd

  await page.click('#dialoog-verwijder');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Dossier verwijderen' }).click();
  await expect(toast('Dossier verwijderd')).toBeVisible();
});
