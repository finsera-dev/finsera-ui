/*
 * Finsera UI — zijpaneel op de native <dialog>. Geen dependency, werkt in kale HTML, Preact en React.
 *
 * Een zijpaneel is voor snel kijken en kleine aanpassingen die direct gelden, terwijl de lijst ernaast bruikbaar blijft:
 *   - Breed scherm (≥ 900 px): NIET-modaal (`show()`). De pagina blijft bedienbaar; klik je een ander item aan,
 *     dan wisselt de inhoud van het paneel. Geen achtergrond, geen scrollvergrendeling.
 *   - Smal scherm: MODAAL (`showModal()`) als paneel over de volle breedte, met achtergrond en focus vangen.
 *
 *   <dialog class="fs-zijpaneel" id="paneel" aria-labelledby="paneel-titel">
 *     <div class="fs-zijpaneel__kop"><h2 class="fs-zijpaneel__titel" id="paneel-titel" tabindex="-1">…</h2>
 *       <button type="button" data-sluit aria-label="Paneel sluiten">…</button></div>
 *     <div class="fs-zijpaneel__inhoud">…</div>
 *   </dialog>
 *
 *   import { koppelPaneel, openPaneel, sluitPaneel } from './paneel.js';
 *   koppelPaneel(document.getElementById('paneel'));      // eenmalig
 *   openPaneel(paneel, { focusTerug: () => document.querySelector('[data-item="3"]') });
 *
 * Toetsenbord: bij het openen gaat de focus naar de titel van het paneel (zodat schermlezers de nieuwe inhoud horen),
 * Esc sluit en zet de focus terug op het item dat het paneel opende. `focusTerug` is een element of een functie die
 * het element geeft (handig als een lijst opnieuw wordt getekend).
 *
 * Regels: wijzigingen in een paneel gelden meteen en geven feedback (toast, liefst met "Ongedaan maken"); er is dus geen
 * Opslaan-knop. Heb je Opslaan/Annuleren of meer dan een paar velden nodig, gebruik dan een dialoog (zie DESIGN.md).
 */

import { controleerStijl } from './dialoog.js';

const smal = globalThis.matchMedia ? matchMedia('(max-width: 899px)') : { matches: false };
const terug = new WeakMap();   // paneel -> waar de focus naartoe moet bij sluiten
const opruim = new WeakMap();

const alsElement = (x) => (typeof x === 'function' ? x() : x);

export function openPaneel(paneel, { focusTerug } = {}) {
  const modaal = smal.matches;
  if (focusTerug !== undefined) terug.set(paneel, focusTerug);
  else if (!paneel.open) terug.set(paneel, document.activeElement);
  // Wisselde het scherm van breed naar smal (of andersom) terwijl het paneel open stond: opnieuw openen in de juiste modus.
  if (paneel.open && paneel.matches(':modal') !== modaal) paneel.close('modus');
  if (!paneel.open) (modaal ? paneel.showModal() : paneel.show());
  controleerStijl(paneel, 'fs-zijpaneel');
  const titel = document.getElementById(paneel.getAttribute('aria-labelledby'));
  (titel ?? paneel).focus({ preventScroll: true });
}

export function sluitPaneel(paneel, waarde = '') { if (paneel.open) paneel.close(waarde); }

/** Maakt een paneel af: [data-sluit], Esc (ook niet-modaal), klik op de achtergrond (modaal) en focus terugzetten. Geeft een opruimfunctie terug. */
export function koppelPaneel(paneel) {
  let begonOpAchtergrond = false;
  const neer = (e) => { begonOpAchtergrond = e.target === paneel; };
  const klik = (e) => {
    if (e.target === paneel && begonOpAchtergrond) paneel.close('achtergrond');
    else if (e.target.closest?.('[data-sluit]')) paneel.close(e.target.closest('[data-sluit]').dataset.sluit || '');
  };
  const toets = (e) => { if (e.key === 'Escape' && !e.defaultPrevented && paneel.open) { e.preventDefault(); paneel.close('esc'); } };
  const gesloten = () => {
    if (paneel.returnValue === 'modus') return;
    const doel = alsElement(terug.get(paneel));
    if (doel?.isConnected) doel.focus?.();
  };
  paneel.addEventListener('pointerdown', neer);
  paneel.addEventListener('click', klik);
  paneel.addEventListener('keydown', toets);
  paneel.addEventListener('close', gesloten);
  const weg = () => { paneel.removeEventListener('pointerdown', neer); paneel.removeEventListener('click', klik); paneel.removeEventListener('keydown', toets); paneel.removeEventListener('close', gesloten); opruim.delete(paneel); };
  opruim.set(paneel, weg);
  return weg;
}
