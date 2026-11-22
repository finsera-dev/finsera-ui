# Finsera UI

Gedeelde stijl, ontwerpfilosofie en onderdelen voor alle Finsera-dashboards. Gewone CSS met variabelen: werkt in React, Preact en kale HTML, zonder build.

| Bestand | Inhoud |
|---|---|
| `tokens.css` | Kleuren (licht en donker), typografie, ruimte, vorm, beweging |
| `components.css` | Alle onderdelen als `fs-`-klassen |
| `charts.js` | Koppeling tokens ↔ Apache ECharts (thema, licht/donker, resize, `euro()`) |
| `tabel.js` | Sorteerbare en filterbare tabel: TanStack Table (8.21.3) met `.fs-tabel`-opmaak |
| `toast.js`, `toast.css` | Toasts: vanilla-sonner (0.7.0) met onze tokens en Nederlandse helpers (`melding.succes`, `melding.fout`, …) |
| `stylelint-config.mjs` | Stylelint-regels die de tokens afdwingen (geen losse kleuren of lettertypes); deelbaar met andere projecten |
| `dialoog.js` | Dialogen op de native `<dialog>`: `open`, `sluit`, `koppel`, `bevestig()` (belofte), tabs en bewaking van niet-opgeslagen wijzigingen, met `fs-dialoog`-opmaak |
| `paneel.js` | Zijpaneel op de native `<dialog>`: niet-modaal op breed, modaal op smal scherm; `koppelPaneel`, `openPaneel`, `sluitPaneel` |
| `tabs.js` | Toegankelijke tabs (ARIA, pijltjestoetsen, Home/End); werkt op de pagina, in een kaart en in een dialoog |
| `tailwind-theme.css` | Tailwind v4-brug: `bg-vlak`, `text-tekst-zacht` enzovoort wijzen naar de tokens |
| `AGENTS.md` | Instructies voor LLM's die een dashboard bouwen: regels, onderdelenlijst, controlelijst |
| `DESIGN.md` | Principes en regels: lees dit eerst |
| `LIBRARIES.md` | Welke externe libraries we adopteren, overwegen of afraden, en waarom |
| `index.html` | Levende documentatie en een compleet voorbeelddashboard (open in de browser) |

## Gebruik

Kopieer niets: verwijs ernaar.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap">
<link rel="stylesheet" href="/pad/naar/finsera-ui/tokens.css">
<link rel="stylesheet" href="/pad/naar/finsera-ui/components.css">
<body class="fs-basis">
```

In een Vite-app: `import 'finsera-ui/tokens.css'; import 'finsera-ui/components.css';` (na `npm i ../finsera-ui` of via een git-dependency). Iconen: Lucide. Toasts: laad `vanilla-sonner/style.css` en daarna `toast.css`; `toast.js` vraagt een importmap of bundler voor `vanilla-sonner@0.7.0`. Tabellen: `tabel.js` vraagt een importmap of bundler voor `@tanstack/table-core@8.21.3`. Grafieken: ECharts via `charts.js` (zie `index.html` voor een werkend voorbeeld; `charts.js` is een ES-module en werkt dus niet vanaf `file://`, open de map via een webserver). Het lettertype Manrope laad je zelf; zonder valt de stack terug op het systeemlettertype.

```jsx
<section className="fs-kaart">
  <div className="fs-kaart__kop"><h2 className="fs-kaart__titel">Omzet</h2></div>
  <button className="fs-knop fs-knop--primair">Exporteren</button>
</section>
```

## Thema

Standaard volgt de library het systeem. Forceren kan met `<html data-theme="light">` of `"dark"`.

## Een bestaand dashboard overzetten

1. Voeg beide stylesheets toe en zet `fs-basis` op `<body>`. Er verandert nog niets: de library stylet geen kale elementen.
2. Vervang per scherm eigen klassen door `fs-`-klassen, te beginnen bij de schil, kaarten en knoppen.
3. Vervang losse kleuren in de eigen CSS door `var(--fs-…)`.
4. Verwijder de oude CSS zodra niets er meer naar verwijst.

## Een onderdeel toevoegen of wijzigen

Eerst in `components.css` en `index.html` (zodat het zichtbaar en in beide thema's te controleren is), dan pas gebruiken. Nieuwe waarden gaan in `tokens.css`. Houd klassen Nederlands, met prefix `fs-`, en `--modifier` voor varianten.

## Afspraken

- Alleen verzonnen data in voorbeelden en tests.
- Tekstcontrast ≥ 4,5:1; controleer elke nieuwe kleur in licht en donker.

## LLM-instructies in een project

Elk project dat met een LLM wordt gebouwd, zegt dat in zijn eigen `CLAUDE.md` (of `AGENTS.md`):

```md
## UI
Gebruik voor alle UI de bibliotheek finsera-ui en volg de regels in `AGENTS.md` daarvan.
Lees die bestanden uit de dependency (`node_modules/finsera-ui/`) of de map ernaast, niet uit je geheugen.
```

Zorg dat `AGENTS.md` meekomt in de dependency door het in `files` van `package.json` op te nemen.

## Controle

```bash
npm install
npm run check        # Stylelint en axe-toegankelijkheidstest (Playwright)
```

- `npm run lint:css`: Stylelint met `stylelint-config.mjs`. Faalt op hex-waarden, kleurnamen en kleurfuncties buiten `tokens.css`, en op kleur- of lettertype-eigenschappen zonder `var(--fs-…)`.
- `npm run test:a11y`: opent `index.html` in licht en donker, op desktop en mobiel, met toasts zichtbaar, en draait axe (WCAG 2.1 A en AA). Vereist internet voor de CDN-bestanden en een Chromium-browser (`npx playwright install chromium`).
- GitHub Actions (`.github/workflows/check.yml`) draait dit bij elke push naar `main` en bij elke pull request.

Een ander project gebruikt dezelfde CSS-regels:

```js
// stylelint.config.mjs  (npm i -D stylelint@17 stylelint-declaration-strict-value)
import config from 'finsera-ui/stylelint-config';
export default config;
```

Stylelint 18 vraagt Node 24.15 of hoger; op oudere Node-versies gebruik je Stylelint 17. De regels lezen alleen `.css`-bestanden, niet de `<style>`-blokken in HTML.
