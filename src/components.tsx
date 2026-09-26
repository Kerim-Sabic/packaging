import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, FileText, X } from "lucide-react";
import {
  type Case,
  type Candidate,
  type Evidence,
  type Num,
  totals,
  fmt,
  checks,
  threshold,
  decisionQuestion,
  reduction,
  economics,
  brief,
  uid,
} from "./domain";
export function NumberInput({
  label,
  value,
  onChange,
  max,
  step = "any",
}: {
  label: string;
  value: Num;
  onChange: (n: Num) => void;
  max?: number;
  step?: string;
}) {
  return (
    <label className="field">
      {label}
      <input
        aria-label={label}
        type="number"
        min="0"
        max={max}
        step={step}
        value={value ?? ""}
        placeholder="Unknown"
        onChange={(e) => {
          const n = e.target.value === "" ? null : Number(e.target.value);
          if (
            n === null ||
            (Number.isFinite(n) && n >= 0 && (max === undefined || n <= max))
          )
            onChange(n);
        }}
      />
    </label>
  );
}
export function Package({
  kind = "tray",
  split = false,
}: {
  kind?: string;
  split?: boolean;
}) {
  return (
    <svg
      className="package"
      viewBox="0 0 300 190"
      role="img"
      aria-label={`${kind} component schematic`}
    >
      <motion.g
        animate={{ y: split ? -22 : 0 }}
        transition={{ duration: 0.55 }}
      >
        <path
          d="M42 72 115 34 258 57 188 102Z"
          fill="#DFE8E0"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M42 72 188 102 258 57"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </motion.g>
      {kind === "pouch" ? (
        <path
          d="M97 78 205 93 230 157 85 137Z"
          fill="#DDD9CA"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : (
        <motion.g
          animate={{ y: split ? 15 : 0 }}
          transition={{ duration: 0.55 }}
        >
          <path
            d="M48 90 187 120 247 77 224 137 178 169 67 142Z"
            fill="#C8D4C8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M48 90 187 120 178 169M187 120 247 77"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.g>
      )}
      {split && (
        <>
          <path
            d="M220 36H285M232 147H285"
            stroke="#176B4A"
            strokeDasharray="3 3"
          />
          <text x="250" y="25" fontSize="13">
            Lid
          </text>
          <text x="250" y="166" fontSize="13">
            Tray
          </text>
        </>
      )}
    </svg>
  );
}
export function Comparison({
  k,
  virgin,
  onEvidence,
  onSelect,
}: {
  k: Case;
  virgin: boolean;
  onEvidence?: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const NameTag = onSelect ? "button" : "div";
  const MassTag = onEvidence ? "button" : "div";
  const ts = k.candidates.map(totals);
  const scale = Math.max(25, ...ts.map((t) => t.plastic ?? 0));
  const complete = ts.every((t) => t.virgin !== null);
  const low = complete
    ? Math.min(...ts.map((t) => (virgin ? t.virgin! : t.plastic!)))
    : null;
  return (
    <div className="comparison">
      {k.candidates.map((c, i) => {
        const t = ts[i],
          value = virgin ? t.virgin : t.plastic;
        const winner = low !== null && value === low;
        return (
          <motion.div
            layout
            key={c.id}
            className={`compare-row ${k.selected === c.id ? "selected" : ""}`}
          >
            <div className="compare-name">
              <NameTag
                className="text-button"
                onClick={onSelect ? () => onSelect(c.id) : undefined}
              >
                {c.name} <ArrowUpRight size={15} />
              </NameTag>
              <span>
                {c.id === k.baseline
                  ? "Baseline"
                  : winner
                    ? "Lowest calculated " +
                      (virgin ? "virgin plastic" : "total plastic")
                    : "Alternative"}
              </span>
            </div>
            <div className="bar-wrap">
              <svg
                viewBox="0 0 600 68"
                role="img"
                aria-label={`${c.name}: ${fmt(value)} grams ${virgin ? "virgin" : "total"} plastic`}
              >
                <rect width={600} height={46} y={11} fill="#e8e7df" />
                <motion.rect
                  y={11}
                  height={46}
                  fill="#BBCBBE"
                  animate={{ width: ((t.plastic ?? 0) / scale) * 600 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.rect
                  y={11}
                  height={46}
                  fill={winner ? "#176B4A" : "#454E44"}
                  animate={{
                    width: (((virgin ? t.lo : t.plastic) ?? 0) / scale) * 600,
                  }}
                  transition={{ duration: 0.6 }}
                />
                {virgin && t.lo !== t.hi && t.hi !== null && (
                  <rect
                    x={(t.lo! / scale) * 600}
                    y={11}
                    width={((t.hi - t.lo!) / scale) * 600}
                    height={46}
                    fill="url(#rangeHatch)"
                  />
                )}
                <defs>
                  <pattern
                    id="rangeHatch"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="2" height="8" fill="#9B782E" />
                  </pattern>
                </defs>
              </svg>
              <span className="axis">
                0 <span>{fmt(scale)} g · same mass scale</span>
              </span>
            </div>
            <MassTag
              className="mass"
              onClick={
                onEvidence
                  ? () => onEvidence(c.components[0].source)
                  : undefined
              }
            >
              {value !== null
                ? fmt(value)
                : t.lo !== null
                  ? `${fmt(t.lo)}–${fmt(t.hi)}`
                  : "Incomplete"}
              <small>g / package</small>
            </MassTag>
          </motion.div>
        );
      })}
      <p className="caption">
        ■ {virgin ? "Virgin" : "Total"} plastic{" "}
        <span className="recycled-key">
          ■ Recycled plastic {virgin ? "shown in pale green" : "included"}
        </span>{" "}
        · Functional equivalence unverified.{" "}
        {complete
          ? ""
          : "No precise ranking while values are incomplete or uncertain."}
      </p>
    </div>
  );
}
export function Requirements({
  k,
  c,
  change,
}: {
  k: Case;
  c: Candidate;
  change?: (k: Case) => void;
}) {
  return (
    <div className="requirements">
      <div className="form-row">
        <NumberInput
          label="Actual package contact temperature (°C)"
          value={k.temperature}
          onChange={(n) => change?.({ ...k, temperature: n })}
        />
        <NumberInput
          label="Required duration (hours)"
          value={k.hours}
          onChange={(n) => change?.({ ...k, hours: n })}
        />
        <label className="field">
          Intended use
          <select
            value={k.use}
            onChange={(e) =>
              change?.({
                ...k,
                use: e.target.value,
                temperature: null,
                hours: null,
              })
            }
          >
            {[
              ...new Set([
                k.use,
                "In-oven",
                "Post-cooking",
                "Chilled ready meal",
                "Non-food detergent",
              ]),
            ].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="caption">
        After changing use, enter actual contact conditions. Oven setpoint is
        not automatically contact temperature.
      </p>
      <div className="check-list">
        {checks(k, c).map((ch) => (
          <motion.div
            layout
            key={ch.name}
            className={`check ${ch.state === "Mismatch" ? "mismatch" : ""}`}
          >
            <div>
              <b>{ch.name}</b>
              <p>{ch.detail}</p>
            </div>
            <motion.span
              key={ch.state}
              initial={{ x: 12 }}
              animate={{ x: 0 }}
              className="status"
            >
              {ch.state === "Mismatch"
                ? "× "
                : ch.state === "Unverified"
                  ? "? "
                  : "✓ "}
              {ch.state}
            </motion.span>
          </motion.div>
        ))}
      </div>
      <p className="notice">
        Evidence screening only. PackProof does not certify packaging, legal
        compliance, food safety or shelf life.
      </p>
    </div>
  );
}
export function Decision({
  k,
  c,
  change,
}: {
  k: Case;
  c: Candidate;
  change?: (k: Case) => void;
}) {
  const b = k.candidates.find((x) => x.id === k.baseline)!;
  const q = decisionQuestion(k, c);
  const t = totals(c);
  const uncertain = c.components.find(
    (x) => x.recycled === null && x.plastic !== null && x.plastic > 0,
  );
  return (
    <div className="decision">
      <div className="eyebrow">Decision-threshold analysis</div>
      <div className="range-number">
        {fmt(t.lo)}
        {t.lo !== t.hi ? `–${fmt(t.hi)}` : ""}
        <span>g virgin plastic</span>
      </div>
      <motion.div layout className="threshold-track">
        <div
          className="threshold-fill"
          style={{
            width: `${q.r === null ? 0 : Math.max(0, Math.min(1, q.r)) * 100}%`,
          }}
        />
        {q.r !== null && q.r >= 0 && q.r <= 1 && (
          <span style={{ left: `${q.r * 100}%` }}>
            {fmt(q.r * 100)}% crossover
          </span>
        )}
      </motion.div>
      <p className="decision-text">{q.text}</p>
      <blockquote>{q.question}</blockquote>
      {change && (
        <NumberInput
          label={
            uncertain
              ? "Hypothetical recycled content (%) — scenario, not verified evidence"
              : "Scenario recycled content (%)"
          }
          value={
            c.components[0].recycled === null
              ? null
              : c.components[0].recycled * 100
          }
          max={100}
          onChange={(n) =>
            change({
              ...k,
              candidates: k.candidates.map((x) =>
                x.id !== c.id
                  ? x
                  : {
                      ...x,
                      components: x.components.map((p, i) =>
                        i
                          ? p
                          : {
                              ...p,
                              recycled: n === null ? null : n / 100,
                              provenance: "Hypothetical scenario",
                              notes: "Requires supplier verification",
                            },
                      ),
                    },
              ),
            })
          }
        />
      )}
    </div>
  );
}
export function Annual({ k, c }: { k: Case; c: Candidate }) {
  const r = reduction(k, c);
  return (
    <motion.div layout className="annual">
      <div>
        <span className="eyebrow">Potential annual reduction</span>
        <strong>
          {fmt(r.lo)}
          {r.lo !== r.hi ? `–${fmt(r.hi)}` : ""}
          <small>tonnes / year</small>
        </strong>
      </div>
      <p>
        {fmt(k.units)} eligible units × {fmt(k.adoption * 100)}% adoption
        <br />
        Current entered component assumptions. Not measured savings.
      </p>
    </motion.div>
  );
}
export function EvidenceDrawer({
  e,
  onClose,
  onSave,
}: {
  e: Evidence | undefined;
  onClose: () => void;
  onSave: (e: Evidence) => void;
}) {
  const [draft, set] = useState<Evidence>(
    e ?? {
      id: uid(),
      issuer: "",
      documentId: "",
      version: "",
      page: null,
      passage: "",
      claim: "",
      scope: "",
      limitations: "",
      type: "Missing",
      reviewed: false,
    },
  );
  return (
    <div className="drawer-shade" onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Evidence record"
        initial={{ x: 460 }}
        animate={{ x: 0 }}
        exit={{ x: 460 }}
        transition={{ duration: 0.3 }}
        className="drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon close"
          aria-label="Close evidence"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="eyebrow">
          <FileText size={16} /> Evidence attached
        </div>
        <h2>Trace the value.</h2>
        <blockquote>
          {draft.passage || "No supporting passage recorded."}
        </blockquote>
        {(
          [
            "issuer",
            "documentId",
            "version",
            "claim",
            "scope",
            "limitations",
          ] as const
        ).map((key) => (
          <label className="field" key={key}>
            {key}
            <input
              value={draft[key]}
              onChange={(e) => set({ ...draft, [key]: e.target.value })}
            />
          </label>
        ))}
        <NumberInput
          label="Page"
          value={draft.page}
          onChange={(n) => set({ ...draft, page: n })}
        />
        <label className="field">
          Supporting passage
          <textarea
            value={draft.passage}
            onChange={(e) => set({ ...draft, passage: e.target.value })}
          />
        </label>
        <label className="field">
          Evidence type
          <select
            value={draft.type}
            onChange={(e) =>
              set({ ...draft, type: e.target.value as Evidence["type"] })
            }
          >
            {[
              "Measured",
              "Supplier document",
              "Public reference",
              "Illustrative assumption",
              "Missing",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={draft.reviewed}
            onChange={(e) => set({ ...draft, reviewed: e.target.checked })}
          />{" "}
          Human reviewed for the recorded scope
        </label>
        <button
          className="primary"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
        >
          Save evidence record
        </button>
      </motion.aside>
    </div>
  );
}
export function Brief({
  k,
  c,
  compact = false,
}: {
  k: Case;
  c: Candidate;
  compact?: boolean;
}) {
  const report = brief(k, c);
  const gap = report.checks.filter(
    (x) => x.state !== "Supported by recorded evidence",
  );
  return (
    <motion.article
      layoutId="pilot-report"
      className={`brief ${compact ? "compact" : ""}`}
    >
      <div className="eyebrow">PackProof / Supplier review brief</div>
      <h1>{c.name}</h1>
      <p>
        {k.name} · {k.description}
      </p>
      <p className="notice">
        {k.illustrative
          ? "Illustrative scenario — not measured Profi data. "
          : ""}
        For supplier review; this is not an approval.
      </p>
      <div className="brief-metrics">
        <div>
          <b>
            {fmt(report.baselineTotals.virgin)} →{" "}
            {report.totals.virgin === null
              ? `${fmt(report.totals.lo)}–${fmt(report.totals.hi)}`
              : fmt(report.totals.virgin)}{" "}
            g
          </b>
          <span>Virgin plastic / pack</span>
        </div>
        <div>
          <b>
            {fmt(report.reduction.lo)}
            {report.reduction.lo !== report.reduction.hi
              ? `–${fmt(report.reduction.hi)}`
              : ""}{" "}
            t
          </b>
          <span>Potential annual reduction</span>
        </div>
      </div>
      <h3>Calculation & assumptions</h3>
      <p>
        Σ plastic mass × (1 − recycled fraction). Baseline:{" "}
        {report.baseline.name}. {fmt(k.units)} annual eligible units ×{" "}
        {fmt(k.adoption * 100)}% adoption.
      </p>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Total g</th>
            <th>Plastic g</th>
            <th>Recycled %</th>
          </tr>
        </thead>
        <tbody>
          {c.components.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{fmt(p.mass)}</td>
              <td>{fmt(p.plastic)}</td>
              <td>{fmt(p.recycled === null ? null : p.recycled * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {compact ? (
        <p>
          Preview · full brief includes costs, evidence gaps, supplier
          questions, trial tests and stop criteria.
        </p>
      ) : (
        <>
          <h3>Cost scenario · EUR</h3>
          <p>
            Recurring unit cost {fmt(report.cost.recurring)}. Annual recurring
            saving {fmt(report.cost.annual)}. Implementation{" "}
            {fmt(c.implementation)}. First-year net {fmt(report.cost.net)}.{" "}
            {report.cost.unit === null
              ? "Payback unknown."
              : report.cost.unit <= 0
                ? "No break-even under entered assumptions."
                : `Break-even ${fmt(report.cost.payback)} units.`}
          </p>
          <h3>Evidence gaps & mismatches</h3>
          {gap.map((g) => (
            <p key={g.name}>
              <b>
                {g.name} — {g.state}.
              </b>{" "}
              {g.detail}
            </p>
          ))}
          <h3>Supplier questions</h3>
          <p>{report.question.question}</p>
          <p>
            Confirm exact use coverage at {fmt(k.temperature)}°C for{" "}
            {fmt(k.hours)} hours, declarations, component scope and version.
            Resolve contradictory specifications before trial.
          </p>
        </>
      )}
      {!compact && (
        <>
          <h3>Required tests & success criteria</h3>
          <p>
            Procurement owner: {k.pilot?.procurementOwner || "to assign"}.
            Quality/food-safety owner: {k.pilot?.qualityOwner || "to assign"}.
            Operations owner: {k.pilot?.operationsOwner || "to assign"}.
            Supplier contact: {k.pilot?.supplierContact || "to assign"}.
          </p>
          {k.pilot && (
            <>
              <p>
                Target review: {k.pilot.targetDate || "to assign"} · Trial
                units: {fmt(k.pilot.trialUnits)} · Pilot budget: €
                {fmt(k.pilot.budget)}
              </p>
              {k.pilot.tests.map((t) => (
                <section key={t.id}>
                  <h4>
                    {t.name} — {t.status}
                  </h4>
                  <p>
                    Owner: {t.owner || "to assign"}
                    <br />
                    Acceptance criterion:{" "}
                    {t.acceptance || "must be defined before trial"}
                    <br />
                    Recorded result: {t.result || "not recorded"}
                  </p>
                </section>
              ))}
            </>
          )}
          <p>
            Verify component weights and minimum recycled content; review
            intended-use documentation; test sealing, leakage, handling, line
            throughput and product protection/shelf life. Set measurable
            acceptance limits with the owners before the trial. Progress only
            when requirements have relevant evidence, no mismatches remain, and
            measured trial results meet agreed limits.
          </p>
          <h3>Stop criteria</h3>
          {k.pilot && (
            <p>
              {k.pilot.stopCriteria}
              <br />
              {k.pilot.notes}
            </p>
          )}
          <p>
            Stop on unresolved requirement mismatch, unsupported food/contact
            conditions, failed seal or protection tests, unacceptable product
            loss, throughput loss or cost beyond the agreed ceiling. A packaging
            decision does not establish food safety.
          </p>
          <h3>Sources & limitations</h3>
          {k.evidence.map((e) => (
            <p key={e.id}>
              <b>
                {e.documentId} / {e.issuer}
              </b>{" "}
              · {e.version} · page {fmt(e.page)} · {e.type} ·{" "}
              {e.reviewed ? "reviewed" : "not reviewed"}
              <br />
              {e.passage}
              <br />
              Scope: {e.scope}. Limitations: {e.limitations}
            </p>
          ))}
          {c.components.map((p) => (
            <p key={p.id}>
              {p.name}: {p.provenance}; source {p.source || "missing"};{" "}
              {p.notes}
            </p>
          ))}
          <p>{c.notes}</p>
          <p>
            No full LCA or CO₂ conversion. Product loss, energy, transport and
            end-of-life impacts require separate assessment.
          </p>
        </>
      )}
    </motion.article>
  );
}
export function Costs({
  k,
  c,
  change,
}: {
  k: Case;
  c: Candidate;
  change: (c: Candidate) => void;
}) {
  const cost = economics(
    k.candidates.find((x) => x.id === k.baseline)!,
    c,
    k.units,
    k.adoption,
  );
  return (
    <>
      <div className="form-row">
        {(["price", "handling", "other", "implementation"] as const).map(
          (key, i) => (
            <NumberInput
              key={key}
              label={
                [
                  "Package price (EUR/unit)",
                  "Incremental handling (EUR/unit)",
                  "Other recurring (EUR/unit)",
                  "One-time implementation (EUR)",
                ][i]
              }
              value={c[key]}
              onChange={(n) => change({ ...c, [key]: n })}
            />
          ),
        )}
      </div>
      <div className="stats">
        <div>
          <b>€{fmt(cost.annual)}</b>
          <span>Annual recurring saving</span>
        </div>
        <div>
          <b>€{fmt(cost.net)}</b>
          <span>First-year net</span>
        </div>
        <div>
          <b>
            {cost.unit === null
              ? "Unknown"
              : cost.unit <= 0
                ? "No break-even"
                : `${fmt(cost.payback)} units`}
          </b>
          <span>
            {cost.unit !== null && cost.unit <= 0
              ? "Under entered assumptions"
              : "Implementation / positive unit saving"}
          </span>
        </div>
      </div>
      <p className="caption">
        Missing costs stay unknown. Negative savings remain visible. Baseline
        cost inputs can be edited by selecting the baseline.
      </p>
    </>
  );
}
