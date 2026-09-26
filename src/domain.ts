export type Num = number | null;
export type Evidence = {
  id: string;
  issuer: string;
  documentId: string;
  version: string;
  page: Num;
  passage: string;
  claim: string;
  scope: string;
  limitations: string;
  type:
    | "Measured"
    | "Supplier document"
    | "Public reference"
    | "Illustrative assumption"
    | "Missing";
  reviewed: boolean;
};
export type Component = {
  id: string;
  name: string;
  material: string;
  mass: Num;
  plastic: Num;
  recycled: Num;
  provenance: string;
  source: string;
  notes: string;
};
export type Candidate = {
  id: string;
  name: string;
  components: Component[];
  price: Num;
  handling: Num;
  other: Num;
  implementation: Num;
  maxTemp: Num;
  maxHours: Num;
  useScope: string;
  evidenceSource: string;
  foodReviewed: boolean;
  protection: boolean;
  line: boolean;
  notes: string;
};
export type Case = {
  id: string;
  name: string;
  description: string;
  illustrative: boolean;
  units: number;
  adoption: number;
  temperature: Num;
  hours: Num;
  use: string;
  food: boolean;
  baseline: string;
  selected: string;
  candidates: Candidate[];
  evidence: Evidence[];
  pilot?: PilotPlan;
  audit?: AuditEntry[];
};
export type AuditEntry = { id: string; at: string; summary: string };
export type PilotTest = {
  id: string;
  name: string;
  owner: string;
  acceptance: string;
  result: string;
  status: "Not run" | "Passed" | "Failed";
};
export type PilotPlan = {
  procurementOwner: string;
  qualityOwner: string;
  operationsOwner: string;
  supplierContact: string;
  targetDate: string;
  trialUnits: Num;
  budget: Num;
  tests: PilotTest[];
  stopCriteria: string;
  notes: string;
};
export function defaultPilot(): PilotPlan {
  return {
    procurementOwner: "",
    qualityOwner: "",
    operationsOwner: "",
    supplierContact: "",
    targetDate: "",
    trialUnits: null,
    budget: null,
    tests: [
      "Component mass & recycled content",
      "Intended-use documentation",
      "Seal integrity & product protection",
      "Line throughput & handling",
      "Grease / oil resistance at actual contact conditions",
      "Shelf life & product loss versus baseline",
      "Transport, stacking & storage",
      "Consumer opening, handling & disposal instructions",
      "Design for recycling / local collection evidence",
    ].map((name) => ({
      id: uid(),
      name,
      owner: "",
      acceptance: "",
      result: "",
      status: "Not run",
    })),
    stopCriteria:
      "Stop on unresolved use mismatch, missing critical evidence, failed protection or sealing, unacceptable product loss, or cost/throughput outside agreed limits.",
    notes: "",
  };
}
export function pilotStatus(k: Case, c: Candidate) {
  const p = k.pilot;
  if (
    checks(k, c).some((x) => x.state === "Mismatch") ||
    p?.tests.some((x) => x.status === "Failed")
  )
    return "Stop — resolve mismatch or failed test";
  if (
    !p ||
    !p.procurementOwner ||
    !p.qualityOwner ||
    !p.operationsOwner ||
    !p.trialUnits ||
    p.tests.length === 0 ||
    p.tests.some((t) => !t.owner || !t.acceptance)
  )
    return "Define owners and trial criteria";
  if (checks(k, c).some((x) => x.state === "Unverified"))
    return "Supplier evidence review required";
  return "Trial plan prepared for human review";
}
export function describeChange(old: Case, next: Case) {
  if (JSON.stringify(old.pilot) !== JSON.stringify(next.pilot))
    return "Updated pilot plan, ownership or trial record";
  if (old.evidence.length !== next.evidence.length)
    return "Added a source evidence record";
  if (JSON.stringify(old.evidence) !== JSON.stringify(next.evidence))
    return "Updated an evidence record";
  if (old.candidates.length !== next.candidates.length)
    return "Added a packaging candidate";
  if (JSON.stringify(old.candidates) !== JSON.stringify(next.candidates))
    return "Updated candidate components, costs or use evidence";
  if (old.units !== next.units || old.adoption !== next.adoption)
    return "Updated annual volume or adoption scenario";
  if (old.selected !== next.selected)
    return "Changed candidate selected for investigation";
  return "Updated case details or intended-use requirements";
}
export type Store = { version: 1; cases: Case[] };
export const uid = () => crypto.randomUUID();
export const fmt = (v: Num, d = 2) =>
  v === null
    ? "Unknown"
    : new Intl.NumberFormat("en-GB", { maximumFractionDigits: d }).format(v);
const sum = (xs: Num[]): Num =>
  xs.some((x) => x === null)
    ? null
    : (xs as number[]).reduce((a, b) => a + b, 0);
export function totals(c: Candidate) {
  const mass = sum(c.components.map((x) => x.mass)),
    plastic = sum(c.components.map((x) => x.plastic));
  const lo = sum(
    c.components.map((x) =>
      x.plastic === null
        ? null
        : x.plastic === 0
          ? 0
          : x.plastic * (1 - (x.recycled ?? 1)),
    ),
  );
  const hi = sum(
    c.components.map((x) =>
      x.plastic === null ? null : x.plastic * (1 - (x.recycled ?? 0)),
    ),
  );
  return {
    mass,
    plastic,
    lo,
    hi,
    virgin: lo === hi ? lo : null,
    recycled:
      plastic !== null && lo === hi && lo !== null ? plastic - lo : null,
  };
}
export function economics(
  base: Candidate,
  c: Candidate,
  units: number,
  adoption: number,
) {
  const b = sum([base.price, base.handling, base.other]),
    n = sum([c.price, c.handling, c.other]);
  const unit = b === null || n === null ? null : b - n,
    annual = unit === null ? null : unit * units * adoption;
  return {
    recurring: n,
    unit,
    annual,
    net:
      annual === null || c.implementation === null
        ? null
        : annual - c.implementation,
    payback:
      unit !== null && unit > 0 && c.implementation !== null
        ? c.implementation / unit
        : null,
  };
}
export function reduction(k: Case, c: Candidate) {
  const b = totals(k.candidates.find((x) => x.id === k.baseline)!);
  const a = totals(c);
  return {
    lo:
      b.lo === null || a.hi === null
        ? null
        : ((b.lo - a.hi) * k.units * k.adoption) / 1e6,
    hi:
      b.hi === null || a.lo === null
        ? null
        : ((b.hi - a.lo) * k.units * k.adoption) / 1e6,
  };
}
export type Check = {
  name: string;
  state: "Supported by recorded evidence" | "Unverified" | "Mismatch";
  detail: string;
};
export function checks(k: Case, c: Candidate): Check[] {
  const ev = k.evidence.find((e) => e.id === c.evidenceSource);
  const grounded =
    !!ev?.reviewed &&
    ev.type !== "Missing" &&
    ev.type !== "Illustrative assumption";
  const make = (
    name: string,
    bad: boolean,
    known: boolean,
    detail: string,
  ): Check => ({
    name,
    state: bad
      ? "Mismatch"
      : known && grounded
        ? "Supported by recorded evidence"
        : "Unverified",
    detail,
  });
  return [
    make(
      "Temperature",
      k.temperature !== null && c.maxTemp !== null && k.temperature > c.maxTemp,
      k.temperature !== null && c.maxTemp !== null,
      `Actual contact ${fmt(k.temperature)}°C / entered limit ${fmt(c.maxTemp)}°C. Conditions and source scope must match.`,
    ),
    make(
      "Duration",
      k.hours !== null && c.maxHours !== null && k.hours > c.maxHours,
      k.hours !== null && c.maxHours !== null,
      `${fmt(k.hours)} h required / ${fmt(c.maxHours)} h documented. Holding needs food-handling evidence too.`,
    ),
    make(
      "Intended use",
      !!c.useScope && c.useScope !== k.use,
      c.useScope === k.use,
      `Required: ${k.use || "not entered"}; recorded scope: ${c.useScope || "unknown"}.`,
    ),
    make(
      "Food-contact review",
      false,
      !k.food || c.foodReviewed,
      k.food
        ? "Review exact SKU and relevant food/use conditions."
        : "Non-food use recorded.",
    ),
    make(
      "Protection / shelf life",
      false,
      c.protection,
      "Functional equivalence and product loss require trial evidence.",
    ),
    make(
      "Line compatibility",
      false,
      c.line,
      "Confirm sealing, filling, handling and throughput on the actual line.",
    ),
  ];
}
export function threshold(c: Candidate, competitor: Candidate) {
  const t = totals(c),
    v = totals(competitor).virgin;
  const u = c.components.filter(
    (x) => x.plastic !== null && x.plastic > 0 && x.recycled === null,
  );
  if (t.plastic === null || v === null)
    return {
      r: null,
      text: "Incomplete mass or uncertain competitor: no unique crossover.",
      question:
        "Please confirm plastic masses and minimum recycled content for each exact component SKU.",
    };
  if (u.length !== 1)
    return {
      r: null,
      text:
        u.length > 1
          ? `Multiple unknowns: virgin range ${fmt(t.lo)}–${fmt(t.hi)} g. No unique threshold.`
          : "No unresolved recycled fraction with positive plastic mass.",
      question:
        "Please confirm the component-specific masses and minimum recycled content.",
    };
  const m = u[0].plastic!;
  const other = c.components
    .filter((x) => x.id !== u[0].id)
    .reduce((a, x) => a + x.plastic! * (1 - (x.recycled ?? 0)), 0);
  const r = 1 - (v - other) / m;
  const text =
    r < 0
      ? "This candidate is lower throughout the possible 0–100% range."
      : r >= 1
        ? r === 1
          ? "100% only ties; it cannot rank lower."
          : "No feasible recycled percentage can make this candidate lower."
        : `This candidate could rank first if verified recycled content exceeds ${fmt(r * 100)}%, assuming the other entered values remain unchanged. At ${fmt(r * 100)}% they tie.`;
  return {
    r,
    text,
    question: `Please confirm the minimum recycled-plastic content by mass for the exact ${u[0].name} SKU, whether it excludes the other components (including the lid/cap), and whether it is post-consumer or pre-consumer.`,
  };
}
export function validate(k: Case) {
  const n = (x: unknown, label: string, max = Infinity) => {
    if (
      x !== null &&
      (typeof x !== "number" || !Number.isFinite(x) || x < 0 || x > max)
    )
      throw Error(`Invalid ${label}`);
  };
  if (
    !k ||
    !Array.isArray(k.candidates) ||
    !k.candidates.length ||
    !Array.isArray(k.evidence)
  )
    throw Error("Invalid case structure");
  if (
    typeof k.id !== "string" ||
    typeof k.name !== "string" ||
    typeof k.description !== "string" ||
    typeof k.use !== "string" ||
    typeof k.food !== "boolean" ||
    typeof k.illustrative !== "boolean"
  )
    throw Error("Invalid case metadata");
  if (k.units === null || k.adoption === null)
    throw Error("Volume and adoption are required");
  n(k.units, "annual units");
  n(k.adoption, "adoption", 1);
  n(k.temperature, "temperature");
  n(k.hours, "duration");
  if (
    !k.candidates.some((c) => c.id === k.baseline) ||
    !k.candidates.some((c) => c.id === k.selected)
  )
    throw Error("Missing baseline or selected candidate");
  if (new Set(k.candidates.map((c) => c.id)).size !== k.candidates.length)
    throw Error("Duplicate candidate IDs");
  for (const c of k.candidates) {
    if (
      !c.components?.length ||
      typeof c.name !== "string" ||
      typeof c.id !== "string" ||
      typeof c.notes !== "string" ||
      typeof c.useScope !== "string"
    )
      throw Error("Invalid candidate");
    for (const key of [
      "price",
      "handling",
      "other",
      "implementation",
      "maxTemp",
      "maxHours",
    ] as const)
      n(c[key], key);
    for (const x of c.components) {
      if (
        typeof x.name !== "string" ||
        typeof x.material !== "string" ||
        typeof x.source !== "string" ||
        typeof x.notes !== "string" ||
        typeof x.provenance !== "string" ||
        typeof x.id !== "string"
      )
        throw Error("Invalid component");
      n(x.mass, "component mass");
      n(x.plastic, "plastic mass");
      n(x.recycled, "recycled fraction", 1);
      if (x.mass !== null && x.plastic !== null && x.plastic > x.mass)
        throw Error("Plastic mass exceeds total mass");
    }
  }
  for (const e of k.evidence) {
    for (const key of [
      "id",
      "issuer",
      "documentId",
      "version",
      "passage",
      "claim",
      "scope",
      "limitations",
    ] as const)
      if (typeof e[key] !== "string") throw Error("Invalid evidence");
    n(e.page, "page");
    if (
      ![
        "Measured",
        "Supplier document",
        "Public reference",
        "Illustrative assumption",
        "Missing",
      ].includes(e.type) ||
      typeof e.reviewed !== "boolean"
    )
      throw Error("Invalid evidence type");
  }
  if (k.pilot) {
    const p = k.pilot;
    for (const key of [
      "procurementOwner",
      "qualityOwner",
      "operationsOwner",
      "supplierContact",
      "targetDate",
      "stopCriteria",
      "notes",
    ] as const)
      if (typeof p[key] !== "string") throw Error("Invalid pilot plan");
    n(p.trialUnits, "trial units");
    n(p.budget, "pilot budget");
    if (!Array.isArray(p.tests) || p.tests.length > 50)
      throw Error("Invalid pilot tests");
    for (const t of p.tests) {
      for (const key of [
        "id",
        "name",
        "owner",
        "acceptance",
        "result",
      ] as const)
        if (typeof t[key] !== "string") throw Error("Invalid pilot test");
      if (!["Not run", "Passed", "Failed"].includes(t.status))
        throw Error("Invalid trial status");
      if (t.status === "Passed" && (!t.acceptance.trim() || !t.result.trim()))
        throw Error(
          "Record an acceptance criterion and result before marking a test passed.",
        );
    }
  }
  if (
    k.audit &&
    (!Array.isArray(k.audit) ||
      k.audit.some(
        (a) =>
          typeof a.id !== "string" ||
          typeof a.at !== "string" ||
          typeof a.summary !== "string",
      ))
  )
    throw Error("Invalid change history");
  return k;
}
export function readStore(raw: string): Store {
  const s = JSON.parse(raw);
  if (
    s.version !== 1 ||
    !Array.isArray(s.cases) ||
    !s.cases.length ||
    s.cases.length > 100
  )
    throw Error("Expected PackProof JSON version 1 with 1–100 cases");
  s.cases.forEach(validate);
  return s;
}
export function decisionQuestion(k: Case, c: Candidate) {
  const rivals = k.candidates.filter((x) => x.id !== c.id);
  if (!rivals.length || rivals.some((x) => totals(x).virgin === null)) {
    return {
      r: null,
      text: "Other candidates have incomplete or uncertain virgin plastic. Compare intervals; no unique first-place threshold is available.",
      question:
        "Please confirm the plastic masses and minimum recycled content for every unresolved component and exact SKU.",
    };
  }
  const best = [...rivals].sort(
    (a, b) => totals(a).virgin! - totals(b).virgin!,
  )[0];
  return { ...threshold(c, best), competitor: best.name };
}
export function brief(k: Case, c: Candidate) {
  const b = k.candidates.find((x) => x.id === k.baseline)!;
  return {
    case: k,
    candidate: c,
    baseline: b,
    totals: totals(c),
    baselineTotals: totals(b),
    reduction: reduction(k, c),
    cost: economics(b, c, k.units, k.adoption),
    checks: checks(k, c),
    question: decisionQuestion(k, c),
    generatedAt: new Date().toISOString(),
  };
}
export const sampleCSV =
  "candidate,component,material,total_g,plastic_g,recycled_percent\nImported tray,Tray,PET,16,16,90\nImported tray,Lid,PE,3,3,0\n";
export function importCSV(text: string): Candidate[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);
  if (
    lines.shift() !==
    "candidate,component,material,total_g,plastic_g,recycled_percent"
  )
    throw Error(
      "CSV header does not match sample. Use plain values without commas or quotes.",
    );
  const groups = new Map<string, Candidate>();
  for (const line of lines) {
    const v = line.split(",");
    if (v.length !== 6 || v.some((x) => x.includes('"')))
      throw Error("CSV requires six unquoted columns");
    const [name, component, material, m, p, r] = v;
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    let c = groups.get(name);
    if (!c) {
      c = emptyCandidate(name);
      groups.set(name, c);
    }
    c.components.push({
      id: uid(),
      name: component,
      material,
      mass: num(m),
      plastic: num(p),
      recycled: r === "" ? null : Number(r) / 100,
      provenance: "CSV — human review required",
      source: "",
      notes: "",
    });
  }
  return [...groups.values()];
}
export function emptyCandidate(name = "New candidate"): Candidate {
  return {
    id: uid(),
    name,
    components: [],
    price: null,
    handling: null,
    other: null,
    implementation: null,
    maxTemp: null,
    maxHours: null,
    useScope: "",
    evidenceSource: "",
    foodReviewed: false,
    protection: false,
    line: false,
    notes: "",
  };
}
