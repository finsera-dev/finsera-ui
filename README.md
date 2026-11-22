# Finsera UI

Gedeelde stijl, ontwerpfilosofie en onderdelen voor alle Finsera-dashboards. Gewone CSS met variabelen: werkt in React, Preact en kale HTML, zonder build.

| Bestand | Inhoud |
|---|---|
| `tokens.css` | Kleuren (licht en donker), typografie, ruimte, vorm, beweging |
| `components.css` | Alle onderdelen als `fs-`-klassen |
| `charts.js` | Koppeling tokens ↔ Apache ECharts (thema, licht/donker, resize, `euro()`) |
| `tabel.js` | Sorteerbare en filterbare tabel: TanStack Table (8.21.3) met `.fs-tabel`-opmaak |
| `tailwind-theme.css` | Tailwind v4-brug: `bg-vlak`, `text-tekst-zacht` enzovoort wijzen naar de tokens |
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

In een Vite-app: `import 'finsera-ui/tokens.css'; import 'finsera-ui/components.css';` (na `npm i ../finsera-ui` of via een git-dependency). Iconen: Lucide. Tabellen: `tabel.js` vraagt een importmap of bundler voor `@tanstack/table-core@8.21.3`. Grafieken: ECharts via `charts.js` (zie `index.html` voor een werkend voorbeeld; `charts.js` is een ES-module en werkt dus niet vanaf `file://`, open de map via een webserver). Het lettertype Manrope laad je zelf; zonder valt de stack terug op het systeemlettertype.

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
