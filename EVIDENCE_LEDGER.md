# Public exact-product review added 26 September 2026

Faerch C 2200-2S Evolve CPET, item 2200022012, recipe 6811. Manufacturer-authored sheet hosted by a distributor, dated 9 January 2023. [Public PDF](https://verkkokauppa.daytongroup.fi/PDF%20Files/Product%20Sheets/Faerch%20Trays/Faerch%20C%202200-2S%20Product%20Sheet.pdf). Page 1 visually checked: nominal tray mass 21.38 g ±10%, capacity 900 ml across two compartments, maximum temperature 220°C. Page 3 does not establish a guaranteed recycled fraction and requests current recipe information through the supplier.

The app's **Real-world context → Open sourced SKU review** loads these facts without overwriting saved work. Tray-only nominal mass is recorded; plastic-only mass, recycled fraction, lid and baseline remain unknown. No annual saving, current-use approval, supplier relationship or actual recycling is inferred. The nominal mass tolerance is retained in notes, not silently used as a verified mass. This public-source review is separate from all three illustrative cases. The source is linked, not redistributed.

# Evidence ledger

Checked 26 September 2026. Public references provide context only and are not attached to fictional specifications as supplier proof.

| Record | Source and verified content | Scope / limitation |
|---|---|---|
| REF-EC-PPWR | [European Commission: packaging waste](https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en). Reports 40% of EU plastics used in packaging; PPWR in force 11 February 2025, application 12 August 2026. | Policy context, not a SKU compliance finding. Different provisions have different dates, conditions and exceptions. |
| REF-ESTAT-2023 | [Eurostat release, 22 October 2025](https://ec.europa.eu/eurostat/en/web/products-eurostat-news/w/ddn-20251022-1). 2023 EU plastic packaging waste: 35.3 kg/person; 42.1% recycled. | Economy-wide EU waste statistics; not a Romanian collection rate, product LCA, addressable market or measured PackProof impact. |
| REF-EC-FCM | [European Commission: food-contact legislation](https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/legislation_en). Describes Regulation (EC) 1935/2004 as the general EU framework and includes documentation/traceability principles. | Context for asking for relevant documentation. Not an exact-SKU approval or exhaustive legal analysis. |
| REF-EC-RP | [European Commission: plastic recycling](https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/plastic-recycling_en). Describes Regulation (EU) 2022/1616 and the framework for recycled plastics intended for food contact. | Recycled percentage alone cannot establish food-contact suitability. No automated legal conclusion is implemented. |
| REF-FAERCH | [Faerch CPET materials page](https://www.faerch.com/en/packaging/materials/cpet). Family-level page discusses freezer-to-oven performance and mentions 220°C ovens. | Not a declaration for the synthetic PP-DEMO-016 SKU. Oven temperature must not be silently converted into actual package contact conditions, and duration/use documentation is needed. The Case B 220°C value is explicitly an illustrative entered assumption. |
| REF-KP | [kp Eternal product family](https://www.kpfilms.com/en/food-packaging/protein-food-packaging/eternal). Contains an upper-bound recycled-content claim, “up to 100%”. | Upper bound, not a guaranteed minimum for a specific SKU or lid. No claim about universal recyclability, collection or actual retail use is made. |
| MODEL-QWEN | [Official Qwen model card](https://huggingface.co/Qwen/Qwen3-8B-GGUF); official Q5_K_M artifact verified via repository API. Apache-2.0; llama.cpp integration documented. | Model capability is tested only on two short synthetic documents. See LOCAL_AI_SETUP.md. |

## Illustrative numerical inputs

Case A: 20 g plastic tray at 30% recycled + 3 g virgin lid = 17 g virgin; 9 g virgin pouch = 9 g; 16 g tray at 90% + 3 g virgin lid = 4.6 g. Total plastic is 23 / 9 / 19 g. At 1,000,000 eligible units × 100% adoption, potential virgin reduction is 12.4 tonnes per year. Functional equivalence is unverified.

Case B: actual entered requirement 250°C versus illustrative maximum 220°C, and 6 h requirement versus entered 2 h duration. These produce mismatches, not supplier/legal findings.

Case C: baseline 20 g bottle at 50% + 2 g virgin cap = 12 g virgin. Alternative 25 g bottle at unknown recycled percentage + 2 g cap = 2–27 g virgin. Crossover is strictly above 60%; equality at 60%. Package prices €0.20 versus €0.24 intentionally make the alternative's recurring cost worse.

All package prices, zero entered handling/other recurring costs, €3,000 implementation costs, eligible volumes and adoption fractions are illustrative assumptions. They are not quotations, measured costs, commitments or business-case evidence. No CO₂ factor is used. No full LCA is claimed.

## Synthetic extraction records

`public/demo/spec-1.txt` and `spec-2.txt` are authored fixtures. Every document carries **SYNTHETIC DEMO DOCUMENT — NOT A SUPPLIER DECLARATION.** DEMO-01 states a 16 g tray and tray-only guaranteed 90% PCR, an unknown lid percentage, a 220°C / 2 h illustrative condition and an upper-bound marketing claim. DEMO-02 states a contradictory 18 g mass. These sources are never presented as Faerch or kp documents.

`public/demo/extraction-recorded.json` is a real local inference output from these two fixtures, guarded for schema/passage/status checks. It is bundled solely as the labelled offline replay. Exact quotations are authored synthetic text, not copied supplier declarations. Human acceptance of a synthetic value keeps its evidence type illustrative. Confirmed values are not automatically overwritten.

## Source-version caution

The current kp Eternal canonical page says up to 100%, while a separately indexed legacy `/0-new-food-packaging/` page states 30%. This is why PackProof requires exact source, version, SKU and component scope. Neither page establishes the 90% assumption in the synthetic case. Public references were re-opened during final verification. Sources are summarized in the app’s Real-world context tab with explicit boundaries.
