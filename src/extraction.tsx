import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Upload, FileText } from "lucide-react";
import { type Case, type Candidate, uid, totals, fmt } from "./domain";
export type Proposal = {
  fieldName: string;
  value: string | null;
  unit: string;
  scope: string;
  documentId: string;
  pageNumber: number;
  verbatimSupportingText: string;
  status: string;
  reviewNote: string;
};
export type Extraction = {
  mode: string;
  model: string;
  proposals: Proposal[];
  pages: { documentId: string; pageNumber: number; text: string }[];
  omitted: string[];
  warnings: string[];
  complete: boolean;
  error: string | null;
};
const API = "http://127.0.0.1:8000";
export function DocumentReview({
  k,
  c,
  change,
  recorded = false,
  autoLoad = false,
}: {
  k: Case;
  c: Candidate;
  change: (k: Case) => void;
  recorded?: boolean;
  autoLoad?: boolean;
}) {
  const [result, setResult] = useState<Extraction | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [text, setText] = useState(""),
    [states, setStates] = useState<Record<number, string>>({});
  const abort = useRef<AbortController | null>(null);
  const storageKey = `packproof.proposals.v1.${k.id}`;
  useEffect(() => {
    try {
      const old = localStorage.getItem(storageKey);
      if (old) {
        const p = JSON.parse(old);
        setResult(p.result);
        setStates(p.states ?? {});
      } else {
        setResult(null);
        setStates({});
      }
    } catch {
      setError("Saved proposal review could not be read. Reload a document.");
    }
    return () => abort.current?.abort();
  }, [storageKey]);
  function remember(r: Extraction, s: Record<number, string>) {
    setResult(r);
    setStates(s);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, result: r, states: s }),
      );
    } catch {
      setError(
        "Proposal storage is full. Export confirmed cases and clear old document reviews.",
      );
    }
  }
  useEffect(() => {
    if (autoLoad) void loadRecorded();
  }, [autoLoad]);
  async function loadRecorded() {
    try {
      const r = await fetch("./demo/extraction-recorded.json");
      if (!r.ok)
        throw Error(
          "Recorded extraction unavailable; use live review or paste text.",
        );
      const data = await r.json();
      remember(
        {
          ...data,
          mode: "Recorded local extraction — synthetic documents; no live inference",
        },
        {},
      );
    } catch (e) {
      setError(String(e));
    }
  }
  async function extract(files: File[]) {
    setError("");
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 300000);
    try {
      if (
        files.reduce((a, f) => a + f.size, 0) > 20 * 1024 * 1024 ||
        files.length > 4
      )
        throw Error("Maximum 4 files and 20 MB combined.");
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const r = await fetch(API + "/extract", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.detail || "Extraction service error");
      remember(data, {});
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Review cancelled or five-minute limit reached. Manual entry remains available."
          : `${String(e)}. Start the local service or use manual entry.`,
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  function accept(
    p: Proposal,
    index: number,
    target: string,
    field: string,
    value: string,
    corrected: boolean,
  ) {
    try {
      if (!result) throw Error("Missing source");
      if (p.status !== "supported_proposal" && !corrected)
        throw Error("Resolve or correct this proposal before acceptance.");
      const page = result.pages.find(
        (x) => x.documentId === p.documentId && x.pageNumber === p.pageNumber,
      );
      const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
      if (
        !page ||
        !p.verbatimSupportingText ||
        !norm(page.text).includes(norm(p.verbatimSupportingText))
      )
        throw Error(
          "Source passage is unsupported. Add manual evidence separately.",
        );
      const evId = uid();
      const ev = {
        id: evId,
        issuer: result.mode.includes("Recorded")
          ? "Synthetic demo record"
          : "Uploaded document — issuer to verify",
        documentId: p.documentId,
        version: "Unknown; verify source version",
        page: p.pageNumber,
        passage: p.verbatimSupportingText,
        claim: `${p.fieldName}: ${value} ${p.unit}${corrected ? " (human correction)" : ""}`,
        scope: p.scope,
        limitations: `${p.reviewNote} Review set ${result.complete ? "fully processed within bounds" : "partial: " + result.omitted.join("; ")}. ${result.mode}.`,
        type: (result.pages.some((x) =>
          x.text.includes("SYNTHETIC DEMO DOCUMENT"),
        )
          ? "Illustrative assumption"
          : "Supplier document") as
          | "Illustrative assumption"
          | "Supplier document",
        reviewed: true,
      };
      let next = c;
      if (field !== "evidence") {
        const n = Number(value);
        if (value.trim() === "" || !Number.isFinite(n) || n < 0)
          throw Error("Enter a valid non-negative number.");
        if (field === "recycled" && n > 100)
          throw Error("Percentage must be 0–100.");
        if (
          !corrected &&
          ((["mass", "plastic"].includes(field) && p.unit !== "g") ||
            (field === "recycled" && p.unit !== "%"))
        )
          throw Error(
            "Convert units explicitly using Correct before transfer.",
          );
        const component = c.components.find((x) => x.id === target);
        if (!component) throw Error("Choose a target component.");
        if (
          component[field as "mass" | "plastic" | "recycled"] !== null &&
          !window.confirm(
            `Replace the confirmed ${field} value for ${component.name}?`,
          )
        )
          return;
        next = {
          ...c,
          components: c.components.map((x) =>
            x.id !== target
              ? x
              : {
                  ...x,
                  [field]: field === "recycled" ? n / 100 : n,
                  source: evId,
                  provenance: corrected
                    ? "Human-corrected extraction"
                    : "Human-accepted extraction",
                  notes: `${p.scope}. ${p.reviewNote}`,
                },
          ),
        };
      }
      change({
        ...k,
        evidence: [...k.evidence, ev],
        candidates: k.candidates.map((x) => (x.id === c.id ? next : x)),
      });
      remember(result, {
        ...states,
        [index]: corrected ? "Corrected & accepted" : "Accepted",
      });
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <div className="documents">
      <div className="document-toolbar">
        <label className="upload-button">
          <Upload size={18} /> Upload PDF / text
          <input
            aria-label="Upload specifications"
            type="file"
            multiple
            accept=".pdf,.txt"
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) void extract(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
        </label>
        <button onClick={loadRecorded} disabled={busy}>
          Load recorded demo
        </button>
        <a href="./demo/spec-1.txt" download>
          Demo specification 1
        </a>
        <a href="./demo/spec-2.txt" download>
          Demo specification 2
        </a>
      </div>
      <p className="caption">
        Local only · 4 files / 20 MB · searchable PDF or UTF-8 text · scanned
        pages require external OCR. Proposals are not confirmed values.
      </p>
      {!recorded && (
        <details>
          <summary>Paste specification text</summary>
          <textarea
            aria-label="Pasted specification"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a source passage with its identifier and component scope…"
          />
          <button
            disabled={busy || !text.trim()}
            onClick={() =>
              extract([
                new File([text], "pasted-specification.txt", {
                  type: "text/plain",
                }),
              ])
            }
          >
            Review pasted text locally
          </button>
        </details>
      )}
      {busy && (
        <div className="notice">
          Local review request running.{" "}
          <button onClick={() => abort.current?.abort()}>Cancel review</button>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result && (
        <>
          <div className="review-status">
            <FileText size={19} />
            <b>{result.mode}</b>
            <span>
              {result.model} ·{" "}
              {result.complete
                ? "Processed within configured bounds"
                : "Partial review"}
            </span>
          </div>
          {result.error && <p className="error">{result.error}</p>}
          {result.warnings.map((w, i) => (
            <p className="notice" key={i}>
              {w}
            </p>
          ))}
          {result.omitted.length > 0 && (
            <details open>
              <summary>Not processed</summary>
              {result.omitted.map((o, i) => (
                <p key={i}>{o}</p>
              ))}
            </details>
          )}
          {recorded && (
            <p className="notice">
              Focused proposal from a real recorded review. The complete review
              also flags conflicting masses and missing lid content. Confirmed
              candidate virgin plastic: <b>{fmt(totals(c).virgin)} g</b>.
            </p>
          )}
          <div className="proposal-list">
            {(recorded
              ? result.proposals
                  .map((p, i) => ({ p, i }))
                  .filter(
                    ({ p }) =>
                      p.fieldName === "recycled_percent" &&
                      p.status === "supported_proposal",
                  )
                  .slice(0, 1)
              : result.proposals.map((p, i) => ({ p, i }))
            ).map(({ p, i }) => (
              <ProposalRow
                key={`${p.documentId}-${i}`}
                p={p}
                c={c}
                state={states[i]}
                onAccept={(target, field, value, corrected) =>
                  accept(p, i, target, field, value, corrected)
                }
                onState={(s) => remember(result, { ...states, [i]: s })}
              />
            ))}
          </div>
          <details>
            <summary>
              Extracted source text ({result.pages.length} pages)
            </summary>
            {result.pages.map((p) => (
              <section key={p.documentId + p.pageNumber}>
                <h4>
                  {p.documentId} · page {p.pageNumber}
                </h4>
                <pre>{p.text}</pre>
              </section>
            ))}
          </details>
          <button
            onClick={() => {
              setResult(null);
              setStates({});
              localStorage.removeItem(storageKey);
            }}
          >
            Clear this review
          </button>
        </>
      )}
      {!result && !busy && (
        <div className="document-empty">
          <FileText size={44} />
          <h3>Every number needs a passage.</h3>
          <p>
            Review the source, its component scope and its limits.
            <br />
            Accept facts only after checking the exact SKU.
          </p>
        </div>
      )}
    </div>
  );
}
function ProposalRow({
  p,
  c,
  state,
  onAccept,
  onState,
}: {
  p: Proposal;
  c: Candidate;
  state?: string;
  onAccept: (
    target: string,
    field: string,
    value: string,
    corrected: boolean,
  ) => void;
  onState: (s: string) => void;
}) {
  const [value, set] = useState(p.value ?? ""),
    [correcting, correct] = useState(false),
    [target, setTarget] = useState(c.components[0]?.id ?? ""),
    [field, setField] = useState(
      p.fieldName === "plastic_mass"
        ? "plastic"
        : p.fieldName === "total_mass"
          ? "mass"
          : p.fieldName === "recycled_percent"
            ? "recycled"
            : "evidence",
    );
  const done =
    state === "Accepted" ||
    state === "Corrected & accepted" ||
    state === "Rejected";
  return (
    <motion.div layout className={`proposal ${done ? "resolved" : ""}`}>
      <div className="proposal-source">
        <span className="eyebrow">
          {p.documentId} · p{p.pageNumber}
        </span>
        <blockquote>
          {p.verbatimSupportingText || "No supporting passage — missing value."}
        </blockquote>
        <p>Scope: {p.scope}</p>
      </div>
      <div className="proposal-value">
        <b>{p.fieldName.replaceAll("_", " ")}</b>
        <strong>
          {p.value ?? "Not found"} <small>{p.unit}</small>
        </strong>
        <span>{state || p.status.replaceAll("_", " ")}</span>
        <p>{p.reviewNote}</p>
        {!done && (
          <>
            <label className="field">
              Transfer to
              <select value={field} onChange={(e) => setField(e.target.value)}>
                <option value="evidence">Evidence record only</option>
                <option value="mass">Component total mass (g)</option>
                <option value="plastic">Component plastic mass (g)</option>
                <option value="recycled">Recycled plastic (%)</option>
              </select>
            </label>
            {field !== "evidence" && (
              <select
                aria-label="Target component"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                {c.components.map((x) => (
                  <option value={x.id} key={x.id}>
                    {c.name} / {x.name}
                  </option>
                ))}
              </select>
            )}
            {correcting && (
              <label className="field">
                Human-corrected value (target units)
                <input value={value} onChange={(e) => set(e.target.value)} />
              </label>
            )}
            <div className="button-row">
              <button
                className="primary"
                disabled={!correcting && p.status !== "supported_proposal"}
                onClick={() => onAccept(target, field, value, correcting)}
              >
                {correcting ? "Accept correction" : "Accept"}
              </button>
              <button onClick={() => correct(!correcting)}>Correct</button>
              <button onClick={() => onState("Rejected")}>Reject</button>
              <button onClick={() => onState("Unresolved")}>
                Leave unresolved
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
