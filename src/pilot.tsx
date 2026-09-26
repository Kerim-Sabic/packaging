import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  ShieldAlert,
} from "lucide-react";
import {
  type Case,
  type Candidate,
  type PilotPlan,
  defaultPilot,
  pilotStatus,
  uid,
  checks,
  totals,
  fmt,
} from "./domain";
import { NumberInput } from "./components";
import { TrialResults } from './trial';
export function PilotEditor({
  k,
  c,
  change,
}: {
  k: Case;
  c: Candidate;
  change: (k: Case) => void;
}) {
  const [fallback] = useState(defaultPilot);
  const p = k.pilot ?? fallback;
  const update = (next: PilotPlan) => change({ ...k, pilot: next });
  return (
    <div className="pilot-editor">
      <div className="section-head">
        <div>
          <div className="eyebrow">07 / PILOT DESIGN</div>
          <h2>A decision is only useful if someone can act on it.</h2>
        </div>
        <a
          className="primary button"
          href={`#/brief/${encodeURIComponent(k.id)}`}
        >
          Prepare supplier brief <ArrowRight size={16} />
        </a>
      </div>
      <div className="pilot-gate">
        <ShieldAlert size={22} />
        <div>
          <b>{pilotStatus(k, c)}</b>
          <p>
            A recorded test result is evidence for review. It does not certify
            the package.
          </p>
        </div>
      </div>
      <div className="form-row">
        {(["procurementOwner", "qualityOwner", "operationsOwner"] as const).map(
          (key, i) => (
            <label className="field" key={key}>
              {
                [
                  "Procurement owner",
                  "Quality / food-safety owner",
                  "Operations owner",
                ][i]
              }
              <input
                placeholder="Assign a person"
                value={p[key]}
                onChange={(e) => update({ ...p, [key]: e.target.value })}
              />
            </label>
          ),
        )}
      </div>
      <div className="form-row">
        <label className="field">
          Supplier contact
          <input
            placeholder="Name or team — no messages are sent"
            value={p.supplierContact}
            onChange={(e) => update({ ...p, supplierContact: e.target.value })}
          />
        </label>
        <label className="field">
          Target review date
          <input
            type="date"
            value={p.targetDate}
            onChange={(e) => update({ ...p, targetDate: e.target.value })}
          />
        </label>
        <NumberInput
          label="Trial units"
          value={p.trialUnits}
          onChange={(n) => update({ ...p, trialUnits: n })}
        />
        <NumberInput
          label="Pilot budget (EUR)"
          value={p.budget}
          onChange={(n) => update({ ...p, budget: n })}
        />
      </div>
      <div className="section-head">
        <h3>Define the evidence a trial must produce.</h3>
        <button
          onClick={() =>
            update({
              ...p,
              tests: [
                ...p.tests,
                {
                  id: uid(),
                  name: "New trial check",
                  owner: "",
                  acceptance: "",
                  result: "",
                  status: "Not run",
                },
              ],
            })
          }
        >
          <Plus size={15} /> Add trial check
        </button>
      </div>
      <TrialResults k={k} c={c} p={p} update={update}/>
      <div className="test-list">
        {p.tests.map((t, i) => {
          const edit = (patch: Partial<typeof t>) =>
            update({
              ...p,
              tests: p.tests.map((x) =>
                x.id === t.id ? { ...x, ...patch } : x,
              ),
            });
          return (
            <motion.section
              layout
              key={t.id}
              className={`trial-test ${t.status === "Failed" ? "failed" : ""}`}
            >
              <span className="test-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="form-row">
                  <label className="field">
                    Trial check
                    <input
                      value={t.name}
                      onChange={(e) => edit({ name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    Responsible person
                    <input
                      value={t.owner}
                      placeholder="Owner"
                      onChange={(e) => edit({ owner: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field">
                  Measurable acceptance criterion
                  <textarea
                    placeholder="Define the test method, numerical limit and sample size before testing."
                    value={t.acceptance}
                    onChange={(e) => edit({ acceptance: e.target.value })}
                  />
                </label>
                <div className="form-row">
                  <label className="field">
                    Observed result / evidence reference
                    <textarea
                      placeholder="Record what was actually observed and where supporting evidence is stored."
                      value={t.result}
                      onChange={(e) => edit({ result: e.target.value })}
                    />
                  </label>
                  <label className="field trial-status">
                    Result status
                    <select
                      value={t.status}
                      onChange={(e) =>
                        edit({ status: e.target.value as typeof t.status })
                      }
                    >
                      {["Not run", "Passed", "Failed"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        update({
                          ...p,
                          tests: p.tests.filter((x) => x.id !== t.id),
                        })
                      }
                    >
                      Remove check
                    </button>
                  </label>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
      <label className="field">
        Stop criteria
        <textarea
          value={p.stopCriteria}
          onChange={(e) => update({ ...p, stopCriteria: e.target.value })}
        />
      </label>
      <label className="field">
        Pilot notes / unresolved decisions
        <textarea
          value={p.notes}
          onChange={(e) => update({ ...p, notes: e.target.value })}
        />
      </label>
    </div>
  );
}
export function History({ k }: { k: Case }) {
  return (
    <div className="history">
      <div className="eyebrow">08 / LOCAL CHANGE HISTORY</div>
      <h2>A trail behind every decision.</h2>
      <p>
        This local activity record describes edits without copying full document
        contents. It is editable local data, not a tamper-proof audit system.
      </p>
      {!k.audit?.length ? (
        <div className="document-empty">
          <Clock3 size={35} />
          <h3>No recorded changes yet.</h3>
          <p>Edit this case to start its decision history.</p>
        </div>
      ) : (
        <ol>
          {[...k.audit].reverse().map((e) => (
            <motion.li layout key={e.id}>
              <span className="history-dot" />
              <div>
                <b>{e.summary}</b>
                <time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
export function DecisionOverview({
  k,
  c,
  onRequirements,
}: {
  k: Case;
  c: Candidate;
  onRequirements: () => void;
}) {
  const records = checks(k, c),
    missing = records.filter((r) => r.state === "Unverified").length,
    mismatch = records.some((r) => r.state === "Mismatch");
  const comparable = k.candidates.every((x) => totals(x).virgin !== null);
  const best = comparable
    ? [...k.candidates].sort((a, b) => totals(a).virgin! - totals(b).virgin!)[0]
    : null;
  const tied = best
    ? k.candidates.filter(
        (x) => Math.abs(totals(x).virgin! - totals(best).virgin!) < 1e-9,
      )
    : [];
  return (
    <div className="decision-overview">
      <div>
        <span className="eyebrow">LOWEST CALCULATED VIRGIN PLASTIC</span>
        <b>{best ? `${fmt(totals(best).virgin)} g` : "Range / incomplete"}</b>
        <span>
          {tied.length > 1
            ? `${tied.length} candidates tied`
            : (best?.name ?? "Resolve unknowns before precise ranking")}
        </span>
      </div>
      <div>
        <span className="eyebrow">SELECTED CANDIDATE / EVIDENCE</span>
        <b className={mismatch ? "negative" : ""}>
          {mismatch ? "Mismatch" : `${missing} checks unverified`}
        </b>
        <span>{c.name} · suitability reviewed separately</span>
      </div>
      <button onClick={onRequirements}>
        {mismatch ? "Resolve the use mismatch" : "Review the evidence gaps"}{" "}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
