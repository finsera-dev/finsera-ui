# Instructies voor LLM's: Finsera UI

Dit bestand is voor jou als je een Finsera-dashboard bouwt of wijzigt. Volg het letterlijk. De mensen achter het project hebben één herkenbare stijl nodig in alle dashboards; jouw eigen smaak is hier niet gevraagd.

## Werkvolgorde

1. Lees `components.css` (alle onderdelen) en `tokens.css` (alle waarden). Open of lees `index.html`: dat is het voorbeeld van een compleet scherm.
2. Bouw het scherm met bestaande `fs-`-klassen. Zoek eerst of het onderdeel al bestaat.
3. Ontbreekt er iets? Voeg het eerst toe aan `components.css` en `index.html` in **deze** repo (nieuwe waarden in `tokens.css`), en gebruik het daarna. Maak nooit een eigen variant in het project.
4. Loop aan het eind de controlelijst hieronder af.

Is dit bestand in een ander project opgehaald, lees dan de bestanden uit de `finsera-ui`-map of -dependency, niet uit je geheugen.

## Harde regels

- Geen hex-, rgb- of hsl-waarden en geen losse pixelmaten voor kleur, ruimte, hoeken of lettertype. Altijd `var(--fs-…)`.
- Style geen kale elementen (`button`, `table`, `input`, `h1`). Gebruik klassen met prefix `fs-`.
- `<body class="fs-basis">`, geladen met eerst `tokens.css` en dan `components.css`.
- Precies één accentkleur (`--fs-accent`). Geen gradiënten, gloed, emoji als icoon of extra kleuren.
- Per scherm hooguit één `fs-knop--primair`. Onomkeerbare acties vragen om bevestiging.
- Kleur is nooit de enige drager van betekenis: bij status staat altijd tekst of een teken (▲ ▼ ●).
- Tekst in het Nederlands, "je" tegen de gebruiker. Knoppen zijn werkwoorden (`Dossier aanmaken`), nooit `OK`. Foutmeldingen zeggen wat er mis is én wat de gebruiker kan doen.
- Alleen verzonnen data in voorbeelden en tests, nooit klantdata.
- Een navigatie-item is een link (`<a href>`), een knop is alleen een actie. Zie "Adressen en navigatie".

## Welk onderdeel waarvoor

| Je wilt | Gebruik |
|---|---|
| Paginaschil met zijbalk | `fs-schil`, `fs-zijbalk`, `fs-nav` (een `<a href>` met `aria-current="page"`), `fs-merk`, `fs-inhoud` |
| Paginatitel met acties | `fs-paginakop` met `fs-acties` |
| Blok inhoud | `fs-kaart` (`__kop`, `__titel`, `__sub`), compacter: `fs-kaart--compact` |
| Kerncijfer | `fs-kpi` (`__label`, `__waarde`, `__voet`) met `fs-delta--op` / `--neer` / `--vlak` |
| Rijen en kolommen | `fs-raster` (`--2-1`, `--1-1`), `fs-stapel`, `fs-rij` |
| Knop | `fs-knop` + `--primair`, `--tekst`, `--gevaar`, `--klein`, `--icoon` |
| Invoer | `fs-veld` om `fs-invoer` / `fs-select`; fout: `aria-invalid="true"` + `fs-veld__fout`; vinkje: `fs-vink` |
| Korte keuze (periode) | `fs-segment`; secties binnen een scherm: `fs-tabs` |
| Status of label | `fs-badge` + `--succes`, `--info`, `--waarschuwing`, `--fout`, `--accent` |
| Boodschap aan de gebruiker | `fs-melding` + `--succes`, `--waarschuwing`, `--fout` (fout met `role="alert"`) |
| Tabel | `fs-tabelrand` > `fs-tabel`; getallen `fs-getal`; sorteren en filteren via `tabel.js` |
| Voortgang of rangorde | `fs-meter`, `fs-rangorde` |
| Grafiek | ECharts via `charts.js` (`maakGrafiek`, `euro`); kleine trendlijn: inline SVG met `fs-grafiek` en `fs-reeks-1…6` |
| Legenda | `fs-legenda` met `fs-reeks-N` per item |
| Tijdelijke bevestiging (opgeslagen, hersteld) | `melding` uit `toast.js` (`succes`, `info`, `waarschuwing`, `fout`, `ongedaan`, `belofte`); iets dat de gebruiker moet lezen of waar actie op volgt is geen toast maar een blijvende `fs-melding` |
| Dialoog | Native `<dialog class="fs-dialoog">` met `__kop`, `__inhoud`, `__acties` en `aria-labelledby`; openen met `open()` uit `dialoog.js`. Bevestigen vóór iets onomkeerbaars: `await bevestig({ titel, tekst, bevestigtekst, gevaarlijk: true })`. Knop heet naar de handeling, nooit "OK" |
| Instellingen in een grote dialoog (klik op een item, pas aan) | `<dialog class="fs-dialoog fs-dialoog--groot" data-bewaak-wijzigingen>` met één `<form method="dialog">`, `__kop` (titel + `__sub`), `__tabs` met `fs-tabs`, `__inhoud` met `role="tabpanel"`-panelen en `__acties`. Tabknoppen krijgen `type="button"`. Schakelaars: `fs-schakelaar`. Zie `index.html` voor het compleet voorbeeld |
| Tabs | `fs-tabs` met `role="tablist"`, `role="tab"` (`aria-controls`, `aria-selected`) en `role="tabpanel"`; gedrag via `maakTabs()` uit `tabs.js` |
| Naam in een tabelrij die een dialoog opent | `<button type="button" class="fs-koppeling" aria-haspopup="dialog">` |
| Zijpaneel (klik op een item, kijk en pas snel aan) | `<dialog class="fs-zijpaneel" aria-labelledby>` met `__kop` (titel met `tabindex="-1"`, kruisje met `data-sluit`), `__inhoud` met `__sectie`, en `__acties`; openen met `openPaneel(el, { focusTerug })` uit `paneel.js` na `koppelPaneel(el)`. Overzicht als `<dl class="fs-kenmerken">`, instellingen als `fs-veld` en `fs-schakelaar`. Geef een gekozen item `aria-current="true"` |
| Adres lezen of maken (pad ↔ route) | `leesAdres(pad, patronen)` en `maakAdres(naam, params, patronen)` uit `adres.js`; schema van het Kantoorportaal: `portaalAdressen`. Een router bouwt de app zelf |
| Bericht voor schermlezers (na een routewissel) | `fs-alleen-lezer` met `role="status"` |
| Lege of laadstaat | `fs-leeg`, `fs-skelet` |
| Bron en peildatum | `fs-herkomst` onder elk cijfer of elke grafiek |
| Icoon | Lucide (`data-lucide`), geen andere iconenset |

Externe libraries: alleen wat in `LIBRARIES.md` onder "Adopteren" staat. Wil je iets anders, kijk dan eerst of de regels onder "Regels voor een nieuwe library" het toelaten en vraag het aan een mens.

## Toast, zijpaneel, dialoog of pagina

Kies het lichtste middel dat de taak aankan; de uitleg staat in `DESIGN.md`. Neem deze volgorde:

1. Geen beslissing nodig, alleen bevestigen wat net gebeurde → **toast** (`melding.succes(...)`). Iets dat de gebruiker moet lezen of waar actie op volgt → blijvende `fs-melding`.
2. De gebruiker moet de lijst blijven zien en per item snel iets bekijken of aanpassen → **zijpaneel** (`fs-zijpaneel`, `paneel.js`). Wijzigingen gelden **direct** met een toast (liefst `melding.ongedaan`). **Geen Opslaan-knop, geen tabs.** Maximaal ongeveer vijf velden.
3. Eén korte vraag of een paar velden → **kleine dialoog** (`fs-dialoog`). Onomkeerbaar of ingrijpend → `bevestig()`.
4. Veel instellingen die samen bewaard worden → **grote dialoog met tabs** (`fs-dialoog--groot`, `data-bewaak-wijzigingen`).
5. Past het niet, duurt het lang of moet het een eigen adres hebben → **pagina**.

Opschaalpad: item aanklikken → zijpaneel → knop "Alle instellingen…" → grote dialoog → knop "Open dossier" → pagina. Elk niveau heeft één knop naar het volgende.

Nooit: een dialoog in een dialoog (behalve `bevestig()`), tabs in een zijpaneel, een Opslaan-knop in een zijpaneel, een zijpaneel voor één ja/nee-vraag, een toast voor iets dat gelezen of beantwoord moet worden.

## Adressen en navigatie

Het waarom staat in `DESIGN.md`. Regels voor elke app met schermen:

- **Alleen id's in het adres**, nooit namen, KvK-nummers of e-mailadressen.
- **Een dossier heeft het vaste adres `/dossiers/<dossier-id>`**, met het id uit de kern (`kern.dossiers.id`). Andere apps mogen daarnaar linken; verzin geen tweede adres voor een dossier.
- **Onderdelen hebben een eenvoudig pad.** Schema van het Kantoorportaal (voorbeeld voor andere apps; bindend voor de dossier-adressen): `/dossiers`, `/dossiers/nieuw`, `/dossiers/<id>`, `/dossiers/<id>/toegang`, `/auditfile`, `/medewerkers`, `/toewijzingen`, `/gebruik`. In code: `portaalAdressen` in `adres.js`.
- **"Bestaat niet" en "geen toegang" geven exact dezelfde melding:** "Dit dossier bestaat niet of je hebt er geen toegang toe." Ook een onbekend pad. Het scherm verklapt niet welke id's bestaan.
- **Navigatie is een echte `<a href>`, geen `<button>`.** Een gewone klik mag client-side navigeren; Ctrl, Cmd, Shift en middelklik (en elke klik op een link met `target`) laat je met rust, zodat het adres gewoon opent. Het huidige item krijgt `aria-current="page"`. Een knop is alleen voor een actie.
- **Per scherm een `document.title`** in de vorm `Onderdeel · Finsera Kantoorportaal` (pas de appnaam aan).
- **Na een routewissel gaat de focus naar de hoofdkop (`h1`, met `tabindex="-1"`)**, met een kort bericht (`Dossiers`) in een `role="status"`-element (`fs-alleen-lezer`). Zonder dat is het een toegankelijkheidsstap terug.
- **Terug, vooruit en vernieuwen blijven op dezelfde plek.** Het adres is de enige bron voor het scherm. Het `#`-deel is gereserveerd voor de uitnodigings- en herstellinks van de kern: de router leest het niet en herschrijft het niet.
- **Een gedeelde link zonder sessie** toont het inlogscherm en leidt na inloggen en de tweede stap vanzelf naar het gevraagde adres. Bewaar of herschrijf het adres niet tijdens inloggen.

`adres.js` doet alleen het pure deel: `leesAdres('/dossiers/d-1')` geeft `{ naam: 'dossier', params: { id: 'd-1' } }` of `null`; `maakAdres('dossier', { id })` geeft het pad met gecodeerde id of `null`. Een id met een spatie, slash, `%` of unicode wordt gecodeerd en geeft nooit een ander pad of een fout. Geen router, link-component of hook in deze repo: die bouwt elke app zelf (Preact, React of kale HTML), met `adres.js` of een eigen kopie van dezelfde regels.

## Cijfers en grafieken

- Bedragen in nl-NL (`€ 12.480,00`); KPI's mogen afgerond (`€ 1,24 mln`), tabellen nooit. Getallen rechts uitgelijnd met tabulaire cijfers.
- Een verandering krijgt een `fs-delta` met teken én tekst. Kies `--op` of `--neer` op **betekenis** (meer openstaande facturen is slecht), niet op richting.
- Lijn voor tijd, staaf om te vergelijken, `fs-rangorde` voor "wie is het grootst". Geen taart- of donutgrafieken. Maximaal zes reeksen in vaste volgorde. Staafgrafieken beginnen op nul.
- Elke grafiek heeft een legenda met namen, `role="img"` met `aria-label`, en bron plus peildatum.

## Opbouw van een scherm

1. `fs-paginakop` (periode links van de knoppen, primaire knop uiterst rechts)
2. Meldingen die het hele scherm raken
3. Rij van 3 tot 4 `fs-kpi`
4. Hoofdgrafiek (2/3) naast een rangorde of lijst (1/3)
5. Detailtabel onderaan

## Dialogen en panelen in React of Preact

De dialoog en het paneel zijn gewone DOM (native `<dialog>`) met helpers in `dialoog.js` en `paneel.js`. In een component werkt dit patroon (zie ook `index.html`):

- Render de `<dialog class="fs-dialoog …">` met een portal naar `document.body`. Zo staat hij nooit in een formulier van de pagina.
- Eén `<form method="dialog">` om alles heen, met daarin `fs-dialoog__kop`, eventueel `fs-dialoog__tabs`, `fs-dialoog__inhoud` en `fs-dialoog__acties`. Titel links en kruisje (`data-sluit`, `aria-label="Sluiten"`) rechts **in dezelfde `__kop`**, nooit eronder.
- Na het mounten: `koppel(el)` en dan `open(el)`. Bij unmount: de functie die `koppel` teruggaf aanroepen en `el.close()` als hij nog open is. Reageer op het `close`-event en lees `el.returnValue`.
- Velden in een dialoog met `data-bewaak-wijzigingen` hebben een `name`: de bewaking vergelijkt benoemde velden.
- Tabknoppen hebben `type="button"`. `aria-selected` en `hidden` beheert `tabs.js`; maak daar geen eigen React-toestand voor.
- Maten: klein = `fs-dialoog`, ruimer = `fs-dialoog fs-dialoog--breed`, instellingen met tabs = `fs-dialoog fs-dialoog--groot`. Verzin geen eigen classes in plaats daarvan.
- Zet het paneel net zo op: portal, `koppelPaneel(el)` eenmalig, `openPaneel(el, { focusTerug })` bij elke selectie. Vanaf 1200 px schuift de pagina op (de inhoud moet dus mee kunnen krimpen: geef brede tabellen een `fs-tabelrand` zodat ze horizontaal scrollen en gebruik geen vaste breedtes); onder 1200 px is het paneel modaal.

## Ziet het er raar uit?

Een dialoog, paneel of toast hoort eruit te zien zoals beschreven in `DESIGN.md`, "Zo hoort het eruit te zien". Is dat niet zo, dan is dat bijna nooit de markup maar **opmaak die niet aankomt**. Herken het zo:

- De dialoog is vierkant met een zwart-wit randje, het kruisje staat op een eigen regel onder de titel, tabs en knoppen staan zonder ruimte onder elkaar of links, en schakelaars zijn gewone aanvinkvakjes.
- De console meldt: `finsera-ui: "fs-dialoog" is niet opgemaakt …` (`dialoog.js` en `paneel.js` melden dit zelf, één keer).

Onderzoek in deze volgorde, en **bouw niets na** voordat je weet waar het aan ligt:

1. Staan `finsera-ui/tokens.css` en daarna `finsera-ui/components.css` in de pagina (`layout.tsx` of `main.tsx`)? Zijn de Network-aanvragen voor beide 200 en bevat de CSS `.fs-dialoog`?
2. Is `finsera-ui` actueel? Zoek `fs-dialoog` en `fs-schakelaar` in `node_modules/finsera-ui/components.css`. Ontbreken ze, dan is de dependency verouderd: `npm update finsera-ui` en controleer dat `package-lock.json` naar de nieuwste commit wijst.
3. Staat er een verouderde cache? Stop de dev-server, verwijder de buildmap (`rm -rf .next`, of `node_modules/.vite`), start opnieuw en herlaad hard (Safari: Ontwikkel › Caches legen, ⌥⌘E, dan ⌘R).
4. Is het alleen in één browser anders, bijvoorbeeld Safari? Reproduceer het dan in die browser (Playwright WebKit) en meld het als probleem in finsera-ui, met de browserversie en een schermafbeelding.

Nooit als oplossing: een eigen `dialog { … }`-regel, een eigen `.modal`, `!important`, CSS uit de library kopiëren naar het project, of de component vervangen door eigen markup. Dan loopt het project uit de pas met alle andere dashboards.

## Controlelijst voor je klaar bent

- [ ] `npx stylelint "src/**/*.css"` geeft geen fouten (geen hex-waarden, kleurnamen of kleurfuncties; kleur en lettertype alleen via `var(--fs-…)`)
- [ ] Alleen `fs-`-klassen voor opmaak, geen kale elementen gestyled
- [ ] Werkt in licht én donker (zet `<html data-theme="dark">` en kijk)
- [ ] Werkt op mobiel (smal venster) zonder horizontaal scrollen van de pagina
- [ ] Lege staat, laadstaat en foutstaat bestaan voor elk blok met data
- [ ] Bij elk cijfer en elke grafiek staan bron en peildatum
- [ ] Alles bedienbaar met toetsenbord, focusring zichtbaar; axe-controle (`@axe-core/playwright`, WCAG 2.1 A en AA) geeft geen fouten
- [ ] Navigatie is een `<a href>` met `aria-current="page"`, niet een `<button>`; elk scherm heeft een `document.title`; na een routewissel staat de focus op de `h1` en komt er een `role="status"`-bericht
- [ ] Een dossier-adres bevat alleen het id, en "bestaat niet" en "geen toegang" tonen dezelfde melding
- [ ] Teksten in het Nederlands, knoppen zijn werkwoorden
- [ ] Je hebt het scherm daadwerkelijk bekeken in een browser, niet alleen de code geschreven; open daarbij elke dialoog, elk paneel en een toast en vergelijk ze met "Zo hoort het eruit te zien" in `DESIGN.md`
- [ ] Gebruikt de gebruiker Safari of een andere browser dan Chromium? Controleer dan ook daarin, want testen alleen in Chromium mist verschillen

Uitleg waarom deze regels er zijn staat in `DESIGN.md`. Bij twijfel wint de regel die het cijfer sneller leesbaar of betrouwbaarder maakt.

In deze repo zelf draai je alles met `npm run check` (Stylelint, `node --test` voor `adres.js`, en axe in licht en donker, desktop en mobiel). Een onderdeel dat daar faalt, is niet klaar.
