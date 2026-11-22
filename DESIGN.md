# Ontwerpfilosofie Finsera-dashboards

Een dashboard is een werkplek voor een accountant of kantoormedewerker, geen etalage. Dat bepaalt alles hieronder. Bij twijfel wint de regel die het cijfer sneller leesbaar of betrouwbaarder maakt.

## Principes

1. **Cijfers eerst.** De belangrijkste waarde is het grootste element op de kaart. Decoratie concurreert nooit met data.
2. **Rustig en warm.** Crème canvas, witte kaarten, veel lucht, geen schaduw op kaarten. Schaduw is alleen voor lagen die zweven (menu, dialoog).
3. **Eén accent.** Groen (`--fs-accent`) is voor de primaire actie, de actieve navigatie en reeks 1. Alles anders is neutraal of status.
4. **Kleur is nooit de enige drager.** Elke status heeft tekst of een teken (▲ ▼ ●, label in de badge). Dat geldt ook voor grafieken: legenda met naam, dubbele codering waar reeksen dicht bij elkaar liggen.
5. **Eerlijk over herkomst.** Onder elk cijfer of elke grafiek staat de bron en de peildatum (`.fs-herkomst`). Een cijfer zonder herkomst is een gok.
6. **Lege, laad- en foutstaat zijn onderdeel van het ontwerp.** Elk onderdeel heeft ze alle drie (`.fs-leeg`, `.fs-skelet`, `.fs-melding--fout`).
7. **Licht en donker zijn gelijkwaardig.** Alle componenten werken in beide. Ontwerp nooit alleen in licht.
8. **Rustige beweging.** Alleen overgangen van 180 ms op kleur en een kleine lift op knoppen. `prefers-reduced-motion` schakelt alles uit.

## Cijfers en data

- Cijfers staan rechts, met tabulaire cijfers (`.fs-getal`). Bedragen met duizendtalpunt en komma-decimalen (nl-NL): `€ 12.480,00`.
- Grote KPI's mogen afgerond (`€ 1,24 mln`), tabellen nooit.
- Een verandering krijgt een `fs-delta` met teken en tekst: `▲ 8,2% t.o.v. vorig kwartaal`. Omhoog is niet altijd goed (openstaande facturen): kies `--op` of `--neer` op **betekenis**, niet op richting.
- Grafieken: lijn voor ontwikkeling in de tijd, staaf voor vergelijken, rangorde-balk voor "wie is het grootst". Taart- en donutgrafieken niet. Maximaal zes reeksen, in vaste volgorde `reeks-1` t/m `reeks-6`.
- Begin de y-as van een staafgrafiek op nul.

## Opbouw van een scherm

1. Paginakop (`.fs-paginakop`): titel, één regel context, acties rechts (periode links van de knoppen, primaire knop uiterst rechts).
2. Meldingen die het hele scherm raken.
3. KPI-rij van 3 tot 4 tegels.
4. Hoofdgrafiek (2/3) naast een rangorde of lijst (1/3).
5. Detailtabel onderaan.

Een scherm heeft één primaire knop. Verwijderen en andere onomkeerbare acties vragen altijd om bevestiging.

## Toegankelijkheid

- Tekstcontrast minimaal 4,5:1 (`--fs-tekst-zacht` op `--fs-vlak` haalt dat; laat dat zo).
- Alles bedienbaar met toetsenbord; de focusring is accentkleurig en nooit uitgezet.
- Grafieken krijgen `role="img"` met een `aria-label`; bij belangrijke cijfers staat dezelfde informatie ook als tabel of tekst.
- Tikdoelen minimaal 40 px hoog op mobiel.

## Taal

Nederlands, "je" tegen de gebruiker, korte zinnen. Een knop is een werkwoord (`Dossier aanmaken`), geen `OK`. Foutmeldingen zeggen wat er mis is én wat de gebruiker kan doen.

## Wat niet mag

- Losse hex-waarden of pixelmaten in dashboard-CSS: gebruik een token. Ontbreekt er een, voeg die toe aan `tokens.css`.
- Kale elementen stylen (`button { … }`): gebruik de `fs-`-klassen.
- Gradiënten, gloed, emoji als icoon, meer dan één accentkleur.
- Een eigen variant van een bestaand onderdeel. Past het niet, verbeter het onderdeel hier en laat alle dashboards meeprofiteren.
