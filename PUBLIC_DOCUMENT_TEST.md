# PackProof — public-document regression record

26 September 2026 · Qwen3-8B-Q5_K_M · local Vulkan inference · extraction version 1.6.

## What was actually tested

Two three-page, manufacturer-authored Faerch PDFs hosted by a distributor. Their layouts are similar. They are not independent manufacturers or a representative dataset. Page-one reference fields were checked visually before evaluation; neither product is presented as functionally interchangeable with the other.

| Document | Reference item | Nominal tray mass | First uncached v1.6 request |
|---|---|---|---|
| C 2200-2S, dated 9 January 2023 | 2200022012 | 21.38 g | 23.1 seconds |
| C 0140-1N, dated 19 April 2023 | 140012032 | 15.43 g | 23.4 seconds |

Both documents identify CPET and list a maximum of 220°C. These are dated manufacturer statements, not present-use approval. Both leave the guaranteed recycled fraction unresolved. Plastic-only component mass is not separately established.

## Result: 12 of 12 specified target checks matched

For each PDF, six checks: exact item, nominal tray mass, material, maximum temperature, no supported invented recycled percentage, and no supported inferred plastic-only mass. The four positive fields must appear on page 1 with supported source quotations. The two negative checks apply across the full review set.

This is **target-field regression coverage**, not 100% extraction accuracy. Other proposals, omissions, units, component scope, dated-source validity and semantic meaning still require human review. These documents were used during development, so this is not a held-out benchmark. The repeatable checker subsequently used the local cache; its subsecond request timings are not inference timings.

## Defects found and addressed

- Plain PDF text order separated table labels from values. Layout extraction now preserves row associations before normalizing whitespace.
- Decimal-comma masses needed consistent numeric validation. Supported decimal-comma values are normalized without altering the quotation.
- An unsupported recycled-content example was proposed. The quotation check blocked it; the prompt now explicitly forbids copying examples as evidence.
- A humidity percentage was mislabelled as temperature. Unit checks now make such proposals ambiguous rather than transferable as supported values.
- A product name was labelled as a document version. The guard now requires a revision marker or date for that field.
- One intermediate prompt revision exceeded the output budget and failed. The final prompt limits proposals per page and uses a larger bounded response budget. Failure retains extracted text for manual review.

The numeric guard deliberately remains conservative: some range endpoints may require manual correction. OCR, diverse suppliers, handwritten scans, multilingual accuracy and independent expert review have not been validated by this test.

## Reproduce

Run `scripts/public-document-check.py` with the first and second downloaded PDF paths while the local backend/model are running. It writes checks to `.local/public-document-check.json` and exits unsuccessfully if any target fails. `scripts/guard-check.py` tests numeric boundaries, signed temperatures, units and unsupported claims without model inference. Raw documents and extracted full text are not included in the distributed application.

Sources:

- [C 2200-2S product sheet](https://verkkokauppa.daytongroup.fi/PDF%20Files/Product%20Sheets/Faerch%20Trays/Faerch%20C%202200-2S%20Product%20Sheet.pdf)
- [C 0140-1N product sheet](https://verkkokauppa.daytongroup.fi/PDF%20Files/Product%20Sheets/Faerch%20Trays/Faerch%20Evolve%20C%200140-1N%20Product%20Sheet.pdf)
