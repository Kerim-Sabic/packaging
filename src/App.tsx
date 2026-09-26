import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Layers,
  Plus,
  Presentation,
  RotateCcw,
  Settings2,
} from "lucide-react";
import {
  type Case,
  type Candidate,
  type Evidence,
  type Store,
  uid,
  validate,
  readStore,
  emptyCandidate,
  fmt,
  totals,
  brief,
  importCSV,
  sampleCSV,
  describeChange,
  checks,
} from "./domain";
import { RealContext } from "./context";
import { publicCase } from './public-case';
import { PilotEditor, History, DecisionOverview } from "./pilot";
import { DecisionJourney, CaseArtwork } from "./workflow";
import { demos } from "./data";
import {
  ComponentSequence,
  AnnualSequence,
  BriefTransition,
} from "./sequences";
import {
  Annual,
  Brief,
  Comparison,
  Costs,
  Decision,
  EvidenceDrawer,
  NumberInput,
  Package,
  Requirements,
} from "./components";
import { DocumentReview } from "./extraction";
import { Pitch, PrintDeck } from "./pitch";
export const download = (
  name: string,
  data: string,
  type = "application/json",
) => {
  const u = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};
const KEY = "packproof.cases.v1";
function initial(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? readStore(raw) : { version: 1, cases: demos() };
  } catch {
    const damaged = localStorage.getItem(KEY);
    if (damaged) {
      try {
        localStorage.setItem("packproof.recovery.v1", damaged);
      } catch {
        /* Storage may be unavailable. */
      }
    }
    return { version: 1, cases: demos() };
  }
}
export default function App() {
  const [store, setStore] = useState(initial),
    [id, setId] = useState(() => initial().cases[0].id),
    [route, setRoute] = useState(location.hash || "#/app"),
    [tab, setTab] = useState("Compare"),
    [virgin, setVirgin] = useState(true),
    [split, setSplit] = useState(false),
    [evidence, setEvidence] = useState<string | null>(null),
    [message, setMessage] = useState(""),
    [health, setHealth] = useState("Checking local service"),
    [saved, setSaved] = useState("Saved locally");
  const k = store.cases.find((x) => x.id === id) ?? store.cases[0];
  const c = k.candidates.find((x) => x.id === k.selected)!;
  useEffect(() => {
    const fn = () => setRoute(location.hash || "#/app");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      setSaved("Saved locally");
    } catch {
      setSaved("Storage full — export now");
    }
  }, [store]);
  useEffect(() => {
    void fetch("http://127.0.0.1:8000/health", {
      signal: AbortSignal.timeout(3000),
    })
      .then((r) => r.json())
      .then((d) =>
        setHealth(
          d.service === "packproof"
            ? d.aiReady
              ? "Local AI ready"
              : "Manual mode · model offline"
            : "Manual mode · service unavailable",
        ),
      )
      .catch(() => setHealth("Manual mode · service offline"));
  }, [tab]);
  function change(next: Case) {
    validate(next);
    setStore((s) => ({
      ...s,
      cases: s.cases.map((x) => {
        if (x.id !== next.id) return x;
        const summary = describeChange(x, next);
        const history = x.audit ?? [];
        const last = history.at(-1);
        const coalesce =
          last &&
          last.summary === summary &&
          Date.now() - Date.parse(last.at) < 2500;
        return {
          ...next,
          audit: [
            ...(coalesce ? history.slice(0, -1) : history),
            { id: uid(), at: new Date().toISOString(), summary },
          ].slice(-200),
        };
      }),
    }));
  }
  function safe(next: Case) {
    try {
      change(next);
      setMessage("");
    } catch (e) {
      setMessage(String(e));
    }
  }
  const changeCandidate = (next: Candidate) =>
    safe({
      ...k,
      candidates: k.candidates.map((x) => (x.id === next.id ? next : x)),
    });
  function create(duplicate = false) {
    const next: Case = duplicate
      ? { ...structuredClone(k), id: uid(), name: k.name + " (copy)" }
      : {
          ...demos()[0],
          id: uid(),
          name: "Untitled packaging case",
          description: "Enter the product, use and purchasing decision.",
          illustrative: false,
          units: 0,
          adoption: 1,
          evidence: [],
          candidates: [
            {
              ...emptyCandidate("Baseline"),
              id: "baseline",
              components: [
                {
                  id: uid(),
                  name: "Component",
                  material: "",
                  mass: null,
                  plastic: null,
                  recycled: null,
                  provenance: "Manual entry",
                  source: "",
                  notes: "",
                },
              ],
            },
          ],
          baseline: "baseline",
          selected: "baseline",
        };
    setStore((s) => ({ ...s, cases: [...s.cases, next] }));
    setId(next.id);
    setTab("Components");
  }
  async function importFile(file: File) {
    try {
      if (file.size > 5e6) throw Error("Import maximum is 5 MB.");
      const text = await file.text();
      if (file.name.endsWith(".csv")) {
        const cs = importCSV(text);
        if (!cs.length) throw Error("No component rows");
        change({
          ...k,
          candidates: [...k.candidates, ...cs],
          selected: cs[0].id,
        });
      } else {
        const incoming = readStore(text);
        setStore(incoming);
        setId(incoming.cases[0].id);
      }
      setMessage("Import complete. Review source scope and missing values.");
    } catch (e) {
      setMessage(String(e));
    }
  }
  if (route.startsWith("#/pitch") || route.startsWith("#/presenter"))
    return <Pitch presenter={route.startsWith("#/presenter")} />;
  if (route.startsWith("#/print")) return <PrintDeck />;
  if (route.startsWith("#/brief/")) {
    const reportCase = store.cases.find(
      (x) => x.id === decodeURIComponent(route.split("/")[2]),
    );
    if (!reportCase)
      return (
        <main>
          Case not found. <a href="#/app">Return to app</a>
        </main>
      );
    const selected = reportCase.candidates.find(
      (x) => x.id === reportCase.selected,
    )!;
    return (
      <main className="report-page">
        <div className="print-toolbar">
          <a href="#/app">← Workbench</a>
          <button onClick={() => window.print()}>Print / save PDF</button>
          <button
            onClick={() =>
              download(
                "packproof-pilot.json",
                JSON.stringify(brief(reportCase, selected), null, 2),
              )
            }
          >
            Export report JSON
          </button>
        </div>
        <Brief k={reportCase} c={selected} />
      </main>
    );
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#/app">
          <span className="brand-mark">
            <Layers size={23} />
          </span>
          PackProof<span className="brand-dot">.</span>
        </a>
        <div className="sidebar-label">
          YOUR WORKSPACE <span>LOCAL</span>
        </div>
        <nav>
          {store.cases.map((item, i) => (
            <button
              key={item.id}
              className={`case-nav ${k.id === item.id ? "active" : ""}`}
              onClick={() => {
                setId(item.id);
                setTab("Compare");
              }}
            >
              <span className="case-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {item.name}
                <small>
                  {item.illustrative ? "Illustrative scenario" : "Your case"}
                </small>
              </span>
              {k.id === item.id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <button className="new-case" onClick={() => create()}>
          <Plus size={17} /> New case
        </button>
        <div className="sidebar-bottom">
          <p>
            Less virgin plastic.
            <br />
            <b>Evidence attached.</b>
          </p>
          <a href="#/pitch">
            <Presentation size={18} /> Open pitch <ArrowRight size={16} />
          </a>
          <span className="service">
            <span
              className={health === "Local AI ready" ? "dot ready" : "dot"}
            />
            {health}
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            Packaging decisions <ChevronRight size={14} /> <b>{k.name}</b>
          </div>
          <span>
            <Check size={14} />
            {saved}
          </span>
          <button onClick={() => create(true)} title="Duplicate case">
            <Copy size={15} /> Duplicate
          </button>
          <details className="data-menu">
            <summary>
              <Settings2 size={17} /> Data
            </summary>
            <div>
              <button
                onClick={() =>
                  download(
                    "packproof-cases.json",
                    JSON.stringify(store, null, 2),
                  )
                }
              >
                Export all cases
              </button>
              <label className="import-label">
                Import JSON / CSV
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) void importFile(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                onClick={() =>
                  download("packproof-sample.csv", sampleCSV, "text/csv")
                }
              >
                Download sample CSV
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Reset saved cases to the three illustrative scenarios? Export your work first.",
                    )
                  ) {
                    const cases = demos();
                    setStore({ version: 1, cases });
                    setId(cases[0].id);
                  }
                }}
              >
                Reset demonstration data
              </button>
              <button
                onClick={async () => {
                  try {
                    const r = await fetch("http://127.0.0.1:8000/cache", {
                      method: "DELETE",
                    });
                    if (!r.ok) throw Error("Cache clear failed");
                    setMessage("Local extraction cache cleared.");
                  } catch {
                    setMessage("Start the backend to clear its cache.");
                  }
                }}
              >
                Clear extraction cache
              </button>
            </div>
          </details>
        </header>
        <main className="work-main">
          <div
            className={`case-heading ${tab === "Compare" ? "with-art" : ""}`}
          >
            <div>
              <div className="eyebrow">
                DECISION WORKBENCH{" "}
                <span>
                  / {k.illustrative ? "ILLUSTRATIVE SCENARIO" : "WORKING CASE"}
                </span>
              </div>
              <h1>{k.name}</h1>
              <p>{k.description}</p>
            </div>
            <a
              className="primary button"
              href={`#/brief/${encodeURIComponent(k.id)}`}
            >
              <FileText size={17} /> Prepare pilot brief{" "}
              <ArrowRight size={16} />
            </a>
            {tab === "Compare" && <CaseArtwork food={k.food} />}
          </div>
          {k.illustrative && (
            <div className="scenario-label">
              Illustrative scenario — not measured Profi data.
            </div>
          )}
          <div className="tabbar">
            {[
              "Compare",
              "Components",
              "Documents",
              "Use checks",
              "Decision question",
              "Costs",
              "Pilot plan",
              "History",
              "Real-world context",
            ].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => setTab(t)}
              >
                {t}
                {tab === t && (
                  <motion.span
                    layoutId="work-tab"
                    className="tab-indicator"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}
          </div>
          {message && (
            <p role="alert" className="notice">
              {message}
              <button onClick={() => setMessage("")}>Dismiss</button>
            </p>
          )}
          <motion.section
            key={tab}
            className="work-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "Compare" && (
              <>
                <DecisionOverview
                  k={k}
                  c={c}
                  onRequirements={() => setTab("Use checks")}
                />
                <div className="section-head">
                  <div>
                    <div className="eyebrow">01 / MATERIAL COMPARISON</div>
                    <h2>A lighter pack isn’t the whole story.</h2>
                  </div>
                  <div className="toggle">
                    <button
                      className={!virgin ? "active" : ""}
                      onClick={() => setVirgin(false)}
                    >
                      Total plastic
                    </button>
                    <button
                      className={virgin ? "active" : ""}
                      onClick={() => setVirgin(true)}
                    >
                      Virgin plastic
                    </button>
                  </div>
                </div>
                <Comparison
                  k={k}
                  virgin={virgin}
                  onEvidence={(s) => setEvidence(s || "new")}
                  onSelect={(id) => safe({ ...k, selected: id })}
                />
                <div className="comparison-bottom">
                  <div>
                    <span className="eyebrow">SELECTED FOR INVESTIGATION</span>
                    <h3>{c.name}</h3>
                    <p>{checksSummary(k, c)}</p>
                    <button onClick={() => setTab("Use checks")}>
                      Review use requirements <ArrowRight size={16} />
                    </button>
                  </div>
                  <Annual k={k} c={c} />
                </div>
                <DecisionJourney
                  k={k}
                  c={c}
                  navigate={(next) => {
                    setTab(next);
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                />
                <AnnualSequence k={k} c={c} />
                <BriefTransition k={k} c={c} />
                <details>
                  <summary>Open calculation breakdown</summary>
                  {k.candidates.map((x) => (
                    <section key={x.id}>
                      <h3>{x.name}</h3>
                      {x.components.map((p) => (
                        <p key={p.id}>
                          {p.name}: {fmt(p.plastic)} g plastic × (1 −{" "}
                          {fmt(p.recycled)}) ={" "}
                          {p.plastic === null || p.recycled === null
                            ? "Unknown / range"
                            : fmt(p.plastic * (1 - p.recycled))}{" "}
                          g virgin{" "}
                          <button
                            onClick={() => setEvidence(p.source || "new")}
                          >
                            Evidence ↗
                          </button>
                        </p>
                      ))}
                      <p>
                        Total package mass {fmt(totals(x).mass)} g · recycled
                        plastic {fmt(totals(x).recycled)} g.
                      </p>
                    </section>
                  ))}
                </details>
                <div className="form-row volume">
                  <NumberInput
                    label="Annual eligible units"
                    value={k.units}
                    onChange={(n) => safe({ ...k, units: n ?? 0 })}
                  />
                  <NumberInput
                    label="Adoption (%)"
                    value={k.adoption * 100}
                    max={100}
                    onChange={(n) => safe({ ...k, adoption: (n ?? 0) / 100 })}
                  />
                </div>
              </>
            )}
            {tab === "Components" && (
              <>
                <div className="section-head">
                  <div>
                    <div className="eyebrow">02 / COMPONENT INVENTORY</div>
                    <h2>Know what is in the pack.</h2>
                  </div>
                  <button
                    onClick={() => {
                      const next = {
                        ...emptyCandidate(),
                        components: [
                          {
                            id: uid(),
                            name: "Component",
                            material: "",
                            mass: null,
                            plastic: null,
                            recycled: null,
                            provenance: "Manual entry",
                            source: "",
                            notes: "",
                          },
                        ],
                      };
                      safe({
                        ...k,
                        candidates: [...k.candidates, next],
                        selected: next.id,
                      });
                    }}
                  >
                    <Plus size={16} /> Add candidate
                  </button>
                </div>
                <div className="form-row">
                  <label className="field">
                    Case name
                    <input
                      value={k.name}
                      onChange={(e) => safe({ ...k, name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    Product / use description
                    <input
                      value={k.description}
                      onChange={(e) =>
                        safe({ ...k, description: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    Baseline
                    <select
                      value={k.baseline}
                      onChange={(e) => safe({ ...k, baseline: e.target.value })}
                    >
                      {k.candidates.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <CandidateSelect k={k} change={safe} />
                <div className="component-layout">
                  <div className="component-schematic">
                    <ComponentSequence c={c} />
                  </div>
                  <div className="component-fields">
                    <label className="field">
                      Candidate name
                      <input
                        value={c.name}
                        onChange={(e) =>
                          changeCandidate({ ...c, name: e.target.value })
                        }
                      />
                    </label>
                    {c.components.map((p, i) => (
                      <motion.div
                        layout
                        className="component-editor"
                        key={p.id}
                      >
                        <div className="form-row">
                          <label className="field">
                            Component
                            <input
                              value={p.name}
                              onChange={(e) =>
                                changeCandidate({
                                  ...c,
                                  components: c.components.map((x) =>
                                    x.id === p.id
                                      ? { ...x, name: e.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            Material
                            <input
                              value={p.material}
                              onChange={(e) =>
                                changeCandidate({
                                  ...c,
                                  components: c.components.map((x) =>
                                    x.id === p.id
                                      ? { ...x, material: e.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          {(["mass", "plastic", "recycled"] as const).map(
                            (key, j) => (
                              <NumberInput
                                key={key}
                                label={
                                  [
                                    "Total component (g)",
                                    "Plastic only (g)",
                                    "Recycled plastic (%)",
                                  ][j]
                                }
                                value={
                                  key === "recycled" && p[key] !== null
                                    ? p[key]! * 100
                                    : p[key]
                                }
                                max={key === "recycled" ? 100 : undefined}
                                onChange={(n) =>
                                  changeCandidate({
                                    ...c,
                                    components: c.components.map((x) =>
                                      x.id === p.id
                                        ? {
                                            ...x,
                                            [key]:
                                              key === "recycled" && n !== null
                                                ? n / 100
                                                : n,
                                          }
                                        : x,
                                    ),
                                  })
                                }
                              />
                            ),
                          )}
                        </div>
                        <label className="field">
                          Source record
                          <select
                            value={p.source}
                            onChange={(e) =>
                              changeCandidate({
                                ...c,
                                components: c.components.map((x) =>
                                  x.id === p.id
                                    ? { ...x, source: e.target.value }
                                    : x,
                                ),
                              })
                            }
                          >
                            <option value="">Missing source</option>
                            {k.evidence.map((e) => (
                              <option value={e.id} key={e.id}>
                                {e.documentId} · {e.scope}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          Assumption notes
                          <input
                            value={p.notes}
                            onChange={(e) =>
                              changeCandidate({
                                ...c,
                                components: c.components.map((x) =>
                                  x.id === p.id
                                    ? { ...x, notes: e.target.value }
                                    : x,
                                ),
                              })
                            }
                          />
                        </label>
                        <div className="button-row">
                          <button
                            onClick={() => setEvidence(p.source || "new")}
                          >
                            Open evidence ↗
                          </button>
                          {c.components.length > 1 && (
                            <button
                              onClick={() =>
                                changeCandidate({
                                  ...c,
                                  components: c.components.filter(
                                    (_, j) => j !== i,
                                  ),
                                })
                              }
                            >
                              Remove component
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <button
                      onClick={() =>
                        changeCandidate({
                          ...c,
                          components: [
                            ...c.components,
                            {
                              id: uid(),
                              name: "New component",
                              material: "",
                              mass: null,
                              plastic: null,
                              recycled: null,
                              provenance: "Manual entry",
                              source: "",
                              notes: "",
                            },
                          ],
                        })
                      }
                    >
                      + Add component
                    </button>
                  </div>
                </div>
                <Comparison
                  k={k}
                  virgin={virgin}
                  onEvidence={(s) => setEvidence(s || "new")}
                />
              </>
            )}
            {tab === "Documents" && (
              <>
                <div className="section-head">
                  <div>
                    <div className="eyebrow">03 / SOURCE REVIEW</div>
                    <h2>From specification to traceable facts.</h2>
                  </div>
                  <button onClick={() => setEvidence("new")}>
                    Add evidence manually
                  </button>
                </div>
                <CandidateSelect k={k} change={safe} />
                <DocumentReview key={k.id} k={k} c={c} change={change} />
              </>
            )}
            {tab === "Use checks" && (
              <>
                <div className="eyebrow">04 / INTENDED-USE SCREENING</div>
                <h2>The lowest number is not enough.</h2>
                <CandidateSelect k={k} change={safe} />
                <Requirements k={k} c={c} change={safe} />
                <h3>Entered documented limits · {c.name}</h3>
                <div className="form-row">
                  <NumberInput
                    label="Documented maximum (°C)"
                    value={c.maxTemp}
                    onChange={(n) => changeCandidate({ ...c, maxTemp: n })}
                  />
                  <NumberInput
                    label="Documented maximum duration (h)"
                    value={c.maxHours}
                    onChange={(n) => changeCandidate({ ...c, maxHours: n })}
                  />
                  <label className="field">
                    Documented intended-use scope
                    <input
                      value={c.useScope}
                      onChange={(e) =>
                        changeCandidate({ ...c, useScope: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label className="field">
                  Relevant evidence record (review exact scope)
                  <select
                    value={c.evidenceSource}
                    onChange={(e) =>
                      changeCandidate({ ...c, evidenceSource: e.target.value })
                    }
                  >
                    <option value="">No reviewed evidence</option>
                    {k.evidence.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.documentId} · {e.scope}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="button-row">
                  {(["foodReviewed", "protection", "line"] as const).map(
                    (key, i) => (
                      <label className="check-label" key={key}>
                        <input
                          type="checkbox"
                          checked={c[key]}
                          onChange={(e) =>
                            changeCandidate({ ...c, [key]: e.target.checked })
                          }
                        />
                        {
                          [
                            "Relevant food-contact documentation reviewed",
                            "Protection / shelf-life evidence reviewed",
                            "Line compatibility evidence reviewed",
                          ][i]
                        }
                      </label>
                    ),
                  )}
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={k.food}
                    onChange={(e) => safe({ ...k, food: e.target.checked })}
                  />{" "}
                  Food-contact use
                </label>
              </>
            )}
            {tab === "Decision question" && (
              <>
                <div className="section-head">
                  <h2>Ask the question that changes the decision.</h2>
                  {store.cases.some((x) => x.id === "case-c") && (
                    <button onClick={() => setId("case-c")}>
                      Open bottle scenario
                    </button>
                  )}
                </div>
                <CandidateSelect k={k} change={safe} />
                <Decision k={k} c={c} change={safe} />
                <Comparison
                  k={k}
                  virgin={true}
                  onSelect={(id) => safe({ ...k, selected: id })}
                />
              </>
            )}
            {tab === "Pilot plan" && (
              <PilotEditor key={k.id} k={k} c={c} change={safe} />
            )}
            {tab === "History" && <History k={k} />}
            {tab === "Real-world context" && <RealContext onOpenCase={() => {
              const next = publicCase();
              validate(next);
              setStore(s => s.cases.some(x => x.id === next.id) ? s : { ...s, cases: [...s.cases, next] });
              setId(next.id);
              setTab('Components');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }} />}
            {tab === "Costs" && (
              <>
                <div className="eyebrow">06 / BUSINESS CASE</div>
                <h2>Make the trade-off explicit.</h2>
                <CandidateSelect k={k} change={safe} />
                <Costs k={k} c={c} change={changeCandidate} />
                <Annual k={k} c={c} />
              </>
            )}
          </motion.section>
          <footer className="work-footer">
            <span>
              Evidence supports a decision. It does not certify a package.
            </span>
            <a href="#/pitch">
              Present the story <ArrowUpRightIcon />
            </a>
          </footer>
        </main>
      </div>
      <AnimatePresence>
        {evidence !== null && (
          <EvidenceDrawer
            key={evidence}
            e={k.evidence.find((e) => e.id === evidence)}
            onClose={() => setEvidence(null)}
            onSave={(e) =>
              safe({
                ...k,
                evidence: k.evidence.some((x) => x.id === e.id)
                  ? k.evidence.map((x) => (x.id === e.id ? e : x))
                  : [...k.evidence, e],
              })
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
function CandidateSelect({
  k,
  change,
}: {
  k: Case;
  change: (k: Case) => void;
}) {
  return (
    <label className="candidate-select">
      Selected candidate
      <select
        value={k.selected}
        onChange={(e) => change({ ...k, selected: e.target.value })}
      >
        {k.candidates.map((c) => (
          <option value={c.id} key={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
function checksSummary(k: Case, c: Candidate) {
  return checks(k, c).some((x) => x.state === "Mismatch")
    ? "Mismatch — cannot progress for this entered use."
    : "Investigation option — functional equivalence and relevant use evidence require review.";
}
function ArrowUpRightIcon() {
  return <ArrowRight size={15} />;
}
