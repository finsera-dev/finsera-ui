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

## Welk onderdeel waarvoor

| Je wilt | Gebruik |
|---|---|
| Paginaschil met zijbalk | `fs-schil`, `fs-zijbalk`, `fs-nav` (`is-actief`), `fs-merk`, `fs-inhoud` |
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
| Lege of laadstaat | `fs-leeg`, `fs-skelet` |
| Bron en peildatum | `fs-herkomst` onder elk cijfer of elke grafiek |
| Icoon | Lucide (`data-lucide`), geen andere iconenset |

Externe libraries: alleen wat in `LIBRARIES.md` onder "Adopteren" staat. Wil je iets anders, kijk dan eerst of de regels onder "Regels voor een nieuwe library" het toelaten en vraag het aan een mens.

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

## Controlelijst voor je klaar bent

- [ ] `npx stylelint "src/**/*.css"` geeft geen fouten (geen hex-waarden, kleurnamen of kleurfuncties; kleur en lettertype alleen via `var(--fs-…)`)
- [ ] Alleen `fs-`-klassen voor opmaak, geen kale elementen gestyled
- [ ] Werkt in licht én donker (zet `<html data-theme="dark">` en kijk)
- [ ] Werkt op mobiel (smal venster) zonder horizontaal scrollen van de pagina
- [ ] Lege staat, laadstaat en foutstaat bestaan voor elk blok met data
- [ ] Bij elk cijfer en elke grafiek staan bron en peildatum
- [ ] Alles bedienbaar met toetsenbord, focusring zichtbaar; axe-controle (`@axe-core/playwright`, WCAG 2.1 A en AA) geeft geen fouten
- [ ] Teksten in het Nederlands, knoppen zijn werkwoorden
- [ ] Je hebt het scherm daadwerkelijk bekeken in een browser, niet alleen de code geschreven

Uitleg waarom deze regels er zijn staat in `DESIGN.md`. Bij twijfel wint de regel die het cijfer sneller leesbaar of betrouwbaarder maakt.

In deze repo zelf draai je alles met `npm run check` (Stylelint en axe in licht en donker, desktop en mobiel). Een onderdeel dat daar faalt, is niet klaar.
