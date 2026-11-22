/*
 * Finsera UI — adressen: een pad omzetten naar een route en een route naar een pad. Puur: geen framework,
 * geen dependency, geen `window`, geen `history`. Werkt in Preact, React, kale HTML en Node.
 * Routerlogica (pushState, popstate, <a>-klikken, focus) bouwt elke app zelf; zie "Adressen en navigatie"
 * in `DESIGN.md` en `AGENTS.md`.
 *
 *   import { leesAdres, maakAdres } from './adres.js';
 *
 *   leesAdres('/dossiers/d-4f2a');            // { naam: 'dossier', params: { id: 'd-4f2a' } }
 *   leesAdres('/dossiers/d-4f2a/toegang');    // { naam: 'dossierToegang', params: { id: 'd-4f2a' } }
 *   leesAdres('/bestaat-niet');               // null  (de app toont dan de neutrale melding)
 *   maakAdres('dossier', { id: 'd-4f2a' });   // '/dossiers/d-4f2a'
 *
 * Een patroon is een pad met `:naam` voor een parameter. Zonder derde argument gelden de adressen van het
 * Kantoorportaal (`portaalAdressen`); een app met andere onderdelen geeft haar eigen patronen mee:
 *
 *   const patronen = { start: '/', facturen: '/facturen', factuur: '/facturen/:id' };
 *   leesAdres(location.pathname, patronen);
 *   maakAdres('factuur', { id: 'f-9' }, patronen);
 *
 * Afspraken (gelijk aan de regels voor adressen):
 * - Alleen id's als parameter, nooit namen, KvK-nummers of e-mailadressen. Dit bestand dwingt dat niet af
 *   (een id is gewoon een tekst), maar de naam `id` in de voorbeelden is bedoeld.
 * - `leesAdres` leest alleen het pad. Een `?query` en een `#deel` worden genegeerd: het `#`-deel is gereserveerd
 *   voor de uitnodigings- en herstellinks van de kern en wordt nooit door de router gelezen.
 * - Letterlijke stukken winnen van parameters, ongeacht de volgorde: `/dossiers/nieuw` is nooit een dossier
 *   met id `nieuw`.
 * - Geen fouten: wat niet te lezen of te maken is, geeft `null`. Een id met spaties, slash, %, unicode of een
 *   emoji wordt gecodeerd en komt er bij het lezen identiek weer uit; hij kan nooit een ander pad opleveren.
 *   Een id die dat niet kan (leeg, `.` of `..`, een los surrogaat, of gelijk aan een letterlijk zusterpad) geeft
 *   `null` bij `maakAdres`, zodat een kapotte link zichtbaar is en geen stil ander scherm opent.
 */

/**
 * Adressen van het Kantoorportaal. Voorbeeld voor andere apps; bindend zijn alleen `dossier` en
 * `dossierToegang`, want daarnaar mogen andere apps linken (id = `kern.dossiers.id`).
 * `/` leidt het portaal door naar `/dossiers`; dat is een keuze van de app en staat hier niet in.
 */
export const portaalAdressen = Object.freeze({
  dossiers: '/dossiers',
  dossierNieuw: '/dossiers/nieuw',
  dossier: '/dossiers/:id',
  dossierToegang: '/dossiers/:id/toegang',
  auditfile: '/auditfile',
  medewerkers: '/medewerkers',
  toewijzingen: '/toewijzingen',
  gebruik: '/gebruik',
});

const stukken = (pad) => (pad === '/' ? [] : pad.slice(1).split('/'));
const isParam = (stuk) => stuk.length > 1 && stuk[0] === ':';

/** Splitst een patroon eenmalig in stukken. Een ongeldig patroon (niet met `/` begonnen) is niet te gebruiken. */
function patroonStukken(patroon) {
  if (typeof patroon !== 'string' || patroon[0] !== '/' || (patroon.length > 1 && patroon.endsWith('/'))) return null;
  return stukken(patroon);
}

function decodeer(stuk) {
  try {
    return decodeURIComponent(stuk);
  } catch {
    return null; // bijvoorbeeld een los `%`
  }
}

/**
 * Geeft `{ naam, params }` voor het pad, of `null` als geen patroon past.
 * @param {string} pad  `location.pathname`; een `?query` of `#deel` erachter wordt genegeerd.
 * @param {Record<string,string>} [patronen]
 */
export function leesAdres(pad, patronen = portaalAdressen) {
  if (typeof pad !== 'string') return null;
  const kaal = pad.split(/[?#]/, 1)[0];
  if (kaal[0] !== '/' || kaal.includes('//')) return null; // `//` is geen adres
  const zonderSlot = kaal.length > 1 && kaal.endsWith('/') ? kaal.slice(0, -1) : kaal; // één slash achteraan is hetzelfde adres
  const delen = stukken(zonderSlot);

  let beste = null;
  for (const naam of Object.keys(patronen ?? {})) {
    const p = patroonStukken(patronen[naam]);
    if (!p || p.length !== delen.length) continue;
    const params = {};
    let letterlijk = 0;
    let past = true;
    for (let i = 0; i < p.length && past; i += 1) {
      if (isParam(p[i])) {
        const waarde = decodeer(delen[i]);
        if (waarde === null || waarde === '' || waarde === '.' || waarde === '..') past = false; // net als bij maakAdres geen id
        else params[p[i].slice(1)] = waarde;
      } else if (p[i] === delen[i]) {
        letterlijk += 1;
      } else {
        past = false; // letterlijke stukken vergelijken we ongedecodeerd: `%6Eieuw` is dus geen `nieuw`
      }
    }
    if (past && (!beste || letterlijk > beste.letterlijk)) beste = { naam, params, letterlijk };
  }
  return beste ? { naam: beste.naam, params: beste.params } : null;
}

/**
 * Bouwt het pad voor een route, met gecodeerde id's, of `null` als dat niet kan (onbekende naam, ontbrekende
 * of onbruikbare parameter). Gooit nooit een fout.
 * @param {string} naam
 * @param {Record<string,string|number>} [params]
 * @param {Record<string,string>} [patronen]
 */
export function maakAdres(naam, params = {}, patronen = portaalAdressen) {
  const p = patroonStukken(patronen?.[naam]);
  if (!p) return null;
  const uit = [];
  for (const stuk of p) {
    if (!isParam(stuk)) {
      uit.push(stuk);
      continue;
    }
    const ruw = params?.[stuk.slice(1)];
    if (typeof ruw !== 'string' && typeof ruw !== 'number') return null;
    const waarde = String(ruw);
    // `.` en `..` zijn voor elke browser een pad-stuk dat wordt weggehaald, ook gecodeerd als `%2e`.
    if (waarde === '' || waarde === '.' || waarde === '..') return null;
    try {
      uit.push(encodeURIComponent(waarde));
    } catch {
      return null; // los surrogaat, geen geldige tekst
    }
  }
  const pad = p.length ? `/${uit.join('/')}` : '/';
  // Controle: lezen we dit pad terug, dan moet het dezelfde route zijn. Vangt een id die gelijk is aan een
  // letterlijk zusterpad (`nieuw`), of een parameter die per ongeluk een ander patroon raakt.
  const terug = leesAdres(pad, patronen);
  if (!terug || terug.naam !== naam) return null;
  for (const [sleutel, waarde] of Object.entries(terug.params)) {
    if (waarde !== String(params[sleutel])) return null;
  }
  return pad;
}
