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
  "0–15s",
  "15–40s",
  "40–70s",
  "70–95s",
  "95–125s",
  "125–155s",
  "155–180s",
];
export const notes = [
  "A procurement manager sees three packages: a current tray, a lighter pouch, and a tray with high recycled content. Which uses less virgin plastic? PackProof makes that decision visible, with the evidence beside it. These are illustrative numbers, not measured Profi data.",
  "By total plastic, the nine-gram pouch looks best. Compare virgin plastic and the order changes. The current package contains seventeen grams; the pouch, nine; the high-PCR tray, four point six. We count the lid separately. Lower virgin plastic is a reason to investigate, while functional equivalence still needs evidence.",
  "Specifications become proposals, never automatic truth. Our local model extracts a value, its component scope, and an exact source passage. A person accepts, corrects, or rejects it. The application handles unstated lid percentages and contradictory masses. Its recorded extraction is clearly labelled; manual review works without inference. This slide illustrates the review process.",
  "The smallest number cannot override the intended use. Here, an entered two-hundred-and-fifty-degree requirement exceeds the illustrative two-hundred-and-twenty-degree limit. That is a mismatch. Reducing temperature would only address that check. Duration, food-contact scope, protection, and line compatibility need their own evidence. Switching to post-cooking still requires actual contact conditions.",
  "Missing information can change the ranking. For this bottle, recycled content above sixty percent beats the current bottle on virgin plastic, with other values fixed. At sixty percent they tie. PackProof turns that threshold into a precise supplier question. Separately, our tray scenario gives twelve point four tonnes of potential annual reduction at one million units and full adoption.",
  "The output is a supplier-ready pilot brief: the baseline, component arithmetic, costs, assumptions, missing evidence, required tests, and stop criteria. Our proposed pilot reviews ten specifications, shortlists three changes, and aims for one qualified trial. Owners and acceptance limits must be agreed before testing. There is no claimed supplier or retailer commitment.",
  "We are asking for a packaging specification sample, eligible volumes, and one supplier review. Excel can do the arithmetic. Our value is keeping document review, evidence, requirements, and the next action together. We will test that value in one purchasing decision. Less virgin plastic. Evidence attached.",
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
