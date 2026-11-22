/*
 * Finsera UI — toasts: vanilla-sonner (gedrag, toegankelijkheid) + onze tokens (`toast.css`).
 * Werkt in kale HTML, Preact en React: het is gewone DOM, geen component nodig.
 *
 * Vereist `vanilla-sonner` (gepind op 0.7.0) via een importmap of de bundler, en de stylesheets
 * `vanilla-sonner/style.css` gevolgd door `toast.css`.
 *
 *   import { melding } from './toast.js';
 *   melding.succes('Dossier opgeslagen');
 *   melding.fout('Importeren mislukt', 'Het bestand is geen geldig auditfile.');
 *   melding.ongedaan('Dossier gearchiveerd', () => herstel());
 *   melding.belofte(opslaan(), { bezig: 'Opslaan…', klaar: 'Opgeslagen', fout: 'Opslaan mislukt' });
 *
 * Regels: een toast is voor een bevestiging van wat de gebruiker zojuist deed. Iets dat de gebruiker moet
 * lezen of waar actie op volgt hoort in een blijvende `fs-melding`. Maximaal één zin; details in de tweede regel.
 */
import { toast } from 'vanilla-sonner';

let klaar = false;
function zorgVoorContainer() {
  if (klaar) return;
  klaar = true;
  if (!document.getElementById('sonner-toast-container')) {
    const ol = document.createElement('ol');
    ol.id = 'sonner-toast-container';
    document.body.appendChild(ol);
  }
  toast.configure({
    position: 'bottom-right',
    maxToasts: 3,
    overflow: 'queue',
    richColors: true,
    closeButton: true,
    dedupe: 'message',
    ariaLabel: 'Meldingen',
    defaults: {
      default: { duration: 4000 },
      success: { duration: 3500 },
      info: { duration: 5000 },
      warning: { duration: 7000 },
      error: { duration: 9000, important: true },
      loading: { duration: 0 },
    },
  });
}

const met = (f) => (titel, beschrijving, opties = {}) => {
  zorgVoorContainer();
  return beschrijving ? f(titel, { description: beschrijving, ...opties }) : f(titel, opties);
};

export const melding = {
  /** Neutrale bevestiging. */
  bericht: met((t, o) => toast(t, o)),
  succes: met((t, o) => toast.success(t, o)),
  info: met((t, o) => toast.info(t, o)),
  waarschuwing: met((t, o) => toast.warning(t, o)),
  fout: met((t, o) => toast.error(t, o)),
  /** Bevestiging met een knop "Ongedaan maken"; blijft langer staan zodat er tijd is om te kiezen. */
  ongedaan(titel, terugdraaien, opties = {}) {
    zorgVoorContainer();
    return toast(titel, { duration: 8000, action: { label: 'Ongedaan maken', onClick: terugdraaien }, ...opties });
  },
  /** Laat bezig/klaar/fout zien rond een belofte; geeft de belofte zelf terug. */
  belofte(belofte, { bezig, klaar: gelukt, fout }) {
    zorgVoorContainer();
    toast.promise(belofte, { loading: bezig, success: gelukt, error: fout });
    return belofte;
  },
  sluit: (id) => toast.dismiss(id),
};
