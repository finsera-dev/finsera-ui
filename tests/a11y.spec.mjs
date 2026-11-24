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

// Een klik op een rij opent het zijpaneel; "Alle instellingen…" daarin opent de grote dialoog.
async function openViaPaneel(page, rij) {
  await page.click(`[data-dossier="${rij}"]`);
  await page.getByRole('button', { name: 'Alle instellingen…' }).click();
}

async function openInstellingen(page, rij = 1) {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await openViaPaneel(page, rij);
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
  await openViaPaneel(page, 2);
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
  await openViaPaneel(page, 1);
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
  await openViaPaneel(page, 1);
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

/* ---------- Zijpaneel ---------- */
const naamRij = (page, tekst) => page.locator('#dossiers tbody tr', { hasText: tekst });

async function openPaneel(page, rij = 1, viewport = schermen.desktop) {
  await page.setViewportSize(viewport);
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await page.click(`[data-dossier="${rij}"]`);
  const paneel = page.locator('#paneel-dossier');
  await expect(paneel).toHaveJSProperty('open', true);
  await page.waitForTimeout(300); // aanloopanimatie
  return paneel;
}

for (const kleur of thema) {
  test(`paneel: axe (niet-modaal, desktop), ${kleur}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: schermen.desktop, colorScheme: kleur, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await openPaneel(page);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const samenvatting = violations.map((v) => `${v.id}: ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
    expect(violations, `Fouten met open paneel:\n${samenvatting}`).toEqual([]);
    await context.close();
  });
}

test('paneel: axe (modaal, tablet en mobiel), donker', async ({ browser }) => {
  for (const viewport of [{ width: 800, height: 900 }, schermen.mobiel]) {
    const context = await browser.newContext({ viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await openPaneel(page, 1, viewport);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const samenvatting = violations.map((v) => `${v.id}: ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
    expect(violations, `Fouten met open paneel op ${viewport.width}px:\n${samenvatting}`).toEqual([]);
    await context.close();
  }
});

test('paneel: niet-modaal op breed scherm, pagina blijft bruikbaar, wisselt van item', async ({ page }) => {
  const paneel = await openPaneel(page, 1);
  expect(await paneel.evaluate((el) => el.matches(':modal'))).toBe(false);
  await expect(page.locator('#paneel-titel')).toBeFocused();
  await expect(page.locator('#paneel-titel')).toHaveText('Studio Noord V.O.F.');
  await expect(page.locator('[aria-current="true"]')).toHaveCount(1);

  // De pagina schuift op: het paneel bedekt niets, ook niet de rechterkolommen van de tabel.
  const paneelDoos = await paneel.boundingBox();
  const inhoud = await page.locator('main.fs-inhoud').boundingBox();
  expect(inhoud.x + inhoud.width, 'het paneel bedekt de inhoud').toBeLessThanOrEqual(paneelDoos.x + 1);
  const tabelrand = page.locator('#dossiers .fs-tabelrand');
  const rand = await tabelrand.boundingBox();
  expect(rand.x + rand.width, 'de tabel steekt onder het paneel').toBeLessThanOrEqual(paneelDoos.x + 1);

  // De pagina erachter blijft bedienbaar en wordt niet vergrendeld.
  await page.fill('#zoek', 'Bouw');
  await expect(page.locator('#zoek')).toHaveValue('Bouw');
  await page.fill('#zoek', '');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');

  // Een ander item aanklikken wisselt de inhoud; het paneel blijft open.
  await page.click('[data-dossier="0"]');
  await expect(page.locator('#paneel-titel')).toHaveText('Bakkerij De Gouden Korst B.V.');
  await expect(page.locator('#paneel-titel')).toBeFocused();
  await expect(page.locator('[aria-current="true"]')).toHaveText('Bakkerij De Gouden Korst B.V.');
  await expect(page.locator('[aria-current="true"]')).toHaveCount(1);
  await expect(paneel).toHaveJSProperty('open', true);

  // Esc sluit; de focus keert terug op het item dat het paneel opende.
  await page.keyboard.press('Escape');
  await expect(paneel).toHaveJSProperty('open', false);
  await expect(page.locator('[data-dossier="0"]')).toBeFocused();
  await expect(page.locator('[aria-current="true"]')).toHaveCount(0);
  // Na sluiten krijgt de pagina haar ruimte terug.
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).paddingRight)).toBe('0px');

  // Kruisje sluit ook.
  await page.click('[data-dossier="3"]');
  await paneel.getByRole('button', { name: 'Paneel sluiten' }).click();
  await expect(paneel).toHaveJSProperty('open', false);
  await expect(page.locator('[data-dossier="3"]')).toBeFocused();
});

test('paneel: snelle instelling geldt direct, werkt de tabel bij en kan ongedaan worden gemaakt', async ({ page }) => {
  const paneel = await openPaneel(page, 1);
  await expect(naamRij(page, 'Studio Noord').getByText('Achterstallig')).toBeVisible();

  await paneel.getByLabel('Status').selectOption('akkoord');
  await expect(naamRij(page, 'Studio Noord').getByText('Akkoord')).toBeVisible(); // tabel direct bijgewerkt
  await expect(page.locator('#paneel-badge')).toHaveText('Akkoord');
  const toast = page.locator('[data-sonner-toaster] li', { hasText: 'Status gewijzigd naar Akkoord' });
  await expect(toast).toBeVisible();
  // De toast staat naast het paneel en bedekt de knoppen eronder niet.
  await page.waitForTimeout(400);
  const doos = await toast.boundingBox();
  const paneelDoos = await paneel.boundingBox();
  expect(doos.x + doos.width, 'toast overlapt het paneel').toBeLessThanOrEqual(paneelDoos.x);

  await toast.getByRole('button', { name: 'Ongedaan maken' }).click();
  await expect(naamRij(page, 'Studio Noord').getByText('Achterstallig')).toBeVisible();
  await expect(paneel.getByLabel('Status')).toHaveValue('achter');

  // Een schakelaar geeft ook direct feedback.
  await paneel.getByRole('switch', { name: /Herinnering sturen/ }).check();
  await expect(page.locator('[data-sonner-toaster] li', { hasText: 'Opgeslagen' })).toBeVisible();
  // Terug naar dit item toont de bewaarde keuze.
  await page.click('[data-dossier="0"]');
  await page.click('[data-dossier="1"]');
  await expect(paneel.getByRole('switch', { name: /Herinnering sturen/ })).toBeChecked();
});

test('paneel: "Alle instellingen…" sluit het paneel en opent de grote dialoog voor hetzelfde dossier', async ({ page }) => {
  const paneel = await openPaneel(page, 1);
  await paneel.getByRole('button', { name: 'Alle instellingen…' }).click();
  await expect(paneel).toHaveJSProperty('open', false);
  const dlg = page.locator('#dialoog-instellingen');
  await expect(dlg).toHaveJSProperty('open', true);
  await expect(dlg.getByRole('heading', { name: 'Studio Noord V.O.F.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveJSProperty('open', false);
});

test('paneel: onder 1200 px is het modaal (grens)', async ({ page }) => {
  const smal = await openPaneel(page, 1, { width: 1100, height: 800 });
  expect(await smal.evaluate((el) => el.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(smal).toHaveJSProperty('open', false);
  const breed = await openPaneel(page, 1, { width: 1200, height: 800 });
  expect(await breed.evaluate((el) => el.matches(':modal'))).toBe(false);
});

test('paneel: modaal op een smal scherm (achtergrond sluit, pagina vergrendeld)', async ({ page }) => {
  const paneel = await openPaneel(page, 1, { width: 800, height: 900 });
  expect(await paneel.evaluate((el) => el.matches(':modal'))).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  await page.mouse.click(40, 450); // op de achtergrond, links van het paneel
  await expect(paneel).toHaveJSProperty('open', false);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');

  // En met Esc, op een telefoon.
  const p2 = await openPaneel(page, 2, schermen.mobiel);
  expect(await p2.evaluate((el) => el.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(p2).toHaveJSProperty('open', false);
});

/* ---------- Tabel: focus blijft staan bij opnieuw tekenen ---------- */
test('tabel: focus blijft op de sorteerknop na sorteren met het toetsenbord', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  const knop = page.locator('.fs-sorteer[data-kolom="bedrag"]');
  await knop.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#dossiers th[aria-sort="ascending"]')).toBeVisible();
  await expect(knop).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#dossiers th[aria-sort="descending"]')).toBeVisible();
  await expect(knop).toBeFocused();
});

/* ---------- Navigatie is een link ---------- */
// Niet getest, want dat vraagt een router en die bouwt elke app zelf: de focus naar de h1 na een routewissel,
// het role="status"-bericht, document.title en Ctrl/Cmd/middelklik. Dat staat in de doorloop van de app
// (voor het Portaal: `doorloop/kantoor.spec.ts`, blok 12.4 in finsera-kern).
test('navigatie: items zijn links met href, precies één is de huidige pagina', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('.fs-nav svg');
  // Items zijn links. De kop van een uitklapbare groep is de uitzondering: in- of uitklappen is een actie, dus een knop.
  const nav = page.locator('.fs-nav:not(.fs-nav--groep)');
  expect(await nav.count()).toBeGreaterThan(1);
  const koppen = page.locator('.fs-nav--groep');
  expect(await koppen.count()).toBeGreaterThan(0);
  expect(await koppen.evaluateAll((els) => els.every((e) => e.tagName === 'BUTTON' && e.hasAttribute('aria-expanded') && e.hasAttribute('aria-controls')))).toBe(true);
  expect(await nav.evaluateAll((els) => els.map((e) => e.tagName))).toEqual(Array(await nav.count()).fill('A'));
  expect(await nav.evaluateAll((els) => els.every((e) => e.getAttribute('href')))).toBe(true);
  await expect(page.getByRole('link', { name: 'Kleur' })).toBeVisible(); // een schermlezer noemt het een link
  await expect(page.locator('.fs-nav[aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('.fs-nav.is-actief')).toHaveCount(0); // de actieve staat zit in aria-current, niet alleen in een klasse

  // Een klik verplaatst aria-current; toetsenbord (Enter) werkt als bij elke link. Status staat in een groep: eerst uitklappen.
  await page.getByRole('button', { name: 'Onderdelen' }).click();
  await page.getByRole('link', { name: 'Status' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Status' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.fs-nav[aria-current="page"]')).toHaveCount(1);
});

/* ---------- Zelfcontrole: een dialoog zonder opmaak meldt zichzelf ---------- */
const stijlFouten = (fouten) => fouten.filter((t) => t.includes('finsera-ui') && t.includes('niet opgemaakt'));

test('dialoog: meldt één keer in de console als components.css niet aankomt', async ({ page }) => {
  const fouten = [];
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  await page.route('**/components.css', (route) => route.abort()); // de opmaak komt niet aan
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');

  await page.click('#dialoog-open');
  await expect(page.locator('#dialoog-nieuw')).toHaveJSProperty('open', true);
  const melding = stijlFouten(fouten);
  expect(melding, 'er hoort een duidelijke melding te komen').toHaveLength(1);
  expect(melding[0]).toContain('components.css');
  expect(melding[0]).toContain('npm update finsera-ui');

  // Een tweede dialoog geeft niet nog een melding.
  await page.keyboard.press('Escape');
  await page.click('#dialoog-verwijder');
  await page.waitForTimeout(200);
  expect(stijlFouten(fouten)).toHaveLength(1);
});

test('zijpaneel: meldt in de console als components.css niet aankomt', async ({ page }) => {
  const fouten = [];
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  await page.route('**/components.css', (route) => route.abort());
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await page.click('[data-dossier="1"]');
  await expect(page.locator('#paneel-dossier')).toHaveJSProperty('open', true);
  expect(stijlFouten(fouten).some((t) => t.includes('fs-zijpaneel'))).toBe(true);
});

test('dialoog en paneel: geen stijlmelding als alles goed staat', async ({ page }) => {
  const fouten = [];
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await page.click('#dialoog-open');
  await expect(page.locator('#dialoog-nieuw')).toHaveJSProperty('open', true);
  await page.keyboard.press('Escape');
  await page.click('[data-dossier="1"]');
  await expect(page.locator('#paneel-dossier')).toHaveJSProperty('open', true);
  await page.click('#dialoog-verwijder');
  await page.waitForTimeout(300);
  expect(stijlFouten(fouten), 'onterechte melding').toEqual([]);
});

/* ---------- Focus op de titel is onzichtbaar, op knoppen en velden wel ---------- */
test('paneel: de titel krijgt focus zonder zichtbare rand; knoppen houden hun focusring', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await page.focus('[data-dossier="1"]');
  await page.keyboard.press('Enter'); // met het toetsenbord openen, dan is :focus-visible het strengst
  await expect(page.locator('#paneel-titel')).toBeFocused();
  expect(await page.locator('#paneel-titel').evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');

  // Een echte knop in het paneel heeft nog wel zijn focusring.
  await page.getByRole('button', { name: 'Paneel sluiten' }).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.getByRole('button', { name: 'Paneel sluiten' }).evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
});

/* ---------- Uitklapbare navigatiegroepen ---------- */
const navKop = (page) => page.getByRole('button', { name: 'Onderdelen' });
const navSub = (page, naam) => page.locator('#nav-onderdelen').getByRole('link', { name: naam });

test('navigatie: groep klapt uit en in met muis en toetsenbord; dichte subitems zijn onbereikbaar', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(navSub(page, 'Status')).toBeHidden();

  await navKop(page).click();
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(navSub(page, 'Status')).toBeVisible();
  await expect(navSub(page, 'Knoppen en velden')).toBeVisible();

  await navKop(page).click();
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(navSub(page, 'Status')).toBeHidden();

  // Toetsenbord: Enter klapt uit, Tab gaat het eerste subitem in, Spatie klapt in.
  await navKop(page).focus();
  await page.keyboard.press('Enter');
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(navSub(page, 'Knoppen en velden')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(navKop(page)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'false');

  // Dicht: Tab slaat de subitems over, ze zijn niet in de tabvolgorde.
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement.closest('#nav-onderdelen')))).toBe(false);
});

test('navigatie: de groep met de huidige pagina is open bij het laden en de kop licht op, ook als hij dicht is', async ({ page }) => {
  await page.goto('/index.html#status');
  await page.waitForSelector('#dossiers table');
  await expect(navKop(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(navSub(page, 'Status')).toHaveAttribute('aria-current', 'page');

  const kleur = (loc) => loc.evaluate((el) => getComputedStyle(el).color);
  const gewoon = await kleur(page.locator('.fs-nav', { hasText: 'Kleur' }).first());
  expect(await kleur(navKop(page)), 'kop licht op als de huidige pagina erin staat').not.toBe(gewoon);
  await navKop(page).click(); // dichtklappen
  await expect(navSub(page, 'Status')).toBeHidden();
  expect(await kleur(navKop(page)), 'ook dichtgeklapt').not.toBe(gewoon);

  // Kiest de gebruiker een ander item, dan verhuist aria-current en blijft de groep zoals hij stond.
  await navKop(page).click();
  await navSub(page, 'Knoppen en velden').click();
  await expect(navSub(page, 'Knoppen en velden')).toHaveAttribute('aria-current', 'page');
  await expect(navSub(page, 'Status')).not.toHaveAttribute('aria-current', 'page');
});

test('nav.js: synchroniseer opent de groep met de huidige pagina; enkel houdt er één open', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  const uitkomst = await page.evaluate(async () => {
    const { maakNavigatie } = await import('/nav.js');
    const groep = (id) => `<div class="fs-nav-groep"><button type="button" class="fs-nav fs-nav--groep" aria-expanded="false" aria-controls="${id}">${id}</button>
      <div class="fs-nav__sub" id="${id}"><div class="fs-nav__sublijst"><a class="fs-nav fs-nav--sub" href="#${id}-1">één</a></div></div></div>`;
    const wortel = document.createElement('nav');
    wortel.innerHTML = groep('a') + groep('b');
    document.body.appendChild(wortel);
    const nav = maakNavigatie(wortel);
    const staat = () => [...wortel.querySelectorAll('.fs-nav--groep')].map((k) => k.getAttribute('aria-expanded'));
    const begin = staat();
    wortel.querySelector('#b a').setAttribute('aria-current', 'page'); // de app wisselt van route
    nav.synchroniseer();
    const naRoute = staat();
    wortel.querySelector('[aria-controls=a]').click(); // gebruiker opent ook a: b blijft open
    const naKlik = staat();
    nav.dispose();

    const enkelWortel = document.createElement('nav');
    enkelWortel.innerHTML = groep('c') + groep('d');
    document.body.appendChild(enkelWortel);
    maakNavigatie(enkelWortel, { enkel: true });
    enkelWortel.querySelector('[aria-controls=c]').click();
    enkelWortel.querySelector('[aria-controls=d]').click();
    const enkel = [...enkelWortel.querySelectorAll('.fs-nav--groep')].map((k) => k.getAttribute('aria-expanded'));
    return { begin, naRoute, naKlik, enkel, subOpen: wortel.querySelector('#b').classList.contains('is-open') };
  });
  expect(uitkomst.begin).toEqual(['false', 'false']);
  expect(uitkomst.naRoute).toEqual(['false', 'true']);
  expect(uitkomst.subOpen).toBe(true);
  expect(uitkomst.naKlik).toEqual(['true', 'true']);
  expect(uitkomst.enkel).toEqual(['false', 'true']);
});

for (const kleur of thema) {
  test(`navigatie: axe met groep dicht en open (desktop en mobiel), ${kleur}`, async ({ browser }) => {
    for (const viewport of [schermen.desktop, schermen.mobiel]) {
      const context = await browser.newContext({ viewport, colorScheme: kleur, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/index.html#status');
      await page.waitForSelector('#dossiers table');
      for (const open of [true, false]) {
        const nu = (await navKop(page).getAttribute('aria-expanded')) === 'true';
        if (nu !== open) await navKop(page).click();
        await expect(navKop(page)).toHaveAttribute('aria-expanded', String(open));
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const samenvatting = violations.map((v) => `${v.id}: ${v.help}\n   ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n   ')}`).join('\n');
        expect(violations, `Fouten (${viewport.width}px, groep ${open ? 'open' : 'dicht'}):\n${samenvatting}`).toEqual([]);
      }
      await context.close();
    }
  });
}

test('navigatie op mobiel: subitems verschijnen als extra tabs in dezelfde balk, zonder horizontale paginascroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: schermen.mobiel });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.waitForSelector('#dossiers table');
  await expect(navSub(page, 'Status')).toBeHidden();
  await navKop(page).click();
  await expect(navSub(page, 'Status')).toBeVisible();
  const kop = await navKop(page).boundingBox();
  const sub = await navSub(page, 'Status').boundingBox();
  expect(Math.abs(kop.y - sub.y), 'subitem staat in dezelfde rij als de kop').toBeLessThan(12);
  expect(sub.x, 'subitem staat achter de kop').toBeGreaterThan(kop.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await navKop(page).click();
  await expect(navSub(page, 'Status')).toBeHidden();
  await context.close();
});
