import { type Case, type Component, emptyCandidate, defaultPilot } from './domain';

export const publicSheet = 'https://verkkokauppa.daytongroup.fi/PDF%20Files/Product%20Sheets/Faerch%20Trays/Faerch%20C%202200-2S%20Product%20Sheet.pdf';
export function publicCase(): Case {
  const unknown = (id: string, name: string): Component => ({ id, name, material: '', mass: null, plastic: null, recycled: null, provenance: 'Missing', source: '', notes: 'Obtain exact-product documentation before comparing.' });
  const pilot = defaultPilot();
  pilot.notes = 'Public-document review only. No supplier engagement or retail trial has taken place. Ask for a current declaration for item 2200022012 / recipe 6811, guaranteed recycled fraction, complete lid specification, food/contact-time limits, and a current quote. Agree baseline and functional equivalence first.';
  return {
    id: 'public-faerch-2200022012', name: 'Public review · Faerch CPET',
    description: 'Public-source SKU review · 2023 product sheet, not a current supplier approval. Baseline, lid, recycled fraction and purchasing volume remain unknown.',
    illustrative: false, units: 0, adoption: 1, temperature: null, hours: null, use: '', food: true,
    baseline: 'public-baseline', selected: 'public-tray',
    candidates: [
      { ...emptyCandidate('Baseline · evidence needed'), id: 'public-baseline', components: [unknown('public-baseline-component', 'Current pack · all components')] },
      { ...emptyCandidate('Faerch C 2200-2S · item 2200022012'), id: 'public-tray',
        components: [{ ...unknown('public-tray-body', 'Tray body'), material: 'CPET · recipe 6811', mass: 21.38, provenance: 'Public reference', source: 'faerch-public-sheet', notes: 'Nominal tray mass 21.38 g ±10% (19.242–23.518 g). Plastic-only mass is not separately established. Recycled fraction is unknown. 900 ml, two 450 ml compartments. Lid excluded.' }, unknown('public-tray-lid', 'Lid · specification needed')],
        maxTemp: 220, notes: 'Manufacturer product sheet dated 9 January 2023. Temperature entry is a published limit, not permission for a particular food, duration or current production lot. Confirm current SKU documentation. Public recyclability marking does not establish local collection or recycling.' },
    ],
    evidence: [{ id: 'faerch-public-sheet', issuer: 'Faerch A/S · public distributor-hosted product sheet', documentId: 'C 2200-2S · item 2200022012', version: '9 January 2023 · checked 26 September 2026', page: 1,
      passage: '21,38 g\n+/- 10%\n220 °C', claim: 'Nominal tray weight, weight tolerance and maximum temperature; exact item 2200022012.',
      scope: 'C 2200-2S Evolve CPET tray body only. Source table checked visually; not reviewed for a purchasing decision.',
      limitations: 'Page 3 directs readers to obtain current recycled-content information. No guaranteed fraction entered. Current declaration, lid, price, baseline, contact duration and trial results are missing. Public PDF: ' + publicSheet,
      type: 'Public reference', reviewed: false }], pilot,
  };
}
