# Image-only pitch runbook

## Start

Run `./scripts/start.ps1` in the repository. On a fresh checkout run `./scripts/setup.ps1` first. Open http://127.0.0.1:4173/#/pitch. The app remains separate at http://127.0.0.1:4173/#/app.

The pitch contains seven full-slide AI-generated images, including every heading and number. No live application screens or calculation reveals appear in it. Local inference is not required to present.

## Controls

- Right / Space / Next slide: advance exactly one artwork.
- Left / Back: previous artwork.
- Home / Reset: first slide. End: closing slide.
- Numbered controls: jump to a slide.
- Presenter: open synchronized notes and controls in a separate tab in the same browser.
- Fullscreen: expand the presentation. Reduce motion: remove crossfades. System reduced-motion preference is also respected.
- Open app: open the working product separately for questions, without changing the pitch.

## 180-second target

1. 0–15 s: ask which package uses less virgin plastic.
2. 15–40 s: point to 23 / 9 / 19 g total plastic, then 17 / 9 / 4.6 g virgin plastic. The lid is included. All figures are illustrative.
3. 40–70 s: explain source → proposal → human confirmation. The image depicts a synthetic review; it is not a live extraction.
4. 70–95 s: explain why 250 versus 220 is a mismatch and why other use conditions need independent evidence.
5. 95–125 s: above 60% changes the bottle ranking; 60% is a tie. Explain the question to ask a supplier.
6. 125–155 s: proposed pilot: 10 specifications, 3 shortlisted changes, 1 qualified trial. No commitment claimed.
7. 155–180 s: ask for specifications, eligible volumes and supplier review. Hold for questions.

See PITCH_SCRIPT.md for narration. This is a target, not a timed rehearsal result.

## Offline and recovery

Unzip PackProof-offline.zip and run START_OFFLINE.cmd (Python required). All slide images, fonts and core app assets are included. If a port is already occupied, use the running app or stop only the service you recognize. Project services can be stopped with `./scripts/stop.ps1`.

PackProof-pitch.pdf contains the same seven image-only slides. The `#/print` route also prints only those artworks. If browser projection fails, open that PDF fullscreen. Keep a copy on the presentation laptop.

For questions, use the app’s Real-world context, Pilot plan and History tabs, and the investor brief and judging map. The working app still has all eight interactive demonstration sequences. Never describe generated packaging concepts or illustrative figures as supplier products, actual Profi measurements or verified savings.
