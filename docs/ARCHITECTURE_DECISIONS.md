# Architectuurbeslissingen: finsera-ui

Per beslissing: wat is gekozen, waarom, en wat is afgewezen. Bronnen: `LIBRARIES.md`, `DESIGN.md`, `AGENTS.md`, de commitgeschiedenis (`git log`) en het werk van 22 november 2026 aan adressen en navigatie. Onderdelen die vóór of buiten dat werk zijn gebouwd (dialoog, paneel, tabs, toasts, uitklapbare navigatie) zijn hier beschreven zoals de repo ze nu vastlegt; de redenen komen uit de documentatie en commitberichten, niet uit herinnering aan het gesprek.

## 1. Eigen stijl, geleend gedrag
- **Gekozen:** uiterlijk altijd uit `tokens.css` en `components.css`; externe libraries leveren alleen gedrag, toegankelijkheid of rekenkracht (`LIBRARIES.md`).
- **Waarom:** alle dashboards moeten er hetzelfde uitzien en in Preact (Portaal, Boekassistent), React (ui-prototype) en kale HTML werken.
- **Afgewezen:** MUI, Ant Design, Chakra, Bootstrap e.d. (eigen uiterlijk dat we overal moeten overschrijven); shadcn/ui als geheel (Tailwind- en React-gebonden, kopieert code in elk project en laat projecten uiteenlopen); Tremor.

## 2. Gewone CSS met variabelen, geen build
- **Gekozen:** `tokens.css` + `components.css`, `fs-`-klassen (BEM-achtig), licht en donker via `data-theme` of systeemvoorkeur.
- **Waarom:** werkt zonder build en in elk framework; `tailwind-theme.css` is alleen een brug voor Tailwind-projecten.
- **Afgedwongen met:** Stylelint (geen hex, kleurnamen of kleurfuncties buiten `tokens.css`; kleur en lettertype alleen via `var(--fs-…)`; klasse-patroon `fs-…`/`is-…` in `components.css`).

## 3. Native `<dialog>` voor dialoog en zijpaneel
- **Gekozen:** `dialoog.js` en `paneel.js` bouwen op `<dialog>`. De browser regelt focus vangen, Esc en inerte achtergrond.
- **Waarom:** geen dependency en werkt in elke stack. Paneel: niet-modaal (`show()`) vanaf 1200 px zodat de lijst bruikbaar blijft, modaal (`showModal()`) eronder.
- **Afgewezen / reserve:** a11y-dialog of `@zag-js/dialog` blijven alternatieven als native tekortschiet (`LIBRARIES.md`).
- **Uitwerking:** het zijpaneel schuift de pagina op in plaats van erover te liggen (commit `b3e4619`); de titel krijgt programmatisch focus zonder zichtbare rand (`5949b5a`).

## 4. Toast, zijpaneel, dialoog of pagina: een vaste volgorde
- **Gekozen:** kies het lichtste middel (toast → paneel → kleine dialoog/`bevestig()` → grote dialoog met tabs → pagina), met opschaalpad "item → paneel → Alle instellingen… → Open dossier".
- **Waarom:** één vraag bepaalt het: hoeveel aandacht en context heeft de gebruiker nodig? Paneel past bij kleine, omkeerbare wijzigingen die direct gelden; Opslaan-knop of tabs betekent dialoog; moet het een adres hebben, dan pagina.
- **Afgewezen:** dialoog in dialoog (behalve `bevestig()`), tabs of Opslaan-knop in een paneel, toast voor iets dat gelezen moet worden.

## 5. Toasts: vanilla-sonner, gepind op 0.7.0
- **Gekozen:** `toast.js` met vanilla-sonner; `toast.css` met onze tokens; Nederlandse helpers (`melding.succes`, `.ongedaan`, `.belofte`).
- **Waarom:** gewone DOM, dus werkt in alle drie de stacks; officiële Sonner is React-only.
- **Risico:** niet-officiële port van één beheerder. `toast.js` is de enige plek om te vervangen.

## 6. Tabellen: TanStack Table, gepind op 8.21.3
- **Gekozen:** headless logica van TanStack, eigen `.fs-tabel`-opmaak; `tabel.js` voor kale HTML, in React/Preact het adapterpakket met dezelfde kolomdefinities.
- **Waarom gepind:** `latest` op npm is 9.x met een andere API; pas na een bewuste upgrade overstappen.

## 7. Grafieken: Apache ECharts via `charts.js`
- **Gekozen:** ECharts met thema uit de tokens; kleine trendlijnen als inline SVG (`fs-grafiek`, `fs-reeks-1…6`).
- **Afgewezen:** Recharts (React-gebonden), Chart.js (twee grafiekbibliotheken willen we niet), Tremor. Geen taart- of donutgrafieken, maximaal zes reeksen, staafgrafieken beginnen op nul.

## 8. Kwaliteitscontrole in CI
- **Gekozen:** Stylelint 17 + `stylelint-declaration-strict-value`, axe-core via `@axe-core/playwright` (WCAG 2.1 A en AA) in licht, donker, desktop en mobiel; Playwright gepind op 1.65.0 (gelijk aan het Portaal). GitHub Actions draait `npm run check` op Node 24.
- **Waarom Stylelint 17:** 18 vraagt Node 24.15.
- **Bekend gevolg:** de axe-tests vragen internet (CDN) en Chromium; Chromium alleen mist browserverschillen (zie "Safari" in `CLAUDE.md`).

## 9. Adressen en navigatie (22 november 2026, commit `1d09b4e`)
Het Kantoorportaal bouwt als eerste een eigen router (blok 12.4 in `finsera-kern`, `docs/plan-kern.md`); deze repo krijgt alleen wat framework-loos kan.
- **Alleen id's in het adres.** Waarom: een adres komt in browsergeschiedenis, gedeelde links, logs en mails; namen, KvK-nummers en e-mailadressen horen daar niet.
- **Dossier = `/dossiers/<dossier-id>`** met `kern.dossiers.id`: vast, zodat andere apps zonder overleg kunnen linken. Overige paden (`/dossiers`, `/dossiers/nieuw`, `/dossiers/<id>/toegang`, `/auditfile`, `/medewerkers`, `/toewijzingen`, `/gebruik`) zijn het schema van het portaal: voorbeeld voor andere apps, bindend voor de dossier-adressen.
- **Eén melding voor "bestaat niet" en "geen toegang":** "Dit dossier bestaat niet of je hebt er geen toegang toe." Anders kan iemand met een lijst id's testen welke dossiers bestaan.
- **Navigatie is een `<a href>`**, geen knop: Ctrl/Cmd/middelklik, kopiëren en schermlezers werken. Een gewone klik mag client-side navigeren. Document.title per scherm; focus naar de h1 en een `role="status"`-bericht na een routewissel (anders is het een toegankelijkheidsstap terug); terug/vooruit/vernieuwen blijven op dezelfde plek; het `#`-deel blijft gereserveerd voor de uitnodigings- en herstellinks van de kern.
- **`adres.js` is puur** (`leesAdres`, `maakAdres`, `portaalAdressen`), zonder dependency, `window` of `history`. Gekozen details:
  - `maakAdres(naam, params, patronen)` heeft een optionele derde parameter met het portaalschema als standaard (de oorspronkelijke schets had alleen `naam, params`). Tomas heeft dit goedgekeurd.
  - Geen fouten maar `null`: wat niet te lezen of te maken is, geeft `null`, zodat een kapotte link zichtbaar is en geen stil ander scherm opent.
  - Letterlijke stukken winnen van parameters, ongeacht de volgorde; letterlijke stukken worden ongedecodeerd vergeleken (`%6Eieuw` is een id, geen `nieuw`).
  - `maakAdres` controleert zichzelf door het gemaakte pad terug te lezen. `.` en `..` zijn nooit een id, ook niet gecodeerd (`%2e` wordt door elke browser als punt-stuk behandeld).
  - `/` zit niet in `portaalAdressen`: doorverwijzen naar `/dossiers` is een keuze van de app.
- **Afgewezen:** een routerbibliotheek, een Link-component of hook in deze repo (elke app bouwt zelf); het adres tijdens inloggen bewaren of herschrijven (een gedeelde link zonder sessie toont inloggen en leidt daarna vanzelf naar het gevraagde adres).
- **Niet in de axe-test:** focusverplaatsing, `document.title` en klikgedrag, want dat vraagt een router. Dat hoort in de doorloop van de app (voor het Portaal `doorloop/kantoor.spec.ts`). De test hier controleert alleen dat navigatie-items links zijn met één `aria-current="page"`.
- **`fs-alleen-lezer`** (verborgen tekst voor schermlezers) is toegevoegd omdat het `role="status"`-bericht een klasse nodig had en die ontbrak.

## 10. Uitklapbare navigatiegroepen (commit `9058a83`)
- **Gekozen:** de kop van een groep is een `<button>` (`aria-expanded`, `aria-controls`), subitems zijn `<a href>`; dicht is `inert`; maximaal twee niveaus; groep met de huidige pagina is open bij het laden; op mobiel komen subitems als extra tabs in de balk; `maakNavigatie` in `nav.js` voor kale HTML, in React/Preact beheert de app de staat zelf.
- **Waarom:** in- of uitklappen gaat nergens heen, dus een knop is hier juist goed. Subitems hebben eigen adressen en blijven dus links.
- **Afgewezen:** een kop die tegelijk navigeert en uitklapt, groep in groep, groep voor één item, uitklappen bij hover, onthouden welke groepen open stonden.

## 11. Werkwijze met git
- **Gekozen (Tomas, 2026-11-22):** direct op `main`, geen branch of PR, wel altijd eerst `npm run check`, nooit force-push, en na elke push de nieuwe commit-hash noemen. Het Portaal pint op een hash. Tag of versie-bump alleen na akkoord van Tomas.
- **Waarom:** een fast-forward op `main` houdt de hash gelijk aan de gecontroleerde commit. Dit verving de eerdere opdracht "één branch en één PR" (PR 1 is daarom gemerged).
