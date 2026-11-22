# Externe libraries

Uitgangspunt: **eigen stijl, geleende gedrag.** Het uiterlijk komt uit `tokens.css` en `components.css`; een externe library mag het gedrag, de toegankelijkheid of de rekenkracht leveren, nooit het uiterlijk bepalen. Alles hieronder moet werken in onze drie stacks: Preact (Portaal, Boekassistent), React (ui-prototype) en kale HTML.

Bron voor een deel van de kandidaten: [awesome-ui-components](https://github.com/awelist/awesome-ui-components). Wat daar niet in staat (grafieken, tabellen, positionering) is aangevuld.

## Adopteren (nu in gebruik)

| Behoefte | Library | Waarom |
|---|---|---|
| Iconen | **Lucide** (uit de lijst) | Eén consistente lijnstijl, ISC-licentie, werkt als losse SVG, UMD, React of Preact. ui-prototype gebruikt het al. Alleen Lucide gebruiken: geen mix met andere sets. |
| Grafieken | **Apache ECharts** | Staaf, lijn, gestapeld, heatmap, treemap en grote datasets in één library; geen React nodig; SVG-renderer voor scherp afdrukken. Gekoppeld aan de tokens via `charts.js`, dus licht en donker kloppen vanzelf. |
| Datatabellen | **TanStack Table** (headless) | Logica voor sorteren en filteren; wij leveren `.fs-tabel`. `tabel.js` is de kale-HTML-variant; in React of Preact gebruik je dezelfde kolomdefinities met het adapterpakket van TanStack. **Gepind op 8.21.3**: `latest` op npm is inmiddels 9.x met een andere API; stap pas over na een bewuste upgrade. Zeer grote tabellen: plus TanStack Virtual. |
| Toasts | **vanilla-sonner** (port van Sonner) | Tijdelijke bevestigingen, stapelen, swipe, toetsenbord en `aria-live`. Werkt in kale HTML, Preact en React omdat het gewone DOM is; uiterlijk komt uit `toast.css` en onze tokens, gedrag uit `toast.js`. **Gepind op 0.7.0.** Let op: dit is een niet-officiële port van één beheerder; het officiële Sonner is React-only. Loopt de port vast, dan is `toast.js` de enige plek om te vervangen. |
| Kwaliteitscontrole | **Stylelint** + **stylelint-declaration-strict-value**, **axe-core** via **@axe-core/playwright** | Maakt de regels uit `AGENTS.md` afdwingbaar in CI: geen losse kleuren, WCAG 2.1 A en AA in licht, donker, desktop en mobiel. Playwright is gepind op 1.65.0 (zelfde als het Portaal); Stylelint op 17 omdat 18 Node 24.15 vraagt. |
| Dialogen | **Native `<dialog>`** (geen library) | De browser regelt focus vangen, Esc en een inerte achtergrond. `dialoog.js` en `fs-dialoog` voegen sluiten bij klik ernaast, `bevestig()` en onze opmaak toe. Tabs staan in `tabs.js` (WAI-ARIA-patroon) en de wijzigingsbewaking in `dialoog.js`. Overwogen alternatieven als dit tekortschiet: a11y-dialog (klein, kale HTML) of `@zag-js/dialog`. |
| Tailwind-projecten | **`tailwind-theme.css`** (eigen brug) | Laat `bg-vlak`, `text-tekst-zacht` enzovoort naar onze tokens wijzen, zodat een Tailwind-dashboard dezelfde kleuren heeft. |

## Overwegen (kies bij de eerste echte behoefte)

| Behoefte | Library | Wanneer |
|---|---|---|
| Select, combobox, datumkiezer, tooltip, popover | **Ark UI** of **Radix** (uit de lijst; headless, toegankelijk) | Alleen voor wat native HTML niet kan. Preact: via `preact/compat`. Kale HTML: **Zag.js** (de kern onder Ark). Gebruik eerst native `<dialog>`, `popover` en `<select>`. |
| Positionering van menu's en tooltips | **Floating UI** | Als je zelf een popover bouwt zonder Ark of Radix. |
| Kleine trendlijntjes in tabellen | **uPlot** of de `.fs-grafiek`-SVG-klassen | ECharts is te zwaar voor tientallen sparklines. |
| Componentdocumentatie en visuele tests | **Storybook** (uit de lijst) | Zodra er echte React/Preact-componenten zijn. Tot dan is `index.html` genoeg. |
| Datums en getallen | **`Intl`** (ingebouwd) en **date-fns** | `Intl` voor nl-NL-bedragen en -datums; date-fns alleen voor rekenen met datums. Geen moment.js. |

## Afraden

| Library | Reden |
|---|---|
| MUI, Ant Design, Chakra, Bootstrap, Vuetify, Quasar | Brengen een eigen uiterlijk mee dat wij overal moeten overschrijven. React- of Vue-gebonden. |
| shadcn/ui als geheel | Goed gemaakt, maar Tailwind- en React-gebonden en het kopieert code in elk project: precies het uiteenlopen dat we willen voorkomen. Losse Radix-onderdelen mogen wel. |
| Framer Motion, React Spring, Lottie | Onze principes vragen rustige beweging (180 ms op kleur). Animatiebibliotheken verleiden tot meer. Alleen in een uitzonderlijk geval. |
| Font Awesome, Heroicons e.a. | Tweede iconenset naast Lucide. |
| Recharts, Chart.js | Recharts is React-gebonden; Chart.js kan het, maar ECharts is sterker voor dashboards en we willen niet twee grafiekbibliotheken. |
| Tremor | Mooi startpunt, maar React, Tailwind en een eigen uiterlijk. |

## Regels voor een nieuwe library

1. Werkt in Preact, React en kale HTML, of is er een dunne adapter voor.
2. Het uiterlijk is volledig te sturen met onze tokens (CSS-variabelen of een themafunctie zoals `grafiekThema()`).
3. Toegankelijk met toetsenbord en schermlezer, getest in licht en donker.
4. Onderhouden (recente release) en een permissieve licentie (MIT, ISC, Apache-2.0).
5. Past in `index.html` als levend voorbeeld voordat een dashboard het gebruikt.
6. Eén library per behoefte. Wie een tweede wil, moet eerst uitleggen waarom de eerste tekortschiet.
