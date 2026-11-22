/*
 * Finsera UI — dialogen op de native <dialog>. Geen dependency, werkt in kale HTML, Preact en React.
 * De browser regelt focus vangen, Esc, een inerte achtergrond en het tonen bovenop de pagina;
 * wij voegen toe: sluiten bij een klik op de achtergrond, [data-sluit]-knoppen en `bevestig()`.
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
 * Regels: elke dialoog heeft een titel (aria-labelledby). Onomkeerbare acties gebruiken `bevestig({ gevaarlijk: true })`:
 * daar krijgt de veilige keuze (Annuleren) de focus en heet de knop naar de handeling, nooit "OK".
 */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let teller = 0;

export const open = (dialoog) => { if (!dialoog.open) dialoog.showModal(); };
export const sluit = (dialoog, waarde) => dialoog.close(waarde);

/**
 * Maakt een bestaande dialoog af: klik op de achtergrond sluit (alleen als de klik ook daar begon, zodat tekst
 * selecteren en per ongeluk loslaten buiten het venster niets sluit) en elke [data-sluit] sluit.
 * Geeft een functie terug die de koppeling weer opruimt.
 */
export function koppel(dialoog) {
  let begonOpAchtergrond = false;
  const neer = (e) => { begonOpAchtergrond = e.target === dialoog; };
  const klik = (e) => {
    if (e.target === dialoog && begonOpAchtergrond) dialoog.close('achtergrond');
    else if (e.target.closest?.('[data-sluit]')) dialoog.close(e.target.closest('[data-sluit]').dataset.sluit || '');
  };
  dialoog.addEventListener('pointerdown', neer);
  dialoog.addEventListener('click', klik);
  return () => { dialoog.removeEventListener('pointerdown', neer); dialoog.removeEventListener('click', klik); };
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
