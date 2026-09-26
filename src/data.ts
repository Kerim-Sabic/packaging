import {
  type Case,
  type Candidate,
  type Component,
  emptyCandidate,
} from "./domain";
const comp = (
  id: string,
  name: string,
  p: number,
  r: number | null,
): Component => ({
  id,
  name,
  material: "Plastic",
  mass: p,
  plastic: p,
  recycled: r,
  provenance: "Illustrative assumption",
  source: "demo",
  notes: "Not measured Profi data. Functional equivalence unverified.",
});
const candidate = (
  id: string,
  name: string,
  components: Component[],
  price: number,
): Candidate => ({
  ...emptyCandidate(name),
  id,
  components,
  price,
  handling: 0,
  other: 0,
  implementation: 3000,
});
export function demos(): Case[] {
  const a: Case = {
    id: "case-a",
    name: "Ready-meal packaging",
    description:
      "Compare a current tray, pouch and high-PCR tray for one retail purchasing decision.",
    illustrative: true,
    units: 1000000,
    adoption: 1,
    temperature: null,
    hours: null,
    use: "Chilled ready meal",
    food: true,
    baseline: "current",
    selected: "pcr",
    candidates: [
      candidate(
        "current",
        "Current tray",
        [comp("tray", "Tray", 20, 0.3), comp("lid", "Lid", 3, 0)],
        0.24,
      ),
      candidate("pouch", "Pouch", [comp("pouch-c", "Pouch", 9, 0)], 0.2),
      candidate(
        "pcr",
        "High-PCR tray",
        [comp("pcr-tray", "Tray", 16, 0.9), comp("pcr-lid", "Lid", 3, 0)],
        0.22,
      ),
    ],
    evidence: [
      {
        id: "demo",
        issuer: "PackProof demo author",
        documentId: "ILLUSTRATIVE-A",
        version: "1",
        page: null,
        passage:
          "Current: 20 g tray, 30% recycled + 3 g virgin lid. Pouch: 9 g virgin plastic. Alternative: 16 g tray, 90% recycled + 3 g virgin lid.",
        claim: "Illustrative component assumptions only",
        scope: "Case A mass comparison",
        limitations:
          "Not a supplier declaration. Functional equivalence unverified.",
        type: "Illustrative assumption",
        reviewed: false,
      },
    ],
  };
  const b: Case = structuredClone(a);
  b.id = "case-b";
  b.name = "Hot-food use check";
  b.description =
    "Entered requirement versus an illustrative documented maximum.";
  b.temperature = 250;
  b.hours = 6;
  b.use = "In-oven";
  b.candidates = b.candidates.filter((c) => c.id !== "pouch");
  b.candidates[1].maxTemp = 220;
  b.candidates[1].maxHours = 2;
  b.candidates[1].useScope = "In-oven";
  const c: Case = structuredClone(a);
  c.id = "case-c";
  c.name = "Non-food bottle & cap";
  c.description =
    "Resolve one missing recycled percentage before choosing a trial.";
  c.use = "Non-food detergent";
  c.food = false;
  c.baseline = "bottle-base";
  c.selected = "bottle-unknown";
  c.candidates = [
    candidate(
      "bottle-base",
      "Current bottle",
      [comp("base-b", "Bottle", 20, 0.5), comp("base-cap", "Cap", 2, 0)],
      0.2,
    ),
    candidate(
      "bottle-unknown",
      "PCR bottle",
      [comp("unknown-b", "Bottle", 25, null), comp("unknown-cap", "Cap", 2, 0)],
      0.24,
    ),
  ];
  c.evidence[0].passage =
    "Illustrative bottle scenario: current 20 g at 50% plus 2 g virgin cap; candidate 25 g with unknown recycled fraction plus 2 g virgin cap.";
  c.evidence[0].scope = "Case C";
  return [a, b, c];
}
