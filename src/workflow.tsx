import { ArrowRight, Check, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  type Case,
  type Candidate,
  totals,
  checks,
  economics,
  pilotStatus,
} from "./domain";

export function reviewProgress(k: Case, c: Candidate) {
  const baseline = k.candidates.find((x) => x.id === k.baseline)!;
  const candidates = baseline.id === c.id ? [c] : [baseline, c];
  const components = candidates.flatMap((x) => x.components);
  const materialComplete = candidates.every(
    (x) => totals(x).mass !== null && totals(x).virgin !== null,
  );
  const sourced = components.filter((p) => {
    const e = k.evidence.find((x) => x.id === p.source);
    return (
      e?.reviewed &&
      (e.type === "Measured" || e.type === "Supplier document") &&
      !!e.passage.trim() &&
      !!e.scope.trim()
    );
  }).length;
  const records = checks(k, c),
    mismatches = records.filter((x) => x.state === "Mismatch").length;
  const unverified = records.filter((x) => x.state === "Unverified").length;
  const cost = economics(baseline, c, k.units, k.adoption);
  const costComplete = cost.net !== null;
  const pilot = pilotStatus(k, c);
  const failed = !!k.pilot?.tests.some((t) => t.status === "Failed");
  const next = mismatches
    ? {
        tab: "Use checks",
        title: "Resolve the use mismatch",
        body: "The selected package conflicts with entered conditions. Resolve this before progressing toward a trial.",
      }
    : failed || pilot.startsWith('Hold')
      ? {
          tab: "Pilot plan",
          title: "Investigate the trial result",
          body: "A failed check or increased rejection rate requires review before rollout. Resolve product protection before claiming a benefit.",
        }
      : !materialComplete
        ? {
            tab: "Components",
            title: "Complete the component inputs",
            body: "Enter known masses and recycled fractions. Keep unsupported values unknown.",
          }
        : sourced < components.length
          ? {
              tab: "Components",
              title: "Attach component-level evidence",
              body: "The arithmetic is available. Baseline and candidate components still need exact source passages and human review.",
            }
          : unverified
            ? {
                tab: "Use checks",
                title: "Review intended-use evidence",
                body: "Check contact conditions, protection and line compatibility separately from the material comparison.",
              }
            : !costComplete
              ? {
                  tab: "Costs",
                  title: "Complete the cost scenario",
                  body: "Add package, handling, other recurring and implementation costs for a comparable business case.",
                }
              : {
                  tab: "Pilot plan",
                  title: "Prepare the owned retail trial",
                  body: "Agree responsible people, acceptance criteria, sample sizes and stop conditions before testing.",
                };
  return {
    materialComplete,
    sourced,
    total: components.length,
    mismatches,
    unverified,
    costComplete,
    pilot,
    next,
    failed,
  };
}
export function DecisionJourney({
  k,
  c,
  navigate,
}: {
  k: Case;
  c: Candidate;
  navigate: (tab: string) => void;
}) {
  const p = reviewProgress(k, c);
  const steps = [
    {
      title: "Material inputs",
      tab: "Components",
      status: p.materialComplete ? "Inputs entered" : "Values missing",
      detail: "Baseline + selected candidate",
      done: p.materialComplete,
    },
    {
      title: "Source review",
      tab: "Components",
      status: `${p.sourced} / ${p.total} components`,
      detail: "Reviewed measured / supplier sources",
      done: p.sourced === p.total,
    },
    {
      title: "Use conditions",
      tab: "Use checks",
      status: p.mismatches
        ? `${p.mismatches} mismatches`
        : p.unverified
          ? `${p.unverified} unverified`
          : "Evidence recorded",
      detail: "Suitability assessed separately",
      done: !p.mismatches && !p.unverified,
    },
    {
      title: "Cost scenario",
      tab: "Costs",
      status: p.costComplete ? "Inputs entered" : "Costs missing",
      detail: k.illustrative
        ? "Illustrative assumptions"
        : "Entered financial assumptions",
      done: p.costComplete,
    },
    {
      title: "Retail trial",
      tab: "Pilot plan",
      status: p.failed
        ? "Failed check"
        : k.pilot
          ? "Plan in progress"
          : "Plan needed",
      detail: "Owners, tests and stop criteria",
      done: false,
    },
  ];
  return (
    <section className="decision-journey" aria-label="Decision review progress">
      <div className="journey-heading">
        <div>
          <div className="eyebrow">FROM COMPARISON TO A QUALIFIED TRIAL</div>
          <h2>Make the next decision clear.</h2>
        </div>
        <span>Workflow status · not certification</span>
      </div>
      <div className="journey-steps">
        {steps.map((s, i) => (
          <button key={s.title} onClick={() => navigate(s.tab)}>
            <span className={`journey-number ${s.done ? "entered" : ""}`}>
              {s.done ? <Check size={15} /> : String(i + 1).padStart(2, "0")}
            </span>
            <strong>{s.title}</strong>
            <b>{s.status}</b>
            <small>{s.detail}</small>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
      <div
        className={`journey-next ${p.mismatches || p.failed ? "stopped" : ""}`}
      >
        <div>
          {p.mismatches || p.failed ? (
            <AlertTriangle size={22} />
          ) : (
            <ArrowRight size={22} />
          )}
          <div>
            <b>{p.next.title}</b>
            <p>{p.next.body}</p>
          </div>
        </div>
        <button onClick={() => navigate(p.next.tab)}>
          Continue review <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
export function CaseArtwork({ food }: { food: boolean }) {
  return (
    <figure className="case-artwork">
      <img
        src={food ? "./art/app-packaging.png" : "./art/app-bottles.png"}
        alt={
          food
            ? "Illustrative studio concepts: clear tray and lid, ivory pouch and forest-green tray."
            : "Illustrative studio concepts: two non-food bottles with separate caps."
        }
      />
      <figcaption>
        AI-generated packaging concepts · not supplier products
      </figcaption>
    </figure>
  );
}
