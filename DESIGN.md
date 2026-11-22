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

Een scherm heeft één primaire knop. Verwijderen en andere onomkeerbare acties vragen altijd om bevestiging. Of een detail in een paneel, dialoog of op een eigen pagina hoort, staat in het volgende hoofdstuk.

## Toast, zijpaneel, dialoog of pagina: wat gebruik je wanneer

Het gaat om één vraag: **hoeveel aandacht en hoeveel context heeft de gebruiker nodig?** Kies het lichtste middel dat de taak aankan, en ga pas naar het volgende niveau als het echt niet past. De getallen hieronder zijn richtlijnen, geen wet; de redenering erachter wel.

| Middel | Waarvoor | Context | Opslaan |
|---|---|---|---|
| **Toast** (`fs-melding` tijdelijk) | Bevestigen van wat de gebruiker net deed ("Opgeslagen") | Niets verandert, niets te beslissen | n.v.t. |
| **Zijpaneel** (`fs-zijpaneel`) | Kijken naar een item en **kleine, veilig omkeerbare** aanpassingen, terwijl de lijst zichtbaar blijft | Blijft: de lijst ernaast is bruikbaar, klik een ander item en het paneel wisselt | **Direct** per wijziging, met feedback en liefst "Ongedaan maken". Geen Opslaan-knop |
| **Kleine dialoog** (`fs-dialoog`) | Eén beslissing of een korte invoer van een paar velden | Weg: de pagina is geblokkeerd | Opslaan en Annuleren |
| **Bevestigingsdialoog** (`bevestig()`) | Vóór iets onomkeerbaars of ingrijpends | Weg | Ja of nee, met de handeling in de knop |
| **Grote dialoog met tabs** (`fs-dialoog--groot`) | **Veel** instellingen die samen één wijziging zijn, waarbij de gebruiker zich even moet concentreren | Weg | Opslaan en Annuleren, met een waarschuwing bij niet-opgeslagen wijzigingen |
| **Eigen pagina** | Veel inhoud, langdurig werk, of iets dat je wilt kunnen delen, bewaren of terugvinden | Eigen context | Naar behoefte |

### Kies zo, in deze volgorde

1. **Hoeft de gebruiker niets te beslissen?** Toast. Is het een boodschap die hij moet lezen of waar actie op volgt, dan is het geen toast maar een blijvende `fs-melding` in de pagina.
2. **Moet de gebruiker de lijst of het overzicht kunnen blijven zien?** Bijvoorbeeld om snel door items te bladeren en per item iets te controleren of aan te passen. Dan **zijpaneel**.
3. **Is het één korte vraag, of is bevestigen nodig voor iets onomkeerbaars?** Kleine dialoog of `bevestig()`.
4. **Zijn het veel instellingen die bij elkaar horen en samen bewaard worden?** Grote dialoog met tabs.
5. **Past het niet in een dialoog, of heeft het een eigen adres nodig?** Eigen pagina.

### Wat bepaalt de keuze

- **Direct of bevestigd?** Een zijpaneel past alleen bij wijzigingen die meteen mogen gelden en die je terug kunt draaien (status, een schakelaar, een label). Zodra er een Opslaan-knop nodig is omdat de wijzigingen samen moeten kloppen, of omdat een tussenstand fout kan zijn, hoort het in een dialoog.
- **Context.** Een paneel behoudt de omgeving: de lijst blijft zichtbaar en bruikbaar. Een dialoog haalt de gebruiker er bewust uit. Heeft de gebruiker de lijst niet nodig, kies dan de dialoog; heeft hij die wel nodig, het paneel.
- **Omvang.** Tot ongeveer vijf velden of schakelaars is een zijpaneel geschikt. Daarboven, of zodra je tabs nodig hebt, wordt het een grote dialoog.
- **Adres.** Moet iemand het kunnen delen, bladwijzeren of met de terugknop kunnen verlaten? Dan is het een pagina, hoe klein het ook lijkt.
- **Risico.** Hoe groter de gevolgen en hoe moeilijker terug te draaien, hoe zwaarder het middel: toast, paneel (omkeerbaar), dialoog (bevestigd), `bevestig()` (onomkeerbaar).

### Het opschaalpad

Begin klein en laat de gebruiker doorklikken wanneer hij meer nodig heeft:

**item aanklikken → zijpaneel** (kijken en snel aanpassen) **→ "Alle instellingen…" → grote dialoog** (alles aanpassen en bewaren) **→ "Open dossier" → pagina** (werken).

Elk niveau heeft één duidelijke knop naar het volgende. Dubbel werk voorkom je door in het paneel alleen de handvol dingen te zetten die mensen het vaakst nodig hebben; de rest staat in de dialoog.

### Wat niet mag

- **Geen dialoog in een dialoog**, behalve een bevestiging (`bevestig()`) of de vraag om wijzigingen weg te gooien.
- **Geen tabs in een zijpaneel.** Heb je tabs nodig, dan is het te veel voor een paneel: gebruik de grote dialoog of een pagina.
- **Geen Opslaan-knop in een zijpaneel.** Wijzigingen daar gelden direct. Heb je Opslaan nodig, gebruik een dialoog.
- **Geen zijpaneel voor een enkele vraag** ("Weet je het zeker?"): dat is een dialoog.
- **Geen dialoog om iets te tonen dat je naast de lijst wilt vergelijken**: dat is een paneel.
- **Geen dialoog of paneel voor iets dat langer dan een paar minuten duurt of waar je naar terug wilt:** maak er een pagina van.
- **Geen toast voor iets dat de gebruiker moet lezen of waar hij op moet reageren.**

### Gedrag dat bij elk middel hoort

- **Zijpaneel:** vanaf 1200 px breed niet-modaal: de pagina schuift op en blijft bruikbaar, zodat het paneel niets bedekt (ook niet de rechterkolommen van een tabel). Onder 1200 px is het modaal, op een telefoon over de volle breedte. Wil je dat het paneel er juist overheen ligt, geef het `fs-zijpaneel--over`. Een ander item aanklikken wisselt de inhoud. Esc sluit en de focus keert terug op het item. Wijzigingen geven feedback via een toast, bij voorkeur met "Ongedaan maken".
- **Dialoog:** altijd modaal, altijd een titel, Esc en Annuleren sluiten. De primaire knop staat rechts en heet naar de handeling. Bij een formulier met wijzigingen vraagt sluiten eerst om bevestiging.
- **Bevestiging van iets onomkeerbaars:** de veilige keuze krijgt de focus, de knop heet naar de handeling ("Dossier verwijderen"), nooit "OK".

### Zo hoort het eruit te zien

Dit is wat je in de browser moet zien. Wijkt het af, dan komt de opmaak niet aan (zie "Ziet het er raar uit?" in `AGENTS.md`); dat is geen reden voor eigen CSS.

- **Dialoog:** afgeronde hoeken (22 px), geen rand, een zachte schaduw en een gedimde pagina erachter. Boven de titel in vet, rechts op dezelfde regel een kruisje. Daaronder de inhoud met royale marge (24 px) die scrolt als het veel is. Onderaan een scheidingslijn en de knoppen rechts: Annuleren links van de primaire knop. Een grote dialoog heeft een vaste hoogte (maximaal 680 px), zodat hij niet verspringt bij het wisselen van tab.
- **Tabs in een dialoog:** direct onder de kop, met dezelfde zijmarge als de inhoud, een dunne lijn eronder en een accentkleurige streep onder de gekozen tab.
- **Zijpaneel:** vast aan de rechterrand, over de volle hoogte, met afgeronde linkerhoeken. De pagina ernaast is smaller geworden en verspringt niet naar achteren. Kop met titel en kruisje, daaronder secties met een klein label in hoofdletters, onderaan één knop naar de volgende stap.
- **Schakelaar:** een glijder (pil met een bolletje), geen aanvinkvakje. Kleur: accent als aan, grijs als uit.
- **Toast:** rechtsonder, een kleur per soort (succes, info, waarschuwing, fout), met tekst; naast een open paneel in plaats van erover.
- **Veld:** witte achtergrond, afgeronde rand, label erboven in een klein grijs vet lettertype.

## Adressen en navigatie

Een dashboard is pas een werkplek als je er een collega naartoe kunt sturen. Elk scherm heeft daarom een eigen adres dat je kunt kopiëren, in een nieuw tabblad kunt openen en kunt delen, en terug, vooruit en vernieuwen blijven op dezelfde plek. Alle apps (Kantoorportaal, Boekassistent en wat er nog komt) volgen dezelfde afspraken, zodat een link uit de ene app in de andere werkt. Hoe de app het bouwt (een eigen router, een hook, een component) is aan de app; de afspraken zijn hier, het kleine pure hulpbestand is `adres.js`.

### Waarom deze afspraken

- **Alleen id's in het adres.** Een adres komt in de geschiedenis van de browser, in gedeelde links, in logs en in mails. Een naam, KvK-nummer of e-mailadres daarin is een gegeven van de klant dat ergens belandt waar het niet hoort. Een id (een uuid zonder betekenis) is dat niet.
- **Een dossier heeft één vast adres: `/dossiers/<dossier-id>`**, met het id uit de kern (`kern.dossiers.id`). Daardoor mag elke andere app er zonder overleg naartoe linken. Wat erachter zit (het scherm met de gegevens) mag veranderen; het adres niet.
- **Een eenvoudig pad per onderdeel.** Het schema van het Kantoorportaal is een voorbeeld voor andere apps; voor de dossier-adressen is het bindend:

  | Adres | Scherm |
  |---|---|
  | `/dossiers` | lijst met dossiers |
  | `/dossiers/nieuw` | nieuw dossier |
  | `/dossiers/<dossier-id>` | één dossier |
  | `/dossiers/<dossier-id>/toegang` | wie toegang heeft tot dit dossier |
  | `/auditfile` | auditfile importeren |
  | `/medewerkers` | medewerkers |
  | `/toewijzingen` | toewijzingen |
  | `/gebruik` | AI-gebruik en budget |

  Het pad is kort, Nederlands, kleine letters, enkelvoud of meervoud zoals je het hardop zegt. Een letterlijk stuk (`nieuw`) wint altijd van een id.
- **"Bestaat niet" en "geen toegang" geven dezelfde melding:** "Dit dossier bestaat niet of je hebt er geen toegang toe." Verschilt de melding, dan kan iedereen met een lijst id's uitproberen welke dossiers bestaan, ook die van andere kantoren. Het scherm verklapt niets.
- **Navigatie is een echte link (`<a href>`), geen knop.** Een link kun je met Ctrl, Cmd of middelklik in een nieuw tabblad openen, kopiëren, bladwijzeren en een schermlezer noemt hem een link. Een gewone klik mag client-side navigeren, zodat het snel blijft. Een knop is voor een actie (iets opslaan, iets verwijderen), een link voor "ga naar".
- **Elk scherm heeft een eigen `document.title`** ("Dossiers · Finsera Kantoorportaal"): het is wat je in tabbladen, in de geschiedenis en bij een schermlezer ziet. Het onderdeel staat voorop, want tabbladen kappen aan het eind af.
- **Na een routewissel gaat de focus naar de hoofdkop (h1)**, met een kort bericht in een `role="status"`-element. Een muisgebruiker ziet de pagina veranderen; een toetsenbord- of schermlezergebruiker merkt zonder dit niets, want de pagina laadt niet opnieuw. Een router die de focus laat staan is een toegankelijkheidsstap terug, en axe vangt dat niet.
- **Terug, vooruit en vernieuwen blijven op dezelfde plek.** Het adres is de enige bron voor "waar ben ik"; de pagina leest het adres en bewaart dat niet apart. Het `#`-deel is gereserveerd voor de uitnodigings- en herstellinks van de kern en wordt niet door de router gelezen of herschreven.
- **Een gedeelde link zonder sessie** toont het inlogscherm, en na inloggen en de tweede stap komt de gebruiker vanzelf op het gevraagde adres uit. Het adres wordt daarvoor niet bewaard of herschreven: het blijft tijdens het inloggen gewoon in de adresbalk staan.

### Wat niet mag

- Geen naam, KvK-nummer, e-mailadres of ander gegeven van de klant in een adres of in `document.title` van een lijstscherm.
- Geen `<button>` of `<div onclick>` voor navigatie, en geen link zonder `href`.
- Geen eigen adres voor een dossier naast `/dossiers/<dossier-id>`.
- Geen verschillende melding voor "bestaat niet" en "geen toegang".
- Geen routewissel zonder verplaatste focus en `role="status"`-bericht.

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
