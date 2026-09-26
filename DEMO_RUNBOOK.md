# Image-only pitch runbook

## Start

Run `./scripts/start.ps1` in the repository. On a fresh checkout run `./scripts/setup.ps1` first. Open http://127.0.0.1:4173/#/pitch. The app remains separate at http://127.0.0.1:4173/#/app.

The pitch contains seven full-slide AI-generated images, including every heading and number. No live application screens or calculation reveals appear in it. Local inference is not required to present.

## Controls

- Right / Space / Next slide: advance exactly one artwork.
- Left / Back: previous artwork.
- Home / Reset: first slide. End: closing slide.
- Numbered controls: jump to a slide.
- Presenter: open synchronized notes and controls in a separate tab in the same browser. Use Start/Pause/Reset timer to rehearse against the three-minute target; timing never advances slides automatically.
- Script & Q&A: open the bundled printable speaker copy directly from the presentation toolbar.
- Fullscreen: expand the presentation. Reduce motion: remove crossfades. System reduced-motion preference is also respected.
- Open app: open the working product separately for questions, without changing the pitch.

## 180-second target

Use PITCH_SCRIPT.md for the 346-word narration and exact cues. The presenter view contains the same text. Target slide times: 0–20, 20–48, 48–72, 72–97, 97–120, 120–158, 158–180 seconds. These are rehearsal targets; no timed live delivery is claimed.

Read JUDGE_QA.md before presenting. The separate PackProof-speaker-script.pdf combines the spoken script, delivery cues and eight likely judge questions.

## Offline and recovery

Unzip PackProof-offline.zip and run START_OFFLINE.cmd (Python required). All slide images, fonts and core app assets are included. If a port is already occupied, use the running app or stop only the service you recognize. Project services can be stopped with `./scripts/stop.ps1`.

PackProof-pitch.pdf contains the same seven image-only slides. The `#/print` route also prints only those artworks. If browser projection fails, open that PDF fullscreen. Keep a copy on the presentation laptop.

For questions, use the app’s Real-world context, Pilot plan and History tabs, and the investor brief and judging map. The working app still has all eight interactive demonstration sequences. Never describe generated packaging concepts or illustrative figures as supplier products, actual Profi measurements or verified savings.
