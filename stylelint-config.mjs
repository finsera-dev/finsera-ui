/*
 * Finsera UI — Stylelint-regels die de ontwerpregels afdwingen.
 * Wat in AGENTS.md en DESIGN.md staat ("geen losse kleuren, alleen tokens") faalt hiermee in CI.
 *
 * Gebruik in een project (`npm i -D stylelint stylelint-declaration-strict-value`):
 *   // stylelint.config.mjs
 *   import config from 'finsera-ui/stylelint-config';
 *   export default config;
 * en dan `npx stylelint "src/**\/*.css"`.
 */
import strictValue from 'stylelint-declaration-strict-value';

export default {
  plugins: [strictValue],
  rules: {
    // Geen kleurwaarden buiten tokens.css: geen hex, geen benoemde kleuren, geen rgb()/hsl()-functies.
    'color-no-hex': [true, { message: 'Gebruik een token: var(--fs-…) in plaats van een hex-waarde.' }],
    'color-named': ['never', { message: 'Gebruik een token: var(--fs-…) in plaats van een kleurnaam.' }],
    'function-disallowed-list': [
      ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
      { message: 'Gebruik een token: var(--fs-…) in plaats van een kleurfunctie.' },
    ],
    // Eigenschappen die een kleur of lettertype dragen moeten een variabele gebruiken.
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'background', 'fill', 'stroke', 'font-family', 'box-shadow'],
      {
        ignoreValues: ['transparent', 'inherit', 'initial', 'unset', 'currentColor', 'none', 'normal'],
        disableFix: true,
        message: 'Gebruik een token (var(--fs-…)) voor "${property}".',
      },
    ],
  },
};
