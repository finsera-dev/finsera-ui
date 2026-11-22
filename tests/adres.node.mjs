/*
 * Tests voor adres.js met de ingebouwde Node-testrunner: `node --test tests/adres.node.mjs`.
 * De bestandsnaam eindigt bewust niet op `.test.mjs`, anders pakt Playwright (testDir `tests`) het ook op.
 * Alleen verzonnen id's.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leesAdres, maakAdres, portaalAdressen } from '../adres.js';

const ID = 'd1f0a8e2-3b7c-4c1e-9a55-0e6f2b7d1c01'; // verzonnen

test('alle portaaladressen: heen en terug', () => {
  const gevallen = [
    ['dossiers', {}, '/dossiers'],
    ['dossierNieuw', {}, '/dossiers/nieuw'],
    ['dossier', { id: ID }, `/dossiers/${ID}`],
    ['dossierToegang', { id: ID }, `/dossiers/${ID}/toegang`],
    ['auditfile', {}, '/auditfile'],
    ['medewerkers', {}, '/medewerkers'],
    ['toewijzingen', {}, '/toewijzingen'],
    ['gebruik', {}, '/gebruik'],
  ];
  assert.equal(gevallen.length, Object.keys(portaalAdressen).length, 'elk portaaladres staat in deze test');
  for (const [naam, params, pad] of gevallen) {
    assert.equal(maakAdres(naam, params), pad, `maakAdres ${naam}`);
    assert.deepEqual(leesAdres(pad), { naam, params }, `leesAdres ${pad}`);
  }
});

test('letterlijk wint van parameter: /dossiers/nieuw is geen dossier', () => {
  assert.equal(leesAdres('/dossiers/nieuw').naam, 'dossierNieuw');
  // ook als de patronen in een andere volgorde staan
  const omgekeerd = { dossier: '/dossiers/:id', dossierNieuw: '/dossiers/nieuw' };
  assert.equal(leesAdres('/dossiers/nieuw', omgekeerd).naam, 'dossierNieuw');
  // een dossier met id "nieuw" kan niet bestaan als adres: liever null dan het formulier voor een nieuw dossier
  assert.equal(maakAdres('dossier', { id: 'nieuw' }), null);
  assert.equal(leesAdres('/dossiers/%6Eieuw').naam, 'dossier'); // gecodeerd is het een id, geen letterlijk stuk
});

test('onbekende en onvolledige paden geven null', () => {
  for (const pad of ['/bestaat-niet', '/dossiers/x/y/z', '/dossiers/x/anders', '/dossiers//toegang', '//', '/dossiers//', '', 'dossiers', '/Dossiers']) {
    assert.equal(leesAdres(pad), null, JSON.stringify(pad));
  }
  assert.equal(leesAdres('/'), null); // het portaal beslist zelf dat `/` doorverwijst
  assert.equal(leesAdres(undefined), null);
  assert.equal(leesAdres(null), null);
  assert.equal(leesAdres(42), null);
  assert.deepEqual(leesAdres('/dossiers', undefined), leesAdres('/dossiers'));
  assert.equal(leesAdres('/dossiers', null), null); // geen patronen, geen route
});

test('één slash achteraan, query en #-deel horen niet bij het adres', () => {
  assert.equal(leesAdres('/dossiers/')?.naam, 'dossiers');
  assert.deepEqual(leesAdres(`/dossiers/${ID}/toegang/`), { naam: 'dossierToegang', params: { id: ID } });
  assert.equal(leesAdres('/gebruik?maand=2026-10')?.naam, 'gebruik');
  assert.equal(leesAdres('/gebruik#uitnodiging=abc')?.naam, 'gebruik');
  assert.equal(leesAdres(`/dossiers/${ID}?a=1#herstel=xyz`)?.params.id, ID);
  assert.equal(leesAdres('#alleen-een-hash'), null);
  assert.equal(leesAdres('?alleen=query'), null);
});

test('een eigen set patronen, ook de root', () => {
  const patronen = { start: '/', factuur: '/facturen/:id', regel: '/facturen/:id/regels/:regel' };
  assert.deepEqual(leesAdres('/', patronen), { naam: 'start', params: {} });
  assert.deepEqual(leesAdres('/facturen/f-9/regels/3', patronen), { naam: 'regel', params: { id: 'f-9', regel: '3' } });
  assert.equal(maakAdres('regel', { id: 'f-9', regel: 3 }, patronen), '/facturen/f-9/regels/3'); // getal is toegestaan
  assert.equal(maakAdres('start', {}, patronen), '/');
  assert.equal(leesAdres('/dossiers', patronen), null); // de portaalpatronen gelden hier niet
});

const RARE_IDS = [
  'met spatie',
  'a/b',
  '../geheim',
  '..%2F..',
  '100%',
  '%',
  '%2F',
  '%zz',
  'ünïcödé',
  '日本語',
  '😀',
  'a?b#c',
  'a&b=c',
  "a'b\"c<d>",
  'a\\b',
  'a;b,c:d@e',
  '\n\t',
  ' ',
  'nul\u0000byte',
  'a+b',
  'lang'.repeat(500),
];

test('een id met rare tekens levert nooit een ander pad of een fout op', () => {
  for (const id of RARE_IDS) {
    for (const naam of ['dossier', 'dossierToegang']) {
      const pad = maakAdres(naam, { id });
      assert.equal(typeof pad, 'string', `maakAdres ${naam} ${JSON.stringify(id)}`);
      assert.match(pad, /^\/[A-Za-z0-9\-._~!*'()%/]+$/, 'alleen veilige tekens in het pad');
      assert.equal(pad.split('/').length, naam === 'dossier' ? 3 : 4, `geen extra pad-stukken voor ${JSON.stringify(id)}`);
      assert.ok(!pad.includes('?') && !pad.includes('#'), 'geen query of hash');
      assert.deepEqual(leesAdres(pad), { naam, params: { id } }, `heen en terug ${JSON.stringify(id)}`);
      // Dezelfde route via de URL-parser van de browser: het pad blijft zoals wij het maakten.
      assert.equal(new URL(pad, 'https://portaal.test').pathname, pad);
    }
  }
});

test('ids die niet als pad-stuk kunnen, geven null en geen fout', () => {
  for (const id of ['', '.', '..', '\ud800', 'half\udc00', undefined, null, {}, [], true]) {
    assert.equal(maakAdres('dossier', { id }), null, JSON.stringify(id));
  }
  assert.equal(maakAdres('dossier'), null); // geen params
  assert.equal(maakAdres('dossier', null), null);
  assert.equal(maakAdres('bestaat-niet', {}), null);
  assert.equal(maakAdres(undefined), null);
  assert.equal(maakAdres('dossier', { id: ID }, { dossier: 'zonder-slash/:id' }), null);
  assert.equal(maakAdres('dossier', { id: ID }, null), null);
});

test('lezen: kapotte codering geeft null en geen fout', () => {
  for (const pad of ['/dossiers/%', '/dossiers/%zz', '/dossiers/%E0%A4%A', '/dossiers/%ff', '/dossiers/%C0%AF']) {
    assert.doesNotThrow(() => leesAdres(pad));
    assert.equal(leesAdres(pad), null, pad);
  }
  assert.equal(leesAdres('/dossiers/%00')?.params.id, '\u0000'); // geldig gecodeerd, geen fout
  for (const pad of ['/dossiers/..', '/dossiers/.', '/dossiers/%2e%2e', '/dossiers/%2E']) assert.equal(leesAdres(pad), null, pad); // net als maakAdres: `.` en `..` zijn geen id
});

test('wat uit de adresbalk komt, lezen we zoals de browser het doorgeeft', () => {
  // De browser houdt %2F in een pad-stuk als %2F: één stuk, niet twee.
  assert.deepEqual(leesAdres('/dossiers/a%2Fb'), { naam: 'dossier', params: { id: 'a/b' } });
  assert.equal(leesAdres('/dossiers/a/b'), null); // dat zijn wel twee stukken
});

test('het portaaladres is niet te wijzigen', () => {
  assert.throws(() => { portaalAdressen.dossier = '/anders/:id'; }, TypeError); // modules zijn strikt
  assert.equal(maakAdres('dossier', { id: ID }), `/dossiers/${ID}`);
});
