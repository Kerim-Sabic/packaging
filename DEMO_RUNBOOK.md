# Demo runbook

## Before presenting

1. In the repository, run `./scripts/start.ps1`. If this is a fresh clone, run `./scripts/setup.ps1` first.
2. Open [the app](http://127.0.0.1:4173/#/app). The local service indicator reports AI readiness; core manual work does not depend on it. Model health: `http://127.0.0.1:8080/health`. Backend: `http://127.0.0.1:8000/health`.
3. Export any real cases through **Data → Export all cases** before resetting. **Data → Reset demonstration data** requires confirmation. Pitch **Reset** affects only its isolated demo state.
4. Open [pitch](http://127.0.0.1:4173/#/pitch) and [presenter](http://127.0.0.1:4173/#/presenter) in the same browser. Presenter controls use BroadcastChannel. Choose fullscreen and the desired motion preference.
5. For dependable delivery, use the recorded extraction on slide 3. It was produced by the local model from synthetic documents and is visibly labelled. Do not describe replay as live inference.

## Controls and 180-second story

Right / Space: next reveal, then next slide. Left: previous reveal/slide. Home: reset. Typing in inputs is not intercepted. Buttons remain normally keyboard-accessible. Numbered controls jump directly to a slide. **Interact manually** allows editing shared demonstration components; **Reset** restores the deterministic starting state. There are no timed animation chains or automatic inference waits.

- 0–15 s, slide 1: ask which package uses less virgin plastic; the illustrated cover establishes the choice. Show the working product once to reveal native package schematics.
- 15–40 s, slide 2: start on the illustrated total-plastic frame. Show the working product reveals native total plastic; Next reveal switches to virgin portions on the same scale. Point to the changed lowest annotation and unverified equivalence.
- 40–70 s, slide 3: **Show the working product** loads the recorded local review. Inspect the passage and scope. Select a supported recycled-content proposal and accept it only after review; an existing confirmed value asks for replacement confirmation. Conflicting mass values need explicit correction/resolution. The working Documents tab offers the full review surface.
- 70–95 s, slide 4: the illustration previews the mismatch. Show the working product displays the initial 200°C requirement; Next reveal changes it to 250°C against 220°C. Other checks remain unverified below the limit. Manual mode exposes the input and all six checks.
- 95–125 s, slide 5: show the 2–27 g range, >60% threshold and supplier question. Show the working product displays the threshold and supplier question. Next reveal adds the separate Case A annual scenario. Manual mode permits a hypothetical recycled value and updates the calculation.
- 125–155 s, slide 6: Show the working product reveals the brief generated from current pitch case state. Proposed pilot: 10 specifications, 3 shortlisted changes, 1 qualified trial.
- 155–180 s, slide 7: ask for one specification sample, eligible volumes and supplier review. Hold this slide for questions.

Speaker text and cues are in PITCH_SCRIPT.md. Timing is a target; no timed rehearsal is claimed.

## Optional live application demonstration

Components → Separate components → Transform rows into stacked mass. Compare → click a gram value → evidence drawer. Compare → explain per-pack to annual → reveal inputs and annual result. Compare → turn comparison into a pilot brief → open printable report. Documents → upload both synthetic files together → review conflicts and supported fields. Case C → Decision question → enter a hypothetical percentage above 60%, keeping the scenario label visible.

## Failure / offline recovery

- Model failure: do not wait on stage. Cancel review and use **Load recorded demo** or manual entry. Extracted text remains available on inference errors.
- Backend failure: the app, pitch, manual cases and recorded replay remain usable. Inspect `.local/backend.err.log`, then stop/start the project.
- Another laptop without dependencies: unzip PackProof-offline.zip and double-click START_OFFLINE.cmd. Python is the only prerequisite. This serves the built app on loopback without internet, Node or model. Model/document service is optional.
- Port conflict: stop only the service you recognize; project scripts never kill an unrelated process. Stop the project with `./scripts/stop.ps1` before starting the offline server.
- Pitch state confusion: Home / Reset. Saved workbench cases are unaffected.
- Browser problem: [print fallback](http://127.0.0.1:4173/#/print), then Print / save PDF. The default view prints seven illustrated slides. Toggle Print live calculation slides instead for seven native slides plus eleven backup topics. Delivered PDFs provide both.

Never imply that the synthetic temperatures, costs, masses or sources are actual Profi or supplier measurements. No external sending is performed.

## Investor / judge questions

Show Real-world context for dated primary-source facts, Pilot plan for owners and nine retail checks, and History for the local change record. Use INVESTOR_BRIEF.md and JUDGING_MAP.md for the commercial hypothesis and roadmap. Do not imply committed pilots, validated savings, regulatory certification, market size or customers.
