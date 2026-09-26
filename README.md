# PackProof

**Less virgin plastic. Evidence attached.** A complete local packaging decision workbench and seven-slide motion pitch. All bundled examples are **illustrative scenarios — not measured Profi data**.

## Start on Windows

From this repository in PowerShell:

```powershell
./scripts/setup.ps1
./scripts/start.ps1
```

Setup installs pinned frontend/Python dependencies and builds the application. Repeat setup only when dependencies change. Node.js 22+ and Python 3.11+ are required (tested with Node 22.18.0 and Python 3.12.10). It does not change drivers or PowerShell policy. If your policy prevents local scripts, use an appropriately permitted PowerShell session; no global security change is required by this project.

```powershell
./scripts/stop.ps1
```

Stop terminates only recorded project processes whose PID and start time match. Existing unrelated services are never stopped. Ports are 4173 (app), 8000 (document service), and 8080 (model), all bound to 127.0.0.1.

## Open

- [Application](http://127.0.0.1:4173/#/app)
- [Pitch](http://127.0.0.1:4173/#/pitch)
- [Presenter notes and controls](http://127.0.0.1:4173/#/presenter)
- [Print-friendly deck](http://127.0.0.1:4173/#/print)
- Pilot report: `#/brief/<case-id>` from **Prepare pilot brief**.

## What works

Create, duplicate and edit cases; compare multiple candidates; edit component and evidence records; switch total/virgin plastic; inspect equations; independently screen use requirements; change eligible volume, adoption and costs; derive recycled-content crossover questions; prepare, print and export current-data pilot reports; export/import versioned JSON; import documented CSV; reset demos with confirmation. Plan nine retail trial checks, assign owners, record acceptance criteria and results, and review a local activity history. A failed trial produces a stop status; a passed result requires recorded criteria and an observation.

Local PDF/text extraction creates proposals with exact page-associated passages. A human can accept, correct, reject or leave them unresolved. Existing values require explicit replacement confirmation. Accepted values reference a new evidence record. Proposals remain separate in versioned browser storage. Synthetic sources stay illustrative even when accepted.

The pitch is entirely image-generated: seven full-slide artworks, including all text, with a simple crossfade. Every Next or arrow press advances one slide. There are no live calculation screens or reveal steps in the pitch. The comparison artwork includes both total and virgin plastic values. The working app is separate. Keyboard navigation, synchronized presenter notes, fullscreen, reduced motion and an image-only print/PDF view are provided.

## Offline / different laptop

The delivered `PackProof-offline.zip` includes the built app, local fonts, synthetic fixtures, replay and standard-library server. Unzip it and double-click `START_OFFLINE.cmd`, or run `python scripts/serve-offline.py`. Only Python is needed; no npm, model, internet or pip dependencies are needed for this path. Start it with port 4173 free. Manual entry, comparisons, saved cases, thresholds, reports, pitch and recorded extraction work. Live AI requires the full setup. Do not open `dist/index.html` directly using `file://`; use the included loopback server.

LocalStorage belongs to the exact browser origin. Export JSON before moving laptops or browsers. It contains confirmed cases and evidence, not pending proposals or backend cache. Reset replaces cases only. **Clear this review** deletes browser proposals; **Data → Clear extraction cache** deletes backend caches. Original upload files are not retained on disk by the service; extracted page text is retained in cache/results. No confidential document text is logged by default.

## CSV format

UTF-8, exact header, six **unquoted** columns, one component per row. No commas/newlines within cells. Empty numerical cells mean unknown; do not write `0` for an unknown. Components sharing a candidate name are grouped into a new candidate; costs and use limits stay unknown.

```csv
candidate,component,material,total_g,plastic_g,recycled_percent
Imported tray,Tray,PET,16,16,90
Imported tray,Lid,PE,3,3,0
```

Use **Data → Download sample CSV**. Invalid numbers, negative masses, plastic mass above total mass and out-of-range recycled percentages are rejected. JSON format is `{ "version": 1, "cases": [...] }`; use an export as the complete schema example.

## Architecture and bounds

React + TypeScript + Vite, Motion, bundled Geist, CSS tokens and SVG. Production startup serves built files with a Python standard-library loopback server. LocalStorage version 1. Python FastAPI, pypdf and a loopback llama.cpp adapter. No cloud database, authentication, paid APIs, telemetry, public tunnel or document transmission. Model files, local logs/caches, uploads, environment files and dependencies are excluded from Git.

Maximum extraction: 4 documents, 20 MB total, 30 PDF pages per file, 8 × 6,000-character chunks. Unprocessed pages and text are listed; partial review is never labelled complete. Scanned pages require externally supplied OCR/searchable text. Encrypted PDFs are rejected. One active extraction request, 90-second per-model-request timeout, five-minute client limit, cancellation, at most one schema repair. Cache keys include content hashes, model ID, prompt/schema version and processing configuration.

## Verification

```powershell
npm.cmd run build
npm.cmd run typecheck
npm.cmd run check
./.venv/Scripts/python.exe scripts/extraction-check.py
```

See `VERIFICATION.md` for observed results, `MOTION_CHECKLIST.md` for motion states, `LOCAL_AI_SETUP.md` for the actual GPU profile, and `DEMO_RUNBOOK.md` for tomorrow's presentation. No broad model accuracy, timed rehearsal, measured environmental savings or qualified retail trial is claimed. See JUDGING_MAP.md and INVESTOR_BRIEF.md for rubric coverage, commercial hypotheses and proposed pilot milestones. The Real-world context tab has six dated primary references.

## Limits

This is decision support, not packaging, food-safety, shelf-life or legal certification. A reviewed document does not independently prove a package fit for use. Screening uses human-entered scope/limits and evidence review, not a legal rules engine. Costs use one EUR scenario without tax, discounting or currency conversion. No full LCA or invented CO₂ factor. Trial owners must set operational acceptance limits, assess product loss, and resolve evidence gaps before a trial.

The model can still misread context; quotation presence does not prove semantic correctness. Conflict detection is conservative and may flag wording/version differences. Long PDFs are bounded, not exhaustively reviewed. No OCR engine is bundled. GPU testing used Vulkan on one RTX 5080, not CUDA or pooled GPU memory.
