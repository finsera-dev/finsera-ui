---
name: onderdeel-toevoegen
description: Nieuw of gewijzigd fs-onderdeel in finsera-ui toevoegen (CSS, voorbeeld, tokens, regels, test, controle). Gebruik bij elke vraag om een nieuw onderdeel, variant of gedragsmodule.
---

Volg `AGENTS.md` letterlijk; dit is alleen de volgorde.

1. **Zoek eerst** of het onderdeel al bestaat in `components.css` en `index.html`. Bestaat het, gebruik of verbeter dat; maak geen variant.
2. **Tokens:** nieuwe waarden (kleur, ruimte, hoek, duur) eerst in `tokens.css`, voor licht én donker. Geen hex, rgb of hsl buiten dat bestand.
3. **`components.css`:** klassen `fs-naam`, `fs-naam__deel`, `fs-naam--variant`, toestand `is-…`. Geen kale elementen, geen losse pixelmaten voor kleur, ruimte, hoeken of lettertype.
4. **`index.html`:** laat het onderdeel zichtbaar zien, met verzonnen data, inclusief lege, laad- en foutstaat waar het data toont.
5. **Gedrag nodig?** Eigen module in de root (ES-module, geen framework, geen dependency, kop met gebruiksvoorbeeld zoals `tabs.js`). Voeg hem toe aan `files` én `exports` in `package.json`.
6. **Documentatie:** regel in de tabel "Welk onderdeel waarvoor" in `AGENTS.md`, het waarom in `DESIGN.md`, en een regel in `README.md` bij een nieuw bestand. Geen nieuwe externe library zonder `LIBRARIES.md`.
7. **Test:** voeg een test toe aan `tests/a11y.spec.mjs` (gedrag, toetsenbord, axe in licht en donker). Pure logica: `node --test` in `tests/<naam>.node.mjs` (niet `.test.`/`.spec.` noemen, anders pakt Playwright het op) en een script in `package.json`.
8. **Controle:** `npm run check` moet groen zijn. Bekijk daarna `index.html` in de browser (`node tests/serve.mjs 4173`) in licht en donker en op een smal scherm.

Niet doen: een routerbibliotheek of Link-component, een eigen variant in een project, wijzigingen in `finsera-kern`, `jaarrekening-ai` of `boekassistent` (zet het als voorstel in een bericht aan Tomas).
