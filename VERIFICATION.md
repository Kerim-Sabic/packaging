# Verification — 26 September 2026

## Environment actually used

Windows workstation, Node 22.18.0, Python 3.12.10, two NVIDIA RTX 5080 GPUs (16 GB each), driver 591.86. Qwen3-8B-Q5_K_M was run through installed llama-server 0.4.1-dev build 11026 / b49650adb with Vulkan0, one GPU, 8,192 context, one request slot and reasoning disabled. This is not a CUDA or combined-GPU test. See LOCAL_AI_SETUP.md for reproducible configuration.

## Passed

- Setup installed dependencies and completed a production build. A re-run with an older running frontend initially met a locked dependency file; setup now refuses that recorded-running-frontend condition. Re-run after stopping succeeded.
- Final `npm.cmd run build`, `npm.cmd run typecheck`, `npm.cmd run check` passed. Checks include 17 / 9 / 4.6 g, 12.4 t at the stated illustrative scenario, bounded unknowns, invalid inputs, mismatch, post-cooking unknowns, negative savings, no false payback, crossover/tie/out-of-range/zero/multiple-unknown cases, active-data brief and JSON/CSV validation.
- Added pilot tests passed: nine default retail checks, rejection of unsupported passed results, failed-test stop status and persistence round trip.
- Real local inference on two authored synthetic text documents passed mass/unit, component percentage scope, upper-bound ambiguity, missing field, source passage and conflicting-value assertions. Output: 26 proposals (11 supported, 1 ambiguous, 10 conflicting, 4 not found). Prompt version 1.2 initially failed by returning only missing fields; version 1.3 with explicit schema examples passed. This tiny fixture does not establish general accuracy.
- Browser walkthrough: compare, edit percentage and volume, refresh persistence, source drawer, hot-food mismatch, post-cooking unknowns, current-data printable brief, upload/review, recorded acceptance, threshold update and all eight motion sequence representative states. Details in MOTION_CHECKLIST.md.
- Browser pilot walkthrough: entered owner/200 units/criterion; Passed without a result was rejected; recorded synthetic observation and Failed produced a stop status. The brief contained those exact records. History persisted after reload.
- Frontend-only run with backend/model stopped: manual cases, saved calculations, pitch and labelled recorded extraction worked. Bundled assets use loopback; public references open only on deliberate link clicks.
- Final start → stop → start cycle terminated only the recorded services and returned healthy app/backend/model. `/health` reported `aiReady: true` after model loading. The start message may initially report false while weights load.
- Keyboard navigation and presenter command delivery worked. New presenter windows now request the existing pitch position; synchronization was checked at slide 5. Reduced-motion/fullscreen controls were exercised, but no frame-level accessibility or external display audit is claimed.
- All seven generated artwork images and representative live slide states were visually reviewed. Exported a seven-page widescreen artwork PDF and a native calculation PDF with backup topics. Fixed native print scale, footer crowding, preview clipping and backup heading fragmentation.
- Dated public facts were checked directly against European Commission, Eurostat and manufacturer pages. Supplier family claims remain separate from fictional case evidence.

## Scope and known limits

No production deployment or enterprise security review. No real retailer trial, measured savings, shelf-life validation, general AI accuracy score, user study or timed three-minute rehearsal. No scanned-PDF OCR engine. No exhaustive encrypted/oversized/malformed PDF fuzz test, mobile-device matrix, external projector test or cold setup on a second computer. Browser controls are built for desktop presentation; keyboard and manual fallback remain available.

Local history is mutable browser data, not a tamper-proof audit. Source matching checks quotation presence, not semantic truth. The model can still misunderstand scope; a person must review each proposal. Recycled content, virgin-plastic reduction and recyclability are separate questions. No CO2 conversion, LCA or automated legal/food-safety approval is provided.

The generated artwork is static and illustrative; edited values are authoritative only in the live app/reveals and current-data reports. All masses, costs and projected reductions in bundled cases are explicitly illustrative.

Final presentation browser was reset to the original three demonstration cases and verified at 4.6 g. A three-page investor discussion PDF and current-data illustrative supplier brief were also exported. The offline ZIP is integrity-checked; the frontend-only runtime was exercised on this workstation, not on a second machine.

## Image-only pitch revision

Replaced all pitch reveal/manual/demo screens with one generated artwork per slide. Removed the print-mode toggle and text backup panel from the pitch. Regenerated slide 2 with both total and virgin-plastic figures. The main application is unchanged. The earlier live-calculation PDF is a legacy artifact and is not included in the revised offline presentation kit.

The revised pitch passed production build and browser checks: Next advanced slide 1→2, Right advanced 2→3, End selected 7 with Next disabled, and a newly opened presenter synchronized at slide 7. Slide 2 artwork was visually checked at presentation size.

## Branded app and judging-script revision

Added two bespoke generated concept photographs and a five-stage review path. Production build passed. New domain checks passed for missing inputs, zero verified coverage for illustrative sources (even when marked reviewed), mismatch priority and failed-trial priority. Browser inspection confirmed both food and non-food case imagery, real source counts, and the hot-food Continue review action opening the correct 250/220 and 6/2 use-check screen. The action now scrolls to the destination rather than leaving the user below the relevant content. Tied lowest values are labelled as a tie in the overview.

Replaced narration with a 346-word rubric-focused script, copied into presenter notes, with delivery cues and eight judge answers. Generated and visually reviewed all three pages of PackProof-speaker-script.pdf. The PDF is also bundled in public/resources for the pitch toolbar and offline use. Presenter timer start, pause and reset were exercised in the browser; reset returned 0:00. This does not constitute a timed spoken rehearsal or a predicted judging score.
