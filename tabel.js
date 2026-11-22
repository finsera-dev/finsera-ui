/*
 * Finsera UI — sorteerbare, filterbare tabel: TanStack Table (headless) + onze `.fs-tabel`-opmaak.
 * TanStack levert de logica, wij het uiterlijk. Framework-vrij; in React of Preact gebruik je in plaats
 * hiervan het eigen adapterpakket van TanStack met dezelfde kolomdefinities en dezelfde klassen.
 *
 * Vereist `@tanstack/table-core` (gepind op 8.21.3, de stabiele API) via een importmap of de bundler.
 *
 *   const tabel = maakTabel(document.getElementById('t'), {
 *     data,
 *     kolommen: [
 *       { id: 'klant', kop: 'Klant', waarde: (r) => r.naam, rijkop: true },
 *       { id: 'bedrag', kop: 'Openstaand', waarde: (r) => r.bedrag, getal: true, cel: (r) => euro(r.bedrag, 2) },
 *     ],
 *     voet: (rijen) => `<tr><th scope="row" colspan="1">Totaal</th><td class="fs-getal">${euro(som(rijen))}</td></tr>`,
 *     leeg: { titel: 'Geen dossiers gevonden', tekst: 'Pas je zoekopdracht aan.' },
 *   });
 *   tabel.zoek('bakkerij');   // globaal filter
 */
import { createTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/table-core';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PIJL = { asc: '▲', desc: '▼' };
const SORTEER = { asc: 'ascending', desc: 'descending' };

/**
 * `cel(rij, waarde)` geeft HTML terug en moet zelf escapen (badge, meter, …); zonder `cel` wordt de waarde veilig getoond.
 * Bevat een cel een knop of link, geef die dan een `data-sleutel` (uniek per rij): na opnieuw tekenen krijgt het element met
 * dezelfde sleutel de focus terug. Sorteerknoppen doen dit vanzelf.
 * Kolomopties: `getal` (rechts, tabulair), `rijkop` (th scope=row), `sorteerbaar` (standaard true), `breedte`.
 */
export function maakTabel(element, { data, kolommen, voet, leeg, onWijziging, bijschrift }) {
  let toestand = { sorting: [], globalFilter: '' };
  const kolomDefs = kolommen.map((k) => ({
    id: k.id,
    header: k.kop,
    accessorFn: k.waarde,
    enableSorting: k.sorteerbaar !== false,
    meta: k,
  }));

  const table = createTable({
    data,
    columns: kolomDefs,
    state: {},
    onStateChange: () => {},
    renderFallbackValue: '',
    sortDescFirst: false, // eerste klik is altijd oplopend, ook bij getallen
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (u) => zet({ sorting: typeof u === 'function' ? u(toestand.sorting) : u }),
    onGlobalFilterChange: (u) => zet({ globalFilter: typeof u === 'function' ? u(toestand.globalFilter) : u }),
  });

  function zet(deel) {
    toestand = { ...toestand, ...deel };
    table.setOptions((vorige) => ({ ...vorige, state: { ...table.initialState, ...toestand } }));
    teken();
  }

  function teken() {
    const kop = table.getHeaderGroups()[0].headers.map((h) => {
      const m = h.column.columnDef.meta;
      const richting = h.column.getIsSorted();
      const inhoud = esc(m.kop);
      const stijl = m.breedte ? ` style="width:${esc(m.breedte)}"` : '';
      const klasse = m.getal ? ' class="fs-getal"' : '';
      const sorteer = h.column.getCanSort()
        ? `<button type="button" class="fs-sorteer" data-kolom="${esc(m.id)}">${inhoud}<span aria-hidden="true">${richting ? PIJL[richting] : '↕'}</span></button>`
        : inhoud;
      return `<th scope="col"${klasse}${stijl}${richting ? ` aria-sort="${SORTEER[richting]}"` : ''}>${sorteer}</th>`;
    }).join('');

    const rijen = table.getRowModel().rows;
    const body = rijen.length
      ? rijen.map((rij) => `<tr>${rij.getVisibleCells().map((c) => {
          const m = c.column.columnDef.meta;
          const waarde = c.getValue();
          const html = m.cel ? m.cel(rij.original, waarde) : esc(waarde);
          if (m.rijkop) return `<th scope="row">${html}</th>`;
          return `<td${m.getal ? ' class="fs-getal"' : ''}>${html}</td>`;
        }).join('')}</tr>`).join('')
      : `<tr><td colspan="${kolommen.length}"><div class="fs-leeg"><h3>${esc(leeg?.titel ?? 'Geen resultaten')}</h3><p>${esc(leeg?.tekst ?? '')}</p></div></td></tr>`;

    // Opnieuw tekenen vervangt de elementen; zonder dit raakt een toetsenbordgebruiker de focus kwijt (bijvoorbeeld op een sorteerknop).
    const actief = document.activeElement;
    const sleutel = element.contains(actief) ? actief.closest('[data-sleutel], .fs-sorteer') : null;
    const sel = sleutel ? (sleutel.hasAttribute('data-sleutel') ? `[data-sleutel="${CSS.escape(sleutel.dataset.sleutel)}"]` : `.fs-sorteer[data-kolom="${CSS.escape(sleutel.dataset.kolom)}"]`) : null;
    element.innerHTML = `<div class="fs-tabelrand" tabindex="0"><table class="fs-tabel">${bijschrift ? `<caption class="fs-verborgen">${esc(bijschrift)}</caption>` : ''}<thead><tr>${kop}</tr></thead><tbody>${body}</tbody>${voet && rijen.length ? `<tfoot>${voet(rijen.map((r) => r.original))}</tfoot>` : ''}</table></div>`;
    if (sel) element.querySelector(sel)?.focus({ preventScroll: true });
    onWijziging?.({ aantal: rijen.length, totaal: data.length });
  }

  element.addEventListener('click', (e) => {
    const knop = e.target.closest('.fs-sorteer');
    if (knop) table.getColumn(knop.dataset.kolom).toggleSorting();
  });

  zet({});
  return {
    zoek: (tekst) => table.setGlobalFilter(tekst),
    zetData: (nieuw) => { data = nieuw; table.setOptions((v) => ({ ...v, data: nieuw })); teken(); },
    tabel: table,
  };
}
