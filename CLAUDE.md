# CLAUDE.md: finsera-ui

Gedeelde stijl en onderdelen voor alle Finsera-dashboards (Kantoorportaal in `finsera-kern`, Boekassistent, e.d.). Gewone CSS met variabelen plus kleine framework-loze JS-modules: werkt in kale HTML, Preact en React, zonder build. Antwoorden, documentatie, commitberichten en UI-tekst: **Nederlands**.

## Lees dit eerst
- `AGENTS.md`: bindende regels voor wie een dashboard bouwt of wijzigt (harde regels, onderdelenlijst, controlelijst). Volg het letterlijk.
- `DESIGN.md`: het waarom (principes, toast/paneel/dialoog/pagina, adressen en navigatie, "Zo hoort het eruit te zien").
- `LIBRARIES.md`: welke externe libraries mogen. Alleen wat onder "Adopteren" staat; een nieuwe vraagt de regels onderaan én een mens.
- Dit bestand vult die aan; bij tegenspraak wint `AGENTS.md`.

## Architectuur op hoofdlijnen
Eigen stijl, geleend gedrag: uiterlijk komt altijd uit `tokens.css` + `components.css`; een externe library mag alleen gedrag of rekenwerk leveren. Elke module werkt zonder framework en zonder dependency, behalve waar `LIBRARIES.md` er een noemt. **Geen routerbibliotheek, Link-component of hook in deze repo**: elke app bouwt haar eigen router.

## Mappen en bestanden (alles staat in de root)
| Bestand | Rol |
|---|---|
| `tokens.css` | Enige plek voor kleuren, lettertypes, ruimte, hoeken, beweging (licht en donker). Uitzondering op de Stylelint-regels |
| `components.css` | Alle `fs-`-onderdelen (BEM-achtig: `fs-x__deel`, `fs-x--variant`, toestand `is-…`) |
| `index.html` | Levende documentatie én compleet voorbeelddashboard; elk nieuw onderdeel moet hier te zien zijn |
| `charts.js` | Tokens ↔ Apache ECharts (`maakGrafiek`, `euro`) |
| `tabel.js` | TanStack Table (gepind 8.21.3) met `.fs-tabel`; houdt focus bij opnieuw tekenen |
| `toast.js`, `toast.css` | vanilla-sonner (gepind 0.7.0), `melding.succes/fout/ongedaan/belofte` |
| `dialoog.js` | Native `<dialog>`: `koppel`, `open`, `sluit`, `bevestig()`, wijzigingsbewaking |
| `paneel.js` | Zijpaneel op native `<dialog>`: niet-modaal ≥ 1200 px, modaal eronder |
| `tabs.js` | WAI-ARIA tabs (pijltjes, Home/End) |
| `nav.js` | Uitklapbare navigatiegroepen (`maakNavigatie`), `inert` als dicht |
| `adres.js` | **Puur**: `leesAdres(pad, patronen)`, `maakAdres(naam, params, patronen)`, `portaalAdressen` |
| `stylelint-config.mjs` / `stylelint.config.mjs` | Gedeelde tokenregels / config voor deze repo |
| `tests/a11y.spec.mjs` | Playwright + axe (WCAG 2.1 A/AA) en gedragstests |
| `tests/adres.node.mjs` | `node --test` voor `adres.js` |
| `tests/serve.mjs` | Dependency-vrije statische testserver |

Kernlogica zit in `components.css` (opmaak), de losse `*.js`-modules (gedrag) en `adres.js` (adresregels). `package.json` `files` en `exports` moeten elk nieuw bestand noemen dat verspreid wordt.

## Commando's
```bash
npm install                      # Node 24 (CI), Stylelint 17 omdat 18 Node 24.15 vraagt
npx playwright install chromium  # eenmalig, voor de axe-tests
npm run check                    # alles: lint:css + test:adres + test:a11y. Moet groen zijn
npm run lint:css                 # Stylelint op *.css
npm run test:adres               # node --test tests/adres.node.mjs (geen browser nodig)
npm run test:a11y                # Playwright, licht/donker, desktop/mobiel (vereist internet: CDN)
npx playwright test -g "navigatie"   # één groep tests
node tests/serve.mjs 4173        # lokaal bekijken op http://127.0.0.1:4173/index.html
```
Er is geen build en geen aparte dev-server. `index.html` laadt ES-modules: openen via `file://` werkt niet, altijd via de server.

## Vaste regels
- Geen hex-, rgb-, hsl-waarden en geen losse pixelmaten voor kleur, ruimte, hoeken of lettertype buiten `tokens.css`: altijd `var(--fs-…)`. Stylelint dwingt dit af.
- Geen kale elementen stylen; alleen klassen met prefix `fs-` (of `is-` voor toestand).
- Eén accentkleur (`--fs-accent`); geen gradiënten, gloed, emoji als icoon, andere iconenset dan Lucide.
- Hooguit één `fs-knop--primair` per scherm; onomkeerbaar = `bevestig()`.
- Kleur is nooit de enige drager van betekenis; knoppen zijn werkwoorden, nooit "OK"; "je" tegen de gebruiker.
- Alleen verzonnen data in voorbeelden en tests; nooit klantdata.
- **Nieuw onderdeel:** eerst `components.css` + `index.html` (nieuwe waarden in `tokens.css`), dan pas gebruiken, dan `npm run check`. Nooit een eigen variant in een project.
- Navigatie is een `<a href>` met `aria-current="page"`; een knop is alleen een actie (enige uitzondering: de kop van een uitklapbare groep).
- Adressen: alleen id's, dossier = `/dossiers/<dossier-id>` (`kern.dossiers.id`), "bestaat niet" en "geen toegang" tonen exact dezelfde melding.

## Wat Claude NOOIT doet
- Een tag, versie-bump of `npm publish` zonder uitdrukkelijk akkoord van Tomas.
- `git push --force`, de geschiedenis herschrijven, of hooks/CI overslaan.
- Wijzigen in `finsera-kern`, `jaarrekening-ai` of `boekassistent` vanuit een finsera-ui-taak: zet het als voorstel in een bericht dat Tomas doorgeeft.
- Een routerbibliotheek, Link-component, hook of ander framework-code toevoegen.
- Een externe library toevoegen buiten `LIBRARIES.md`; geheimen, API-sleutels of klantdata opnemen.
- Een falende test of Stylelint-regel uitzetten om groen te worden.
- Eigen `dialog {}`, `.modal`, `!important` of gekopieerde CSS als oplossing voor "ziet er raar uit" (zie `AGENTS.md`).

## Git
- Werk **direct op `main`**, geen branch of PR (afspraak Tomas, 2026-11-22). Eerst `npm run check`, dan committen en pushen (fast-forward), nooit force.
- Identiteit: `finsera-dev <info@finsera.nl>` (staat al in de lokale git-config). Commitberichten in het Nederlands, eerste regel zegt wat er bij komt.
- Het Portaal pint op een **commit-hash**: noem na elke push de nieuwe hash (`git rev-parse HEAD`).
- Commit niet zonder dat Tomas heeft gevraagd of akkoord is gegaan.

## Valkuilen
- **Axe en Playwright vragen internet:** ECharts, Lucide, TanStack en vanilla-sonner komen van een CDN (`index.html`). Zonder netwerk faalt `test:a11y` zonder dat de code stuk is.
- **Bestandsnaam van node-tests:** `tests/adres.node.mjs`, bewust zonder `.test.`/`.spec.`. Playwright (`testDir: tests`) pakt anders elk `*.test.mjs` op en faalt.
- **Safari/dev-cache:** een verouderde CSS-chunk geeft een half opgemaakte dialoog. Oplossing staat onder "Ziet het er raar uit?" in `AGENTS.md`; bouw niets na voordat je dat doorlopen hebt.
- **Dialoog:** titel met `tabindex="-1"` krijgt programmatisch focus zonder zichtbare rand (bewust). Tabknoppen hebben `type="button"`. Geen dialoog in een dialoog behalve `bevestig()`.
- **Paneel:** vanaf 1200 px schuift de pagina op; brede tabellen horen in `fs-tabelrand`, geen vaste breedtes.
- **`adres.js`:** `leesAdres('/')` geeft `null` (het portaal verwijst zelf door naar `/dossiers`); `maakAdres` geeft `null` voor een id dat geen pad kan worden (leeg, `.`, `..`, los surrogaat, `nieuw`) en gooit nooit een fout. Het `#`-deel van een adres wordt genegeerd: dat is gereserveerd voor de uitnodigings- en herstellinks van de kern.
- **Niet in de axe-test:** focus naar de h1, `document.title` en Ctrl/Cmd/middelklik na een routewissel. Dat vraagt een router en hoort in de doorloop van de app.
- Lokaal runnen in de Claude-app: `.claude/launch.json` staat buiten de repo (in `WorkDir/.claude/`), niet in git.

## Recente beslissingen
Zie `docs/ARCHITECTURE_DECISIONS.md` (keuzes en afgewezen alternatieven) en `docs/HANDOVER_STATUS.md` (stand van zaken, openstaande taken).
