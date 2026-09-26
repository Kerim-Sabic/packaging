import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type Case, type Candidate, totals, fmt, reduction } from "./domain";
import { Package, Brief } from "./components";
export function ComponentSequence({ c }: { c: Candidate }) {
  const [stage, set] = useState(0);
  const scale = Math.max(25, totals(c).plastic ?? 25);
  let offset = 0;
  return (
    <div className="component-sequence">
      <Package split={stage > 0} />
      <button onClick={() => set((s) => (s + 1) % 3)}>
        {
          [
            "Separate components",
            "Transform rows into stacked mass",
            "Assemble package",
          ][stage]
        }
      </button>
      {stage > 0 && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}>
          <svg
            viewBox={`0 0 300 ${Math.max(125, c.components.length * 55 + 25)}`}
            role="img"
            aria-label="Component rows transform into a stacked plastic mass chart"
          >
            {c.components.map((p, i) => {
              const x = offset;
              offset += ((p.plastic ?? 0) / scale) * 270;
              return (
                <motion.g
                  key={p.id}
                  animate={{
                    x: stage === 2 ? x : 0,
                    y: stage === 2 ? 35 : i * 55 + 22,
                  }}
                  transition={{ duration: 0.65 }}
                >
                  <text
                    x="0"
                    y="-5"
                    fontSize="11"
                    opacity={stage === 2 ? 0 : 1}
                  >
                    {p.name} · {fmt(p.plastic)} g plastic
                  </text>
                  <rect
                    width={((p.plastic ?? 0) / scale) * 270}
                    height="23"
                    fill={i % 2 ? "#6f8970" : "#176B4A"}
                  />
                  <text x="3" y="16" fill="white" fontSize="10">
                    {fmt(p.plastic)}
                  </text>
                </motion.g>
              );
            })}
          </svg>
          <p className="caption">
            {stage === 2
              ? `${fmt(totals(c).plastic)} g total plastic · exact component sum`
              : "Component-linked mass rows"}
            <br />
            0–{fmt(scale)} g scale · missing mass stays unknown
          </p>
        </motion.div>
      )}
      <p className="caption">Schematic only · not product geometry</p>
    </div>
  );
}
export function AnnualSequence({ k, c }: { k: Case; c: Candidate }) {
  const [stage, set] = useState(0);
  const b = totals(k.candidates.find((x) => x.id === k.baseline)!),
    t = totals(c);
  const per =
    b.virgin === null || t.virgin === null ? null : b.virgin - t.virgin;
  return (
    <details className="annual-sequence">
      <summary>Explain per-pack → annual calculation</summary>
      <div className="sequence-steps">
        <motion.div layout>
          <span>01 / Per package</span>
          <b>{fmt(per)} g</b>
          <small>Baseline virgin − alternative virgin</small>
        </motion.div>
        {stage > 0 && (
          <motion.div
            initial={{ x: 25, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <span>02 / Entered scenario</span>
            <b>
              {fmt(k.units)} × {fmt(k.adoption * 100)}%
            </b>
            <small>Eligible units × adoption</small>
          </motion.div>
        )}
        {stage > 1 && (
          <motion.div
            initial={{ x: 25, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <span>03 / Potential annual reduction</span>
            <b>{fmt(reduction(k, c).lo)} t</b>
            <small>Grams ÷ 1,000,000 = tonnes</small>
          </motion.div>
        )}
      </div>
      <button onClick={() => set((s) => (s + 1) % 3)}>
        {stage === 2 ? "Reset explanation" : "Reveal next calculation step"}
      </button>
    </details>
  );
}
export function BriefTransition({ k, c }: { k: Case; c: Candidate }) {
  const [open, set] = useState(false);
  return (
    <>
      <motion.div layoutId={`brief-preview-${k.id}`} className="brief-launch">
        <span className="eyebrow">NEXT ACTION / {c.name}</span>
        <button onClick={() => set(true)}>
          Turn comparison into a pilot brief →
        </button>
      </motion.div>
      <AnimatePresence>
        {open && (
          <div className="brief-modal">
            <motion.div
              layoutId={`brief-preview-${k.id}`}
              transition={{ duration: 0.55 }}
            >
              <div className="print-toolbar">
                <button onClick={() => set(false)}>
                  ← Return to comparison
                </button>
                <a
                  className="primary button"
                  href={`#/brief/${encodeURIComponent(k.id)}`}
                >
                  Open printable brief
                </a>
              </div>
              <Brief k={k} c={c} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
