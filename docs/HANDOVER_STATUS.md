# Overdracht: stand van zaken finsera-ui

Peildatum: 2026-11-27, `main` op `9058a83` (gelijk aan `origin/main`, werkboom schoon voor de nu nieuwe docs-bestanden). Package `finsera-ui` versie 0.1.0, `private`, geen tags. Bron: repo, `git log` en `npm run check` van 22 november (27 axe-tests en 10 `node --test`-tests groen op de stand na `1d09b4e`; na `9058a83` is de volledige suite niet door mij opnieuw gedraaid, wel de navigatietests, 6 van 6 groen).

## Af
- Tokens (licht en donker), onderdelen in `components.css`, `index.html` als voorbeelddashboard, `charts.js`, `tabel.js`, `toast.js`/`toast.css`, `tailwind-theme.css`.
- Dialoog (`dialoog.js`: `bevestig()`, grote dialoog met tabs en wijzigingsbewaking), `tabs.js`, zijpaneel (`paneel.js`, schuift de pagina op vanaf 1200 px), schakelaar en `fs-koppeling`.
- Kwaliteitscontrole: Stylelint-tokenregels, axe met Playwright, CI in `.github/workflows/check.yml`.
- Adressen en navigatie (PR 1, gemerged, commit `1d09b4e`): afspraken in `DESIGN.md` en `AGENTS.md`, `adres.js` met tests, `fs-nav` als `<a href>` met `aria-current="page"`, `fs-alleen-lezer`.
- Uitklapbare navigatiegroepen (`nav.js`, `fs-nav-groep`) en bredere inhoud (`--fs-pagina-max` 1760 px).
- Documentatie voor React/Preact-gebruik van dialoog en paneel en de checklist "Ziet het er raar uit?" (Safari/dev-cache).
- Dit overdrachtspakket: `CLAUDE.md`, `docs/`, `.claude/skills/` (nog niet gecommit, wacht op controle van Tomas).

## Half af (WIP)
- Niets openstaand in de werkboom. Wel een afhankelijkheid buiten deze repo: **het Portaal moet `adres.js` nog overnemen.** Het schrijft de logica eerst zelf als `src/adres.ts` (blok 12.4 in `finsera-kern`, `docs/plan-kern.md`) en neemt `adres.js` later over. Dat gebeurt pas na een akkoord op de API (zie Besluiten) en op een gepinde commit-hash.

## Bekende bugs en beperkingen
- Geen open bugs bekend in de repo of bij mij. Dit is geen garantie: er is geen issue-tracker doorzocht.
- `npm run test:a11y` faalt zonder internet (CDN voor ECharts, Lucide, TanStack, vanilla-sonner, lettertype).
- Testdekking mist: focus naar de h1, `document.title`, `role="status"`-bericht en Ctrl/Cmd/middelklik na een routewissel (vraagt een router; hoort in de doorloop van de app). Alleen Chromium getest; Safari alleen handmatig (zie `AGENTS.md`).
- Niet in `index.html` als voorbeeld: een scherm met de neutrale melding "Dit dossier bestaat niet of je hebt er geen toegang toe." en een demo van `adres.js` (alleen de nav-links en een verborgen `role="status"`-element zijn zichtbaar in de markup).
- `docs/` is nieuw en niet in `files` van `package.json`; bedoeld voor het team, niet voor verspreiding.

## Open besluiten voor Tomas
- Tomas heeft de API van `adres.js` goedgekeurd zoals opgeleverd (derde parameter `patronen`, `null` in plaats van fouten, `/` niet in `portaalAdressen`). Het Portaal-team (`src/adres.ts`) moet nog laten weten of het zo past; zo niet, dan eventueel `maakRouter(patronen)`.
- De regel "pad is kort, Nederlands, kleine letters, enkelvoud of meervoud zoals je het hardop zegt" in `DESIGN.md` is door Claude toegevoegd en stond niet in de opdracht; schrappen als je dat te veel vindt.
- Versienummer en tag: bewust nog niet gezet. Pas na akkoord van Tomas.

## Eerstvolgende geplande taken
1. Controleren en committen van dit overdrachtspakket (na akkoord van Tomas), en de nieuwe hash doorgeven.
2. Voorstellen voor andere repo's (niet door Claude uit te voeren, door Tomas door te geven):
   - `finsera-kern`: `src/adres.ts` laten aansluiten op de tests van `tests/adres.node.mjs`, of `adres.js` overnemen; route-namen `dossier`, `dossierToegang` enz. gelijk houden.
   - `jaarrekening-ai` en `boekassistent`: bericht met `/dossiers/<dossier-id>` (`kern.dossiers.id`) als bindend adres, en de vraag of hun eigen adresschema een dossier-id toelaat.
   - Alle apps: `fs-alleen-lezer` en de nieuwe `components.css` oppakken voor het `role="status"`-bericht.
3. Na het Portaal-werk: een doorloop-test daar voor focus, titel en klikgedrag; overwegen of een voorbeeldscherm met de neutrale melding in `index.html` hoort.
4. Optioneel: `npm run check` opnieuw volledig draaien op de actuele `main` en het resultaat hier noteren.

## Handige feiten voor de volgende sessie
- Lokaal bekijken: `node tests/serve.mjs 4173`, dan `http://127.0.0.1:4173/index.html`.
- Git-identiteit staat lokaal op `finsera-dev <info@finsera.nl>`; `gh` is ingelogd als `finsera-dev`.
- Skills in deze repo: `.claude/skills/onderdeel-toevoegen` en `.claude/skills/publiceren-op-main`.
