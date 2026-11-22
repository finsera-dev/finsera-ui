/*
 * Finsera UI — koppeling tussen de tokens en Apache ECharts.
 * ECharts kent geen CSS-variabelen, dus lezen we ze hier uit en bouwen er een thema van.
 * Gebruik:
 *   import { maakGrafiek, euro } from './charts.js';
 *   maakGrafiek(document.getElementById('x'), { ...optie });   // thema, resize en licht/donker gaan vanzelf
 * `echarts` moet als global beschikbaar zijn (script-tag) of als tweede argument worden meegegeven.
 */

const token = (naam) => getComputedStyle(document.documentElement).getPropertyValue(`--fs-${naam}`).trim();

/** Bedrag in nl-NL, bijvoorbeeld € 12.480,00. Met decimalen = 0 voor afgeronde KPI's. */
export const euro = (n, decimalen = 0) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimalen, maximumFractionDigits: decimalen }).format(n);

/** Thema-object voor echarts.registerTheme, opgebouwd uit de huidige tokens. */
export function grafiekThema() {
  const tekst = token('tekst-zacht');
  const as = { axisLine: { lineStyle: { color: token('rand') } }, axisTick: { show: false }, axisLabel: { color: token('as'), fontWeight: 600 }, splitLine: { lineStyle: { color: token('lijn') } } };
  return {
    color: [1, 2, 3, 4, 5, 6].map((i) => token(`reeks-${i}`)),
    backgroundColor: 'transparent',
    textStyle: { fontFamily: token('lettertype') || 'system-ui', color: tekst },
    grid: { left: 8, right: 8, top: 16, bottom: 4, containLabel: true },
    categoryAxis: { ...as, splitLine: { show: false } },
    valueAxis: { ...as, axisLine: { show: false } },
    legend: { show: false },
    tooltip: {
      backgroundColor: token('vlak'), borderColor: token('rand'), borderWidth: 1, padding: [8, 12],
      textStyle: { color: token('tekst'), fontFamily: token('lettertype'), fontWeight: 600, fontSize: 13 },
      extraCssText: `border-radius:12px;box-shadow:${token('schaduw')};`,
    },
    line: { symbol: 'circle', symbolSize: 6, smooth: false, lineStyle: { width: 2.5 } },
    bar: { barMaxWidth: 44, itemStyle: { borderRadius: [4, 4, 0, 0] } },
  };
}

/**
 * Maakt een grafiek die meebeweegt met formaat en thema (licht/donker/systeem).
 * `optie` mag een functie zijn die per themawissel opnieuw wordt aangeroepen; handig voor kleuren uit tokens.
 * Geeft de echarts-instantie terug; `instantie.dispose()` ruimt ook de observers op.
 */
export function maakGrafiek(element, optie, ec = globalThis.echarts) {
  if (!ec) throw new Error('echarts ontbreekt');
  let instantie;
  const teken = () => {
    instantie?.dispose();
    ec.registerTheme('finsera', grafiekThema());
    instantie = ec.init(element, 'finsera', { renderer: 'svg' });
    instantie.setOption(typeof optie === 'function' ? optie() : optie);
  };
  teken();
  const resize = new ResizeObserver(() => instantie.resize());
  resize.observe(element);
  const thema = new MutationObserver(teken);
  thema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const systeem = matchMedia('(prefers-color-scheme: dark)');
  systeem.addEventListener('change', teken);
  const handle = {
    get instantie() { return instantie; },
    dispose() { resize.disconnect(); thema.disconnect(); systeem.removeEventListener('change', teken); instantie.dispose(); },
  };
  return handle;
}
