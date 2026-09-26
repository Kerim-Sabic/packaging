import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Maximize,
  RotateCcw,
} from "lucide-react";
export const titles = [
  "Which package uses less virgin plastic?",
  "Less plastic can still mean more virgin plastic.",
  "From specification to traceable facts.",
  "The lowest number is not enough.",
  "Ask the question that changes the decision.",
  "Start with one purchasing decision.",
  "Give us the specification. We’ll show the decision.",
];
export const timings = [
  "0–20s",
  "20–48s",
  "48–72s",
  "72–97s",
  "97–120s",
  "120–158s",
  "158–180s",
];
export const notes = [
  "Packaging uses forty percent of plastics consumed in the EU. For Profi, progress starts with a purchasing decision: which pack reduces virgin plastic while protecting the product? PackProof brings the comparison, evidence and next action together. These examples are illustrative, not measured Profi data.",
  "The lightest pack is the nine-gram pouch. But count virgin plastic, including the lid, and the ranking changes: seventeen grams in the current tray, nine in the pouch, four point six in the high-PCR tray. At one million eligible packs and full adoption, that is twelve point four tonnes of potential annual reduction. Functional equivalence still needs validation.",
  "The working app runs locally. A specification becomes proposed facts with component scope and an exact source passage. A person accepts, corrects or rejects each proposal. Missing values stay unknown; conflicting values need resolution. That evidence follows the calculation into a supplier-ready brief. This image illustrates the process.",
  "Now the retail reality. A two-hundred-and-fifty-degree requirement exceeds this illustrative two-hundred-and-twenty-degree limit. PackProof flags the mismatch. Food-contact conditions, holding time, grease resistance, sealing, shelf life and line performance need their own evidence. A lower material number never substitutes for a qualified trial. Owners define measurable acceptance limits and stop criteria.",
  "Uncertainty can become a useful question. This bottle beats the baseline only above sixty percent recycled content, with other inputs fixed. At sixty percent, they tie. PackProof asks for the exact bottle SKU and minimum content, excluding the cap. That focuses the next supplier conversation.",
  "We propose a six-week pilot: ten real specifications, three shortlisted changes and one qualified trial. Procurement, quality and operations own the decision. We measure review time, evidence completeness, costs and product loss. Trial checks include logistics, consumer handling and local recycling evidence. Our commercial hypothesis is a paid review pilot followed by team subscriptions. Scale across categories after repeat value is demonstrated.",
  "Today, the local workbench works; retail outcomes remain to be proven. We are asking for specification samples, eligible volumes and one supplier review. Start with one decision we can defend, then repeat it. PackProof: less virgin plastic. Evidence attached.",
];

export const artworkFiles = [
  "slide-1.png",
  "slide-2-v2.png",
  "slide-3.png",
  "slide-4.png",
  "slide-5.png",
  "slide-6.png",
  "slide-7.png",
];
export function Pitch({ presenter = false }: { presenter?: boolean }) {
  const [slide, setSlide] = useState(0);
  const [reduce, setReduce] = useState(false);
  const systemReduced = useReducedMotion();
  const quiet = reduce || !!systemReduced;
  const [scale, setScale] = useState(1);
  const host = useRef<HTMLDivElement>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const currentSlide = useRef(slide);
  currentSlide.current = slide;
  function move(direction: number) {
    setSlide((s) => Math.max(0, Math.min(titles.length - 1, s + direction)));
  }
  useEffect(() => {
    artworkFiles.forEach((file) => {
      const img = new Image();
      img.src = `./art/${file}`;
    });
  }, []);
  useEffect(() => {
    const bc = new BroadcastChannel("packproof-presenter");
    channel.current = bc;
    bc.onmessage = ({ data }) => {
      if (data.type === "request-position" && !presenter)
        bc.postMessage({ type: "position", slide: currentSlide.current });
      const valid =
        Number.isInteger(data.slide) &&
        data.slide >= 0 &&
        data.slide < titles.length;
      if (data.type === "position" && presenter && valid) setSlide(data.slide);
      if (data.type === "command" && !presenter) {
        if (data.value === "goto" && valid) setSlide(data.slide);
        else if (data.value === "next") move(1);
        else if (data.value === "previous") move(-1);
        else if (data.value === "reset") setSlide(0);
      }
    };
    if (presenter) bc.postMessage({ type: "request-position" });
    return () => bc.close();
  }, [presenter]);
  useEffect(() => {
    if (!presenter) channel.current?.postMessage({ type: "position", slide });
  }, [slide, presenter]);
  function command(value: string) {
    if (presenter) channel.current?.postMessage({ type: "command", value });
    else if (value === "next") move(1);
    else if (value === "previous") move(-1);
    else setSlide(0);
  }
  function goTo(index: number) {
    if (presenter)
      channel.current?.postMessage({
        type: "command",
        value: "goto",
        slide: index,
      });
    else setSlide(index);
  }
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [presenter]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,[contenteditable]",
        )
      )
        return;
      if (e.key === " " && (e.target as HTMLElement).closest("button,a"))
        return;
      if (["ArrowRight", " ", "ArrowLeft", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "End") goTo(titles.length - 1);
        else
          command(
            e.key === "Home"
              ? "reset"
              : e.key === "ArrowLeft"
                ? "previous"
                : "next",
          );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenter]);
  return (
    <MotionConfig reducedMotion={quiet ? "always" : "user"}>
      <div className={`pitch-shell ${quiet ? "reduced-motion" : ""}`}>
        <div className="pitch-toolbar">
          <a className="brand" href="#/app">
            <Layers /> PackProof.
          </a>
          <span aria-live="polite">
            {presenter ? "Presenter controls" : "PackProof pitch"} · {slide + 1}
            /{titles.length}
          </span>
          <div className="button-row">
            <a href="#/app" target="_blank">
              Open app
            </a>
            <button onClick={() => setReduce(!reduce)}>
              {quiet ? "Motion reduced" : "Reduce motion"}
            </button>
            <button
              onClick={() => document.documentElement.requestFullscreen?.()}
              aria-label="Fullscreen"
            >
              <Maximize size={17} />
            </button>
            <a href="./resources/speaker-script.pdf" target="_blank">
              Script &amp; Q&amp;A
            </a>
            <a href="#/print" target="_blank">
              Print slides
            </a>
            {!presenter && (
              <a href="#/presenter" target="_blank">
                Presenter
              </a>
            )}
          </div>
        </div>
        {presenter ? (
          <main className="presenter">
            <div className="eyebrow">
              {timings[slide]} · slide {slide + 1}
            </div>
            <RehearsalTimer />
            <h1>{titles[slide]}</h1>
            <p>{notes[slide]}</p>
            <div className="notice">
              One artwork per slide. Controls address an open pitch in this
              browser.{" "}
              {slide < titles.length - 1
                ? `Next: ${titles[slide + 1]}`
                : "Closing slide — hold for questions."}
            </div>
          </main>
        ) : (
          <div className="pitch-stage" ref={host}>
            <div
              style={{
                width: 1920,
                height: 1080,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute",
                left: `calc(50% - ${960 * scale}px)`,
                top: `calc(50% - ${540 * scale}px)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: quiet ? 0 : 0.3 }}
                >
                  <ArtworkSlide slide={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="pitch-controls">
          <button disabled={slide === 0} onClick={() => command("previous")}>
            <ArrowLeft size={17} />
            Back
          </button>
          <div>
            {titles.map((title, i) => (
              <button
                key={title}
                aria-label={`Slide ${i + 1}: ${title}`}
                aria-current={slide === i ? "step" : undefined}
                title={title}
                className={slide === i ? "active" : ""}
                onClick={() => goTo(i)}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <button onClick={() => command("reset")}>
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            disabled={slide === titles.length - 1}
            className="primary"
            onClick={() => command("next")}
          >
            Next slide
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </MotionConfig>
  );
}
export function PrintDeck() {
  return (
    <div className="print-deck">
      <div className="print-toolbar">
        <a href="#/pitch">← Pitch</a>
        <button onClick={() => window.print()}>Print / save PDF</button>
      </div>
      {titles.map((_, i) => (
        <ArtworkSlide key={i} slide={i} />
      ))}
    </div>
  );
}
function ArtworkSlide({ slide }: { slide: number }) {
  return (
    <section
      className={`slide artwork-slide artwork-${slide + 1}`}
      aria-label={titles[slide]}
    >
      <img
        src={`./art/${artworkFiles[slide]}`}
        alt={`${titles[slide]} ${notes[slide]}`}
        decoding="sync"
      />
      <span className="sr-only">
        AI-generated editorial illustration. Numerical examples are
        illustrative. The separate PackProof application contains editable
        calculations and evidence review.
      </span>
    </section>
  );
}

function RehearsalTimer() {
  const [elapsed, setElapsed] = useState(0),
    [running, setRunning] = useState(false);
  const base = useRef(0),
    started = useRef(0);
  useEffect(() => {
    if (!running) return;
    started.current = performance.now();
    const tick = () =>
      setElapsed(base.current + performance.now() - started.current);
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [running]);
  const seconds = Math.floor(elapsed / 1000);
  function pause() {
    base.current = elapsed;
    setRunning(false);
  }
  return (
    <section
      className={`rehearsal-timer ${seconds > 180 ? "over-time" : ""}`}
      aria-label="Rehearsal timer"
    >
      <div>
        <span className="eyebrow">REHEARSAL / 3-MINUTE TARGET</span>
        <strong>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </strong>
        <small>
          {seconds > 180
            ? "Over target — tighten delivery"
            : "Slides advance manually"}
        </small>
      </div>
      <div>
        <button onClick={() => (running ? pause() : setRunning(true))}>
          {running ? "Pause timer" : elapsed ? "Resume timer" : "Start timer"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            base.current = 0;
            setElapsed(0);
          }}
        >
          Reset timer
        </button>
      </div>
    </section>
  );
}
