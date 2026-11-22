/* Configuratie voor deze repo zelf: de gedeelde regels, met uitzonderingen voor de bron van de tokens. */
import basis from './stylelint-config.mjs';

export default {
  ...basis,
  ignoreFiles: ['node_modules/**'],
  overrides: [
    {
      // tokens.css is de enige plek waar kleuren en lettertypes mogen worden gedefinieerd.
      files: ['tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'scale-unlimited/declaration-strict-value': null,
      },
    },
    {
      // Onze eigen componenten gebruiken alleen fs-klassen (BEM-achtig) en is-toestanden.
      files: ['components.css'],
      rules: {
        'selector-class-pattern': [
          '^(fs-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?|is-[a-z]+(-[a-z]+)*)$',
          { message: 'Klassen in components.css beginnen met "fs-" (of "is-" voor een toestand).' },
        ],
      },
    },
  ],
};
