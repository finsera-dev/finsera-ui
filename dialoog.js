/*
 * Finsera UI — dialogen op de native <dialog>. Geen dependency, werkt in kale HTML, Preact en React.
 * De browser regelt focus vangen, Esc, een inerte achtergrond en het tonen bovenop de pagina;
 * wij voegen toe: sluiten bij een klik op de achtergrond, [data-sluit]-knoppen, tabs, bewaking van
 * niet-opgeslagen wijzigingen en `bevestig()`.
 *
 *   <dialog class="fs-dialoog" id="nieuw" aria-labelledby="nieuw-titel"> … </dialog>
 *
 *   import { open, sluit, koppel, bevestig } from './dialoog.js';
 *   koppel(document.getElementById('nieuw'));     // eenmalig per dialoog
 *   open(document.getElementById('nieuw'));
 *
 *   if (await bevestig({ titel: 'Dossier verwijderen?', tekst: 'Dit kan niet ongedaan worden gemaakt.',
 *                        bevestigtekst: 'Dossier verwijderen', gevaarlijk: true })) { … }
 *
 * Instellingen met tabs (groot): zie `fs-dialoog--groot` in index.html.
 *   - Een `[role=tablist]` in de dialoog wordt automatisch tabs (zie tabs.js); bij elke `open()` begint de dialoog op de eerste tab.
 *   - `data-bewaak-wijzigingen` op de <dialog>: sluiten (Esc, klik ernaast, Annuleren, kruisje) vraagt eerst of wijzigingen
 *     weggegooid mogen worden, als er iets is veranderd sinds `open()`. Opslaan (submit) sluit altijd direct.
 *   - Een ongeldig verplicht veld in een verborgen tab schakelt naar die tab, zodat de melding zichtbaar is.
 *
 * Regels: elke dialoog heeft een titel (aria-labelledby). Onomkeerbare acties gebruiken `bevestig({ gevaarlijk: true })`:
 * daar krijgt de veilige keuze (Annuleren) de focus en heet de knop naar de handeling, nooit "OK".
 */
import { maakTabs } from './tabs.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let teller = 0;
const begin = new WeakMap();   // dialoog -> { toestand van het formulier bij openen, tabs }
const koppelingen = new WeakMap();

const momentopname = (dialoog) => {
  const form = dialoog.querySelector('form');
  return form ? new URLSearchParams(new FormData(form)).toString() : '';
};

/** Opent de dialoog. Onthoudt de begintoestand (voor de wijzigingsbewaking) en gaat naar de eerste tab. */
export function open(dialoog) {
  if (dialoog.open) return;
  koppelingen.get(dialoog)?.tabs?.kies(0);
  begin.set(dialoog, momentopname(dialoog));
  dialoog.showModal();
}
export const sluit = (dialoog, waarde) => dialoog.close(waarde);
/** True als het formulier in de dialoog anders is dan bij `open()`. */
export const isGewijzigd = (dialoog) => begin.has(dialoog) && begin.get(dialoog) !== momentopname(dialoog);

/**
 * Maakt een bestaande dialoog af: klik op de achtergrond sluit (alleen als de klik ook daar begon, zodat tekst
 * selecteren en per ongeluk loslaten buiten het venster niets sluit), elke [data-sluit] sluit, tabs werken,
 * en met `data-bewaak-wijzigingen` wordt eerst gevraagd bij niet-opgeslagen wijzigingen.
 * Geeft een functie terug die de koppeling weer opruimt.
 */
export function koppel(dialoog) {
  const bewaak = dialoog.hasAttribute('data-bewaak-wijzigingen');
  const lijst = dialoog.querySelector('[role="tablist"]');
  const form = dialoog.querySelector('form');
  const tabs = lijst ? maakTabs(lijst) : null;
  let begonOpAchtergrond = false;
  let vraagtNog = false;

  async function probeerTeSluiten(reden) {
    if (!bewaak || !isGewijzigd(dialoog)) return dialoog.close(reden);
    if (vraagtNog) return;
    vraagtNog = true;
    const weggooien = await bevestig({
      titel: 'Wijzigingen weggooien?',
      tekst: 'Je hebt wijzigingen die nog niet zijn opgeslagen. Als je nu sluit, gaan ze verloren.',
      bevestigtekst: 'Wijzigingen weggooien',
      annuleertekst: 'Terug naar instellingen',
      gevaarlijk: true,
    });
    vraagtNog = false;
    if (weggooien) dialoog.close(reden);
  }

  const neer = (e) => { begonOpAchtergrond = e.target === dialoog; };
  const klik = (e) => {
    const sluitKnop = e.target.closest?.('[data-sluit]');
    if (e.target === dialoog && begonOpAchtergrond) probeerTeSluiten('achtergrond');
    else if (sluitKnop) probeerTeSluiten(sluitKnop.dataset.sluit || '');
  };
  const annuleer = (e) => { if (bewaak && isGewijzigd(dialoog)) { e.preventDefault(); probeerTeSluiten('esc'); } };
  const ongeldig = (e) => { tabs?.kiesVoorElement(e.target); };

  dialoog.addEventListener('pointerdown', neer);
  dialoog.addEventListener('click', klik);
  dialoog.addEventListener('cancel', annuleer);
  form?.addEventListener('invalid', ongeldig, true);
  koppelingen.set(dialoog, { tabs });

  return () => {
    dialoog.removeEventListener('pointerdown', neer);
    dialoog.removeEventListener('click', klik);
    dialoog.removeEventListener('cancel', annuleer);
    form?.removeEventListener('invalid', ongeldig, true);
    tabs?.dispose();
    koppelingen.delete(dialoog);
  };
}

/**
 * Bevestigingsdialoog; geeft een belofte terug die `true` is bij bevestigen en `false` bij annuleren, Esc of klik ernaast.
 * Opties: titel, tekst (platte tekst), bevestigtekst, annuleertekst, gevaarlijk.
 */
export function bevestig({ titel, tekst = '', bevestigtekst = 'Bevestigen', annuleertekst = 'Annuleren', gevaarlijk = false }) {
  const id = `fs-bevestig-${++teller}`;
  const dialoog = document.createElement('dialog');
  dialoog.className = 'fs-dialoog';
  dialoog.setAttribute('aria-labelledby', `${id}-titel`);
  if (tekst) dialoog.setAttribute('aria-describedby', `${id}-tekst`);
  dialoog.setAttribute('role', gevaarlijk ? 'alertdialog' : 'dialog');
  dialoog.innerHTML = `
    <div class="fs-dialoog__kop"><h2 class="fs-dialoog__titel" id="${id}-titel">${esc(titel)}</h2></div>
    ${tekst ? `<div class="fs-dialoog__inhoud"><p id="${id}-tekst">${esc(tekst)}</p></div>` : ''}
    <div class="fs-dialoog__acties"><form method="dialog">
      <button class="fs-knop" value="nee" autofocus>${esc(annuleertekst)}</button>
      <button class="fs-knop ${gevaarlijk ? 'fs-knop--gevaar' : 'fs-knop--primair'}" value="ja">${esc(bevestigtekst)}</button>
    </form></div>`;
  document.body.appendChild(dialoog);
  const opruimen = koppel(dialoog);
  return new Promise((klaar) => {
    dialoog.addEventListener('close', () => { opruimen(); const ja = dialoog.returnValue === 'ja'; dialoog.remove(); klaar(ja); }, { once: true });
    dialoog.showModal();
  });
}
