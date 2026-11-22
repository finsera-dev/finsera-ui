/*
 * Finsera UI — toegankelijke tabs (WAI-ARIA tabs-patroon, automatische activering). Geen dependency.
 * Werkt overal waar een `.fs-tabs` staat: op de pagina, in een kaart en in een dialoog.
 *
 *   <div class="fs-tabs" role="tablist" aria-label="Instellingen">
 *     <button role="tab" id="t-algemeen" aria-controls="p-algemeen" aria-selected="true">Algemeen</button>
 *     <button role="tab" id="t-toegang"  aria-controls="p-toegang">Toegang</button>
 *   </div>
 *   <div role="tabpanel" id="p-algemeen" aria-labelledby="t-algemeen" tabindex="0">…</div>
 *   <div role="tabpanel" id="p-toegang"  aria-labelledby="t-toegang"  tabindex="0" hidden>…</div>
 *
 *   import { maakTabs } from './tabs.js';
 *   const tabs = maakTabs(document.querySelector('[role=tablist]'));
 *
 * Toetsen: pijl links/rechts (rond), Home en End. Alleen de gekozen tab zit in de tabvolgorde (roving tabindex).
 */

export function maakTabs(lijst, { bijWijziging } = {}) {
  const tabs = [...lijst.querySelectorAll('[role="tab"]')];
  const paneel = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  function kies(tab, { focus = false } = {}) {
    for (const t of tabs) {
      const actief = t === tab;
      t.setAttribute('aria-selected', String(actief));
      t.tabIndex = actief ? 0 : -1;
      const p = paneel(t);
      if (p) p.hidden = !actief;
    }
    if (focus) tab.focus();
    bijWijziging?.(tab);
  }

  const klik = (e) => { const t = e.target.closest('[role="tab"]'); if (t && tabs.includes(t)) kies(t); };
  const toets = (e) => {
    const nu = tabs.indexOf(e.target.closest('[role="tab"]'));
    if (nu < 0) return;
    const doel = { ArrowRight: (nu + 1) % tabs.length, ArrowLeft: (nu - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
    if (doel === undefined) return;
    e.preventDefault();
    kies(tabs[doel], { focus: true });
  };
  lijst.addEventListener('click', klik);
  lijst.addEventListener('keydown', toets);

  kies(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0]);

  return {
    /** Kies een tab op volgnummer of id. */
    kies: (welke) => kies(typeof welke === 'number' ? tabs[welke] : tabs.find((t) => t.id === welke) ?? tabs[0]),
    /** Toon de tab waarin dit element staat (nodig bij een ongeldig veld in een verborgen paneel). */
    kiesVoorElement(el) { const t = tabs.find((x) => paneel(x)?.contains(el)); if (t) kies(t); return Boolean(t); },
    actief: () => tabs.find((t) => t.getAttribute('aria-selected') === 'true'),
    dispose() { lijst.removeEventListener('click', klik); lijst.removeEventListener('keydown', toets); },
  };
}
