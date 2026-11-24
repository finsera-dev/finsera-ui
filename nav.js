/*
 * Finsera UI — uitklapbare navigatiegroepen (WAI-ARIA "disclosure navigation"). Geen dependency, voor kale HTML.
 * In React of Preact render je dezelfde markup en staat vanuit je eigen toestand (zie "Staat" hieronder) en gebruik je dit niet.
 *
 *   <nav class="fs-zijbalk" aria-label="Hoofdnavigatie">
 *     <a class="fs-nav" href="/">Overzicht</a>
 *     <div class="fs-nav-groep">
 *       <button type="button" class="fs-nav fs-nav--groep" aria-expanded="false" aria-controls="nav-dossiers">
 *         <svg …/><span class="fs-nav__tekst">Dossiers</span><svg class="fs-nav__pijl" …/>
 *       </button>
 *       <div class="fs-nav__sub" id="nav-dossiers" role="group" aria-label="Dossiers">
 *         <div class="fs-nav__sublijst">
 *           <a class="fs-nav fs-nav--sub" href="/dossiers">Overzicht</a>
 *           <a class="fs-nav fs-nav--sub" href="/dossiers/nieuw">Nieuw dossier</a>
 *         </div>
 *       </div>
 *     </div>
 *   </nav>
 *
 *   import { maakNavigatie } from './nav.js';
 *   const nav = maakNavigatie(document.querySelector('.fs-zijbalk'));
 *   nav.synchroniseer();   // na een routewissel: opent de groep waarin de huidige pagina (aria-current="page") staat
 *
 * Staat (voor frameworks): `aria-expanded="true|false"` op de kop, de klasse `is-open` op `.fs-nav__sub` en `inert` op `.fs-nav__sub` als hij dicht is
 * (zonder `inert` zijn de subitems nog even met Tab te bereiken tijdens de sluitanimatie van 180 ms).
 * De kop is een knop, geen link: in- of uitklappen is een actie. Heeft een groep een eigen pagina, maak die dan het eerste subitem.
 * Maximaal twee niveaus. Een groep waarin de huidige pagina staat, is bij het laden open.
 */

export function maakNavigatie(root, { enkel = false } = {}) {
  const koppen = () => [...root.querySelectorAll('.fs-nav--groep[aria-controls]')];
  const subVan = (kop) => document.getElementById(kop.getAttribute('aria-controls'));

  function zet(kop, open) {
    kop.setAttribute('aria-expanded', String(open));
    const sub = subVan(kop);
    if (!sub) return;
    sub.classList.toggle('is-open', open);
    sub.inert = !open;   // dicht = meteen onbereikbaar voor Tab en schermlezer, ook tijdens de sluitanimatie
  }

  function klik(e) {
    const kop = e.target.closest('.fs-nav--groep[aria-controls]');
    if (!kop || !root.contains(kop)) return;
    const open = kop.getAttribute('aria-expanded') !== 'true';
    if (open && enkel) for (const ander of koppen()) if (ander !== kop) zet(ander, false);
    zet(kop, open);
  }
  root.addEventListener('click', klik);

  /** Opent elke groep waarin de huidige pagina staat. Sluit niets: wat de gebruiker zelf opende, blijft open. */
  function synchroniseer() {
    for (const kop of koppen()) {
      if (subVan(kop)?.querySelector('[aria-current="page"]')) zet(kop, true);
    }
  }

  // Begintoestand: wat in de markup al aria-expanded="true" heeft, blijft open; de rest volgt `aria-expanded` en wordt gelijkgetrokken.
  for (const kop of koppen()) zet(kop, kop.getAttribute('aria-expanded') === 'true');
  synchroniseer();

  return {
    synchroniseer,
    open: (id) => { const k = koppen().find((x) => x.getAttribute('aria-controls') === id); if (k) zet(k, true); },
    sluit: (id) => { const k = koppen().find((x) => x.getAttribute('aria-controls') === id); if (k) zet(k, false); },
    dispose() { root.removeEventListener('click', klik); },
  };
}
