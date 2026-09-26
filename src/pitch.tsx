import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { type Case, fmt, totals, threshold } from "./domain";
import { demos } from "./data";
import {
  Annual,
  Brief,
  Comparison,
  Decision,
  Package,
  Requirements,
} from "./components";
import { DocumentReview } from "./extraction";
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
  "By total plastic, the nine-gram pouch looks best. Switch to virgin plastic and the order changes. The current package contains seventeen grams; the pouch, nine; the high-PCR tray, four point six. We count the lid separately. Lower virgin plastic is a reason to investigate, while functional equivalence still needs evidence.",
  "Specifications become proposals, never automatic truth. Our local model extracts a value, its component scope, and an exact source passage. A person accepts, corrects, or rejects it. This synthetic example includes an unstated lid percentage and a contradictory mass. Recorded extraction is clearly labelled, and manual review works without inference.",
  "The smallest number cannot override the intended use. Here, an entered two-hundred-and-fifty-degree requirement exceeds the illustrative two-hundred-and-twenty-degree limit. That is a mismatch. Reducing temperature would only address that check. Duration, food-contact scope, protection, and line compatibility need their own evidence. Switching to post-cooking still requires actual contact conditions.",
  "Missing information can change the ranking. For this bottle, recycled content above sixty percent beats the current bottle on virgin plastic, with other values fixed. At sixty percent they tie. PackProof turns that threshold into a precise supplier question. Separately, our tray scenario gives twelve point four tonnes of potential annual reduction at one million units and full adoption.",
  "The output is a supplier-ready pilot brief: the baseline, component arithmetic, costs, assumptions, missing evidence, required tests, and stop criteria. Our proposed pilot reviews ten specifications, shortlists three changes, and aims for one qualified trial. Owners and acceptance limits must be agreed before testing. There is no claimed supplier or retailer commitment.",
  "We are asking for a packaging specification sample, eligible volumes, and one supplier review. Excel can do the arithmetic. Our value is keeping document review, evidence, requirements, and the next action together. We will test that value in one purchasing decision. Less virgin plastic. Evidence attached.",
];
const maxReveal = [1, 2, 1, 2, 2, 1, 0];
type Position = { slide: number; reveal: number };
export function Pitch({ presenter = false }: { presenter?: boolean }) {
  const [pos, setPos] = useState<Position>({ slide: 0, reveal: 0 }),
    [cases, setCases] = useState(demos),
    [manual, setManual] = useState(false),
    [reduce, setReduce] = useState(false);
  const [scale, setScale] = useState(1);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (let i = 1; i <= 7; i++) {
      const img = new Image();
      img.src = `./art/slide-${i}.png`;
    }
  }, []);
  const channel = useRef<BroadcastChannel | null>(null);
  const currentPosition = useRef(pos);
  currentPosition.current = pos;
  const update = (k: Case) =>
    setCases((cs) => cs.map((c) => (c.id === k.id ? k : c)));
  function move(dir: number) {
    setPos((p) =>
      dir > 0
        ? p.reveal < maxReveal[p.slide]
          ? { ...p, reveal: p.reveal + 1 }
          : { slide: Math.min(6, p.slide + 1), reveal: 0 }
        : p.reveal > 0
          ? { ...p, reveal: p.reveal - 1 }
          : {
              slide: Math.max(0, p.slide - 1),
              reveal: maxReveal[Math.max(0, p.slide - 1)],
            },
    );
  }
  function reset() {
    setCases(demos());
    setPos({ slide: 0, reveal: 0 });
    setManual(false);
    localStorage.removeItem("packproof.proposals.v1.pitch-a");
  }
  useEffect(() => {
    if (pos.slide === 2 && pos.reveal === 0) {
      setCases((cs) =>
        cs.map((k, i) =>
          i
            ? k
            : {
                ...k,
                candidates: k.candidates.map((c) =>
                  c.id !== "pcr"
                    ? c
                    : {
                        ...c,
                        components: c.components.map((p, j) =>
                          j ? p : { ...p, recycled: null },
                        ),
                      },
                ),
              },
        ),
      );
    }
  }, [pos.slide]);
  useEffect(() => {
    if (!manual) {
      setCases((cs) =>
        cs.map((c) =>
          c.id === "case-b"
            ? {
                ...c,
                temperature: pos.slide === 3 && pos.reveal < 2 ? 200 : 250,
              }
            : c,
        ),
      );
    }
  }, [pos, manual]);
  useEffect(() => {
    const bc = new BroadcastChannel("packproof-presenter");
    channel.current = bc;
    bc.onmessage = (e) => {
      if (e.data.type === "request-position" && !presenter)
        bc.postMessage({ type: "position", pos: currentPosition.current });
      if (e.data.type === "position" && presenter) setPos(e.data.pos);
      if (e.data.type === "command" && !presenter) {
        if (e.data.value === "goto") setPos(e.data.pos);
        else if (e.data.value === "next") move(1);
        else if (e.data.value === "previous") move(-1);
        else reset();
      }
    };
    if (presenter) bc.postMessage({ type: "request-position" });
    return () => bc.close();
  }, [presenter]);
  useEffect(() => {
    if (!presenter) channel.current?.postMessage({ type: "position", pos });
  }, [pos, presenter]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,[contenteditable]",
        )
      )
        return;
      if (e.key === " " && (e.target as HTMLElement).closest("button")) return;
      if (["ArrowRight", " ", "ArrowLeft", "Home"].includes(e.key)) {
        e.preventDefault();
        if (presenter) {
          channel.current?.postMessage({
            type: "command",
            value:
              e.key === "Home"
                ? "reset"
                : e.key === "ArrowLeft"
                  ? "previous"
                  : "next",
          });
          return;
        }
        if (e.key === "Home") reset();
        else move(e.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const command = (value: string) => {
    if (presenter) channel.current?.postMessage({ type: "command", value });
    else if (value === "next") move(1);
    else if (value === "previous") move(-1);
    else reset();
  };
  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"}>
      <div className={`pitch-shell ${reduce ? "reduced-motion" : ""}`}>
        <div className="pitch-toolbar">
          <a className="brand" href="#/app">
            <Layers /> PackProof.
          </a>
          <span>
            {presenter ? "Presenter controls" : "Guided prototype demo"} ·{" "}
            {pos.slide + 1}/7
          </span>
          <div className="button-row">
            <button onClick={() => setManual(!manual)}>
              {manual ? "Resume guided steps" : "Interact manually"}
            </button>
            <button onClick={() => setReduce(!reduce)}>
              {reduce ? "Motion reduced" : "Reduce motion"}
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
              {timings[pos.slide]} · slide {pos.slide + 1} · reveal {pos.reveal}
            </div>
            <h1>{titles[pos.slide]}</h1>
            <p>{notes[pos.slide]}</p>
            <div className="notice">
              Controls address an open pitch in this browser. No timed rehearsal
              is claimed. Next: {titles[Math.min(6, pos.slide + 1)]}
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
                  key={`${pos.slide}-${pos.reveal === 0 && !manual ? "art" : "live"}`}
                  initial={{
                    opacity: 0,
                    clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 6% 0)",
                  }}
                  animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {pos.reveal === 0 && !manual ? (
                    <ArtworkSlide slide={pos.slide} />
                  ) : (
                    <Slide
                      slide={pos.slide}
                      reveal={pos.reveal}
                      cases={cases}
                      change={update}
                      manual={manual}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="pitch-controls">
          <button
            disabled={pos.slide === 0 && pos.reveal === 0}
            onClick={() => command("previous")}
          >
            <ArrowLeft size={17} /> Back
          </button>
          <div>
            {titles.map((t, i) => (
              <button
                aria-label={`Slide ${i + 1}: ${t}`}
                title={t}
                className={pos.slide === i ? "active" : ""}
                key={t}
                onClick={() => {
                  if (presenter)
                    channel.current?.postMessage({
                      type: "command",
                      value: "goto",
                      pos: { slide: i, reveal: 0 },
                    });
                  setPos({ slide: i, reveal: 0 });
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <button onClick={() => command("reset")}>
            <RotateCcw size={15} /> Reset
          </button>
          <button
            disabled={pos.slide === 6}
            className="primary"
            onClick={() => command("next")}
          >
            {pos.reveal === 0 ? "Show the working product" : "Next reveal"}{" "}
            <ArrowRight size={17} />
          </button>
        </div>
        <Backup />
      </div>
    </MotionConfig>
  );
}
function Slide({
  slide,
  reveal,
  cases,
  change,
  manual = false,
  printing = false,
}: {
  slide: number;
  reveal: number;
  cases: Case[];
  change: (k: Case) => void;
  manual?: boolean;
  printing?: boolean;
}) {
  const a = cases[0],
    b = cases[1],
    c = cases[2],
    selected = a.candidates.find((c) => c.id === a.selected)!;
  const bottle = c.candidates[1];
  return (
    <section className={`slide slide-${slide + 1}`}>
      <div className="slide-top">
        <span>
          <Layers size={24} /> PACKPROOF
        </span>
        <span>{String(slide + 1).padStart(2, "0")} / 07</span>
      </div>
      <h1>{titles[slide]}</h1>
      <div className="slide-body">
        {slide === 0 && (
          <>
            <div className="package-line">
              {a.candidates.map((c, i) => (
                <motion.div key={c.id} layout>
                  <Package
                    kind={i === 1 ? "pouch" : "tray"}
                    split={reveal > 0 && i === 0}
                  />
                  <h3>{c.name}</h3>
                  <p>
                    {reveal > 0
                      ? `${fmt(totals(c).plastic)} g total plastic`
                      : "What would you choose?"}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="pitch-statement">
              The answer depends on what you count.
            </div>
          </>
        )}
        {slide === 1 && (
          <>
            <div className="section-head">
              <div className="eyebrow">
                {reveal > 1 ? "VIRGIN PLASTIC" : "TOTAL PLASTIC"} / GRAMS PER
                PACKAGE
              </div>
              <span className="pitch-state">
                {reveal > 1 ? "Count what is new." : "Start with total mass."}
              </span>
            </div>
            <Comparison
              k={a}
              virgin={reveal > 1}
              onSelect={(id) => change({ ...a, selected: id })}
            />
            <p className="large-caption">
              Same scale. Separate components. A different first choice.
            </p>
          </>
        )}
        {slide === 2 && (
          <>
            {printing ? (
              <div className="source-flow">
                <blockquote>
                  “Tray plastic mass: 16 g.”
                  <br />
                  “This percentage excludes the lid.”
                </blockquote>
                <ArrowRight size={50} />
                <div>
                  <b>16 g / exact tray SKU</b>
                  <p>Source passage → human review → confirmed field</p>
                  <p>Contradictory revision remains unresolved.</p>
                </div>
              </div>
            ) : (
              <div className="pitch-doc-review">
                <DocumentReview
                  k={{ ...a, id: "pitch-a" }}
                  c={selected}
                  change={(next) => change({ ...next, id: "case-a" })}
                  recorded
                  autoLoad={reveal > 0}
                />
              </div>
            )}
            <p className="large-caption">
              A proposal is not a fact until you review it.
            </p>
          </>
        )}
        {slide === 3 && (
          <>
            <div className="temp-hero">
              <div>
                <span>ACTUAL CONTACT REQUIREMENT</span>
                <motion.b
                  key={b.temperature}
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                >
                  {fmt(b.temperature)}°C
                </motion.b>
              </div>
              <span className="temp-versus">/</span>
              <div>
                <span>ILLUSTRATIVE ENTERED LIMIT</span>
                <b>220°C</b>
              </div>
              <motion.div
                layout
                className={`temp-result ${b.temperature !== null && b.temperature > 220 ? "bad" : ""}`}
              >
                {b.temperature !== null && b.temperature > 220
                  ? "× Mismatch"
                  : "? Other checks unverified"}
              </motion.div>
            </div>
            {manual && (
              <Requirements k={b} c={b.candidates[1]} change={change} />
            )}
            <p className="large-caption">
              Temperature. Duration. Use scope. Protection. Line compatibility.
              <br />
              Each requires relevant evidence.
            </p>
          </>
        )}
        {slide === 4 && (
          <div className="question-slide">
            <Decision k={c} c={bottle} change={manual ? change : undefined} />
            {reveal > 0 && (
              <motion.div
                initial={{ x: 40 }}
                animate={{ x: 0 }}
                className="question-outcome"
              >
                <div className="eyebrow">A PRECISE NEXT ACTION</div>
                <h2>
                  Ask for the minimum.
                  <br />
                  For this exact SKU.
                </h2>
                {reveal > 1 && <Annual k={a} c={selected} />}
              </motion.div>
            )}
          </div>
        )}
        {slide === 5 && (
          <div className="pilot-slide">
            <div className="pilot-counts">
              <div>
                <b>10</b>
                <span>specifications</span>
              </div>
              <div>
                <b>3</b>
                <span>shortlisted changes</span>
              </div>
              <div>
                <b>1</b>
                <span>qualified trial</span>
              </div>
              <p>Proposed pilot · no claimed commitment</p>
            </div>
            {reveal > 0 && (
              <motion.div
                initial={{ x: 100, rotate: 2 }}
                animate={{ x: 0, rotate: 0 }}
                transition={{ duration: 0.6 }}
                className="pilot-preview"
              >
                <Brief k={a} c={selected} compact />
              </motion.div>
            )}
          </div>
        )}
        {slide === 6 && (
          <>
            <div className="ask-list">
              <div>
                <span>01</span> A packaging specification sample
              </div>
              <div>
                <span>02</span> Eligible annual volumes
              </div>
              <div>
                <span>03</span> One supplier review
              </div>
            </div>
            <div className="close-line">
              Less virgin plastic.
              <br />
              <em>Evidence attached.</em>
            </div>
          </>
        )}
      </div>
      <div className="slide-footer">
        <span>Illustrative scenario — not measured Profi data.</span>
        <span>
          {slide === 2
            ? "Synthetic demo documents · recorded extraction labelled in review"
            : "Decision support · not certification"}
        </span>
      </div>
    </section>
  );
}
export function PrintDeck() {
  const cases = demos();
  const [art, setArt] = useState(true);
  return (
    <div className="print-deck">
      <div className="print-toolbar">
        <a href="#/pitch">← Pitch</a>
        <button onClick={() => window.print()}>Print / save PDF</button>
        <button onClick={() => setArt(!art)}>
          {art
            ? "Print live calculation slides instead"
            : "Print illustrated investor deck instead"}
        </button>
      </div>
      {titles.map((_, i) =>
        art ? (
          <ArtworkSlide key={i} slide={i} />
        ) : (
          <Slide
            key={i}
            slide={i}
            reveal={maxReveal[i]}
            cases={cases}
            change={() => {}}
            printing
          />
        ),
      )}
      {!art && <Backup expanded />}
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
        src={`./art/slide-${slide + 1}.png`}
        alt={`${titles[slide]} Illustrated conceptual slide. ${notes[slide]}`}
        decoding="sync"
      />
      <span className="sr-only">
        AI-generated editorial illustration. All numerical examples are
        illustrative. Advance to the live product to review calculations and
        evidence.
      </span>
    </section>
  );
}
export function Backup({ expanded = false }: { expanded?: boolean }) {
  const sections = [
    [
      "Why now — primary sources",
      "The European Commission reports that packaging uses 40% of plastics in the EU and lists 12 August 2026 as the PPWR application date. Eurostat reports 42.1% of EU plastic packaging waste recycled in 2023. These are policy and waste-system context, not measured product impact. App → Real-world context provides primary-source links, dates and boundaries.",
    ],
    [
      "Commercial hypothesis & roadmap",
      "Proposed buyer: retail packaging / procurement teams, with quality as a required reviewer. Test a paid, scoped review pilot before pricing an annual team subscription; no revenue or customer commitment claimed. Now: local decision workflow. Next: permissioned real-document evaluation and one qualified trial. Later, subject to validation: controlled team access, supplier versioning and portfolio integrations. Measure review time, critical extraction errors, evidence completeness and qualified decision rate.",
    ],
    [
      "Equations",
      "Virgin plastic = Σ plastic mass × (1 − recycled fraction). Annual tonnes = (baseline − alternative) × eligible units × adoption / 1,000,000. Unknown content yields intervals.",
    ],
    [
      "Sources and limitations",
      "European Commission food-contact and recycled-plastics reference pages provide context only. Faerch CPET and kp Eternal are supplier-family references, never evidence for fictional demo SKUs. See EVIDENCE_LEDGER.md.",
    ],
    [
      "Working versus planned",
      "Working: local cases, calculations, evidence review, use screening, thresholds, pilot reports, local extraction adapter and this pitch. OCR is not installed. No certification, deployment, measured savings or validated retail pilot claimed.",
    ],
    [
      "Why not Excel?",
      "Excel can do arithmetic. Our proposed value is consistent document review, traceable evidence, requirement screening and actionable next steps. Validate this value in the pilot; no invented moat.",
    ],
    [
      "Food-contact / shelf-life validation",
      "Review exact SKU declarations, food type, actual contact temperature, duration and heating restrictions. Validate product protection, shelf life and food-handling conditions separately.",
    ],
    [
      "Cost sensitivity",
      "Unit recurring = package + incremental handling + other recurring costs. First-year net = eligible adopted units × recurring unit saving − implementation. Non-positive saving has no break-even. Missing inputs remain missing.",
    ],
    [
      "Food-loss / environmental boundaries",
      "Virgin plastic is one decision metric. Avoid burden shifting through increased food/product loss. Full lifecycle, transport, energy, recyclability and collection infrastructure are outside this calculation.",
    ],
    [
      "Local AI architecture",
      "Browser → loopback FastAPI → page-preserving text → bounded local model → schema and passage checks → human review. Documents do not leave the machine. Cache and uploads are excluded from Git.",
    ],
    [
      "Pilot stop criteria",
      "Stop on unresolved use mismatch, missing critical evidence, failed seals or product protection, unacceptable line throughput or costs beyond agreed limits. Assign owners and numerical trial limits before testing.",
    ],
  ];
  return (
    <div className="backups">
      {sections.map(([title, body]) => (
        <details key={title} open={expanded}>
          <summary>{title}</summary>
          <p>{body}</p>
        </details>
      ))}
    </div>
  );
}
