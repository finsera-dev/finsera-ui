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

/* ---------- Grote dialoog met tabs ---------- */
const TABS = ['Algemeen', 'Toegang', 'Meldingen', 'Geavanceerd'];

async function openInstellingen(page, rij = 1) {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await page.click(`[data-dossier="${rij}"]`);
  const dlg = page.locator('#dialoog-instellingen');
  await expect(dlg).toHaveJSProperty('open', true);
  return dlg;
}

for (const kleur of thema) {
  test(`instellingen: axe op elke tab, ${kleur}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: schermen.desktop, colorScheme: kleur, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const dlg = await openInstellingen(page);
    for (const naam of TABS) {
      await dlg.getByRole('tab', { name: naam }).click();
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const samenvatting = violations.map((v) => `${v.id}: ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
      expect(violations, `Fouten op tab ${naam}:\n${samenvatting}`).toEqual([]);
    }
    await context.close();
  });
}

test('instellingen: tabs met toetsenbord en juiste ARIA', async ({ page }) => {
  const dlg = await openInstellingen(page);
  const tab = (naam) => dlg.getByRole('tab', { name: naam });
  const paneelZichtbaar = async (naam) => (await dlg.getByRole('tabpanel', { name: naam }).isVisible());

  // Start op de eerste tab, alleen die zit in de tabvolgorde.
  await expect(tab('Algemeen')).toHaveAttribute('aria-selected', 'true');
  await expect(tab('Toegang')).toHaveAttribute('tabindex', '-1');
  expect(await paneelZichtbaar('Algemeen')).toBe(true);

  await tab('Algemeen').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab('Toegang')).toBeFocused();
  await expect(tab('Toegang')).toHaveAttribute('aria-selected', 'true');
  expect(await paneelZichtbaar('Toegang')).toBe(true);
  expect(await paneelZichtbaar('Algemeen')).toBe(false);

  await page.keyboard.press('End');
  await expect(tab('Geavanceerd')).toBeFocused();
  await page.keyboard.press('ArrowRight'); // rond
  await expect(tab('Algemeen')).toBeFocused();
  await page.keyboard.press('ArrowLeft'); // en terug
  await expect(tab('Geavanceerd')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tab('Algemeen')).toBeFocused();

  // Opnieuw openen begint weer op de eerste tab.
  await tab('Meldingen').click();
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveJSProperty('open', false);
  await page.click('[data-dossier="2"]');
  await expect(tab('Algemeen')).toHaveAttribute('aria-selected', 'true');
});

test('instellingen: titel, velden en focus volgen het gekozen dossier', async ({ page }) => {
  const dlg = await openInstellingen(page, 0);
  await expect(dlg.getByRole('heading', { name: 'Bakkerij De Gouden Korst B.V.' })).toBeVisible();
  await expect(dlg.getByLabel('Bedrijfsnaam')).toBeFocused(); // niet het kruisje
  await expect(dlg.getByLabel('Status')).toHaveValue('wacht');
});

test('instellingen: wijzigingen weggooien vraagt eerst bevestiging', async ({ page }) => {
  const dlg = await openInstellingen(page);

  // Niets gewijzigd: Esc sluit direct, zonder vraag.
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveJSProperty('open', false);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  // Wel gewijzigd, in een andere tab dan de eerste: Esc vraagt eerst.
  await page.click('[data-dossier="1"]');
  await dlg.getByRole('tab', { name: 'Meldingen' }).click();
  await dlg.getByRole('switch', { name: /Wekelijks overzicht/ }).check();
  await page.keyboard.press('Escape');
  const vraag = page.getByRole('alertdialog', { name: 'Wijzigingen weggooien?' });
  await expect(vraag).toBeVisible();
  await expect(vraag.getByRole('button', { name: 'Terug naar instellingen' })).toBeFocused();
  await vraag.getByRole('button', { name: 'Terug naar instellingen' }).click();
  await expect(vraag).toBeHidden(); // wachten tot de vraag weg is, anders landt de volgende klik erop
  await expect(dlg).toHaveJSProperty('open', true); // bleef open, wijziging intact
  await expect(dlg.getByRole('switch', { name: /Wekelijks overzicht/ })).toBeChecked();

  // Annuleren-knop en klik op de achtergrond vragen ook; weggooien sluit.
  await dlg.getByRole('button', { name: 'Annuleren' }).click();
  await expect(vraag).toBeVisible();
  await vraag.getByRole('button', { name: 'Terug naar instellingen' }).click();
  await expect(vraag).toBeHidden();
  await page.mouse.click(5, 5);
  await expect(vraag).toBeVisible();
  await vraag.getByRole('button', { name: 'Wijzigingen weggooien' }).click();
  await expect(dlg).toHaveJSProperty('open', false);

  // Na weggooien is de volgende keer weer schoon.
  await page.click('[data-dossier="1"]');
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveJSProperty('open', false);
});

test('instellingen: opslaan sluit direct en toont een toast', async ({ page }) => {
  const dlg = await openInstellingen(page);
  await dlg.getByLabel('Notitie voor het kantoor').fill('Bellen na de zomer');
  await dlg.getByRole('button', { name: 'Instellingen opslaan' }).click();
  await expect(dlg).toHaveJSProperty('open', false);
  await expect(page.getByRole('alertdialog')).toHaveCount(0); // opslaan is geen "weggooien"
  await expect(page.locator('[data-sonner-toaster] li', { hasText: 'Instellingen opgeslagen' })).toBeVisible();
});

test('instellingen: ongeldig veld in een verborgen tab schakelt naar die tab', async ({ page }) => {
  const dlg = await openInstellingen(page);
  await dlg.getByLabel('Bedrijfsnaam').fill('');
  await dlg.getByRole('tab', { name: 'Meldingen' }).click();
  await dlg.getByRole('button', { name: 'Instellingen opslaan' }).click();
  await expect(dlg).toHaveJSProperty('open', true); // niet opgeslagen
  await expect(dlg.getByRole('tab', { name: 'Algemeen' })).toHaveAttribute('aria-selected', 'true');
  await expect(dlg.getByLabel('Bedrijfsnaam')).toBeFocused();
});

test('instellingen: verwijderen in de tab Geavanceerd vraagt bevestiging', async ({ page }) => {
  const dlg = await openInstellingen(page);
  await dlg.getByRole('tab', { name: 'Geavanceerd' }).click();
  await dlg.getByRole('button', { name: 'Dossier verwijderen' }).click();
  const vraag = page.getByRole('alertdialog', { name: 'Dossier verwijderen?' });
  await expect(vraag.getByRole('button', { name: 'Annuleren' })).toBeFocused();
  await vraag.getByRole('button', { name: 'Annuleren' }).click();
  await expect(dlg).toHaveJSProperty('open', true); // nog steeds open
  await dlg.getByRole('button', { name: 'Dossier verwijderen' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Dossier verwijderen' }).click();
  await expect(dlg).toHaveJSProperty('open', false);
  await expect(page.locator('[data-sonner-toaster] li', { hasText: 'Dossier verwijderd' })).toBeVisible();
});

test('instellingen: past op een smal scherm', async ({ browser }) => {
  const context = await browser.newContext({ viewport: schermen.mobiel });
  const page = await context.newPage();
  const dlg = await openInstellingen(page);
  const doos = await dlg.boundingBox();
  expect(doos.x).toBeGreaterThanOrEqual(0);
  expect(doos.x + doos.width).toBeLessThanOrEqual(schermen.mobiel.width);
  expect(doos.y + doos.height).toBeLessThanOrEqual(schermen.mobiel.height);
  await expect(dlg.getByRole('button', { name: 'Instellingen opslaan' })).toBeInViewport(); // acties blijven bereikbaar
  await context.close();
});
