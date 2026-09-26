import { ArrowUpRight } from "lucide-react";
import { publicSheet } from './public-case';
export const references = [
  {
    id: "EC-PPWR",
    issuer: "European Commission",
    title: "Packaging and packaging waste",
    url: "https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en",
    fact: "40% of plastics used in the EU are used in packaging. The Commission lists 12 August 2026 as the PPWR application date.",
    meaning:
      "Packaging decisions now need durable records of composition and supporting evidence.",
    limit:
      "Policy context, not a determination that a specific packaging obligation applies to a SKU. Different requirements have different dates and exceptions.",
  },
  {
    id: "ESTAT-2023",
    issuer: "Eurostat · 22 October 2025",
    title: "Plastic packaging waste in the EU: 35.3 kg per person",
    url: "https://ec.europa.eu/eurostat/en/web/products-eurostat-news/w/ddn-20251022-1",
    fact: "In 2023, the EU generated 35.3 kg of plastic packaging waste per person and recycled 42.1% of its plastic packaging waste.",
    meaning:
      "Recycled content and actual end-of-life recycling are different questions. We track the former and require evidence for the latter.",
    limit:
      "EU-wide 2023 waste statistics, not a Romanian collection rate, a product footprint, or a market-size estimate.",
  },
  {
    id: "FAERCH-CPET",
    issuer: "Faerch · manufacturer reference",
    title: "CPET material family",
    url: "https://www.faerch.com/en/packaging/materials/cpet",
    fact: "The manufacturer describes freezer-to-oven performance from −40°C freezers to 220°C ovens for its CPET material family.",
    meaning:
      "A 250°C oven requirement cannot be assumed compatible with a 220°C family reference.",
    limit:
      "Not documentation for our fictional tray. Obtain exact SKU, food type, actual contact conditions, duration and lid restrictions.",
  },
  {
    id: "KP-ETERNAL",
    issuer: "Klöckner Pentaplast · manufacturer reference",
    title: "kp Eternal product family",
    url: "https://www.kpfilms.com/en/food-packaging/protein-food-packaging/eternal",
    fact: "This product-family page describes recycled content of up to 100% and conditions recyclability on suitable infrastructure.",
    meaning:
      "“Up to” does not establish the guaranteed percentage of the tray in a purchasing order, and does not cover the lid.",
    limit:
      "Manufacturer marketing claim, not an independent certification. Public page variants differ: confirm version and exact SKU with the supplier.",
  },
  {
    id: "EC-FCM",
    issuer: "European Commission",
    title: "Food-contact materials legislation",
    url: "https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/legislation_en",
    fact: "Regulation (EC) 1935/2004 is the general framework for food-contact materials in the EU.",
    meaning:
      "Keep food-contact documentation and intended-use scope alongside material calculations.",
    limit: "This app is not a food-safety or legal approval service.",
  },
  {
    id: "EC-RECYCLED",
    issuer: "European Commission",
    title: "Recycled plastics for food contact",
    url: "https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/plastic-recycling_en",
    fact: "The Commission describes Regulation (EU) 2022/1616 for recycled plastic materials and articles intended to contact food.",
    meaning:
      "A high recycled percentage alone does not establish food-contact suitability.",
    limit:
      "Context only. Qualified people must review the relevant exact-product documentation.",
  },
];
export function RealContext({ onOpenCase }: { onOpenCase: () => void }) {
  return (
    <div className="real-context">
      <div className="eyebrow">PUBLIC EVIDENCE / CHECKED 26 SEPTEMBER 2026</div>
      <h2>A real problem. A traceable starting point.</h2>
      <p className="context-intro">
        Public facts explain why this workflow matters. They never silently
        become supplier evidence for a demo package.
      </p>
      <div className="context-metrics">
        <div>
          <strong>40%</strong>
          <span>of plastics used in the EU go into packaging</span>
          <small>European Commission · EC-PPWR</small>
        </div>
        <div>
          <strong>42.1%</strong>
          <span>EU plastic packaging waste recycled in 2023</span>
          <small>Eurostat · ESTAT-2023</small>
        </div>
        <div>
          <strong>12 Aug 2026</strong>
          <span>PPWR application date</span>
          <small>European Commission · EC-PPWR</small>
        </div>
      </div>
      <div className="reference-grid">
        <article>
          <div className="eyebrow">EXACT PRODUCT / PUBLIC REVIEW</div>
          <h3>A real SKU. An honest evidence gap.</h3>
          <p>Faerch C 2200-2S · item 2200022012. The January 2023 sheet lists a 21.38 g tray (±10%), 900 ml capacity and a 220°C maximum.</p>
          <div className="reference-meaning">The guaranteed recycled fraction is missing. A lighter-looking claim cannot become a verified saving.</div>
          <small>Tray body only. Current declaration, lid, baseline, quote and trial evidence still required. This is not a supplier partnership.</small>
          <a href={publicSheet} target="_blank" rel="noreferrer">Inspect public product sheet <ArrowUpRight size={15} /></a>
          <button className="primary" onClick={onOpenCase}>Open sourced SKU review <ArrowUpRight size={15} /></button>
        </article>
        <article>
          <div className="eyebrow">PROPOSED PILOT / COMMERCIAL TEST</div>
          <h3>Six weeks. One accountable decision.</h3>
          <p>10 specifications → 3 alternatives → 1 trial plan. Proposed fixed fee: €1,500, excluding taxes and physical testing.</p>
          <div className="reference-meaning">Target 30% less review time with no increase in critical errors. Procurement, quality and operations agree the release gates.</div>
          <small>Price and targets are hypotheses. No paid customer, retail trial or measured saving is claimed.</small>
          <a href="./resources/pilot-offer.pdf" target="_blank" rel="noreferrer">Read pilot offer and evaluation plan <ArrowUpRight size={15} /></a>
        </article>
        {references.map((r) => (
          <article key={r.id}>
            <div className="eyebrow">
              {r.id} / {r.issuer}
            </div>
            <h3>{r.title}</h3>
            <p>{r.fact}</p>
            <div className="reference-meaning">{r.meaning}</div>
            <small>{r.limit}</small>
            <a href={r.url} target="_blank" rel="noreferrer">
              Read primary source <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </div>
      <p className="context-intro">
        Sources open externally only when clicked. These summaries remain
        available offline. All package masses, costs and projected savings in
        the three bundled cases remain illustrative.
      </p>
    </div>
  );
}
