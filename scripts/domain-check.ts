import { reviewProgress } from "../src/workflow";
import assert from "node:assert/strict";
import { demos } from "../src/data";
import { publicCase } from '../src/public-case';
import {
  totals,
  reduction,
  checks,
  economics,
  threshold,
  validate,
  brief,
  readStore,
  importCSV,
  sampleCSV,
  defaultPilot,
  pilotStatus,
} from "../src/domain";
const close = (a: number | null, b: number) =>
  assert.ok(a !== null && Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const sourcedCase = publicCase();
validate(sourcedCase);
const sourcedCandidate = sourcedCase.candidates[1];
assert.equal(totals(sourcedCandidate).virgin, null, 'Published tray weight must not imply virgin-plastic mass');
assert.equal(reduction(sourcedCase, sourcedCandidate).lo, null, 'Missing baseline must not imply savings');
assert.equal(economics(sourcedCase.candidates[0], sourcedCandidate, 0, 1).annual, null);
assert.equal(reviewProgress(sourcedCase, sourcedCandidate).sourced, 0, 'Public sheet is not a reviewed purchasing declaration');
assert.ok(checks(sourcedCase, sourcedCandidate).every(x => x.state === 'Unverified'));
assert.equal(readStore(JSON.stringify({version: 1, cases: [sourcedCase]})).cases[0].candidates[1].components[0].mass, 21.38);
const [a, b, c] = demos();
close(totals(a.candidates[0]).virgin, 17);
close(totals(a.candidates[1]).virgin, 9);
close(totals(a.candidates[2]).virgin, 4.6);
close(reduction(a, a.candidates[2]).lo, 12.4);
assert.equal(totals(c.candidates[1]).virgin, null);
close(totals(c.candidates[1]).lo, 2);
close(totals(c.candidates[1]).hi, 27);
const unknown = structuredClone(a);
unknown.candidates[0].components[0].plastic = null;
assert.equal(totals(unknown.candidates[0]).plastic, null);
assert.equal(reduction(unknown, unknown.candidates[2]).lo, null);
for (const invalid of [-1, Infinity, NaN]) {
  const x = structuredClone(a);
  x.candidates[0].components[0].mass = invalid;
  assert.throws(() => validate(x));
}
const invalid = structuredClone(a);
invalid.candidates[0].components[0].plastic = 21;
assert.throws(() => validate(invalid));
invalid.candidates[0].components[0].plastic = 20;
invalid.candidates[0].components[0].recycled = 1.1;
assert.throws(() => validate(invalid));
assert.equal(checks(b, b.candidates[1])[0].state, "Mismatch");
b.use = "Post-cooking";
b.temperature = null;
b.hours = null;
assert.equal(checks(b, b.candidates[1])[0].state, "Unverified");
assert.equal(checks(b, b.candidates[1])[1].state, "Unverified");
const negative = { ...a, baseline: "pcr" };
assert.ok(reduction(negative, a.candidates[0]).lo! < 0);
assert.equal(
  economics(c.candidates[0], c.candidates[1], c.units, c.adoption).payback,
  null,
);
assert.ok(
  economics(c.candidates[0], c.candidates[1], c.units, c.adoption).net! < 0,
);
close(threshold(c.candidates[1], c.candidates[0]).r, 0.6);
const competitor = structuredClone(c.candidates[0]);
competitor.components[0].plastic = 100;
competitor.components[0].mass = 100;
competitor.components[0].recycled = 0;
assert.ok(threshold(c.candidates[1], competitor).r! < 0);
competitor.components.forEach((p) => (p.recycled = 1));
assert.ok(threshold(c.candidates[1], competitor).r! > 1);
const zero = structuredClone(c.candidates[1]);
zero.components[0].plastic = 0;
assert.equal(threshold(zero, c.candidates[0]).r, null);
close(totals(zero).virgin, 2);
const multiple = structuredClone(c.candidates[1]);
multiple.components[1].recycled = null;
assert.equal(threshold(multiple, c.candidates[0]).r, null);
const tie = structuredClone(c.candidates[1]);
tie.components[0].recycled = 0.6;
close(totals(tie).virgin, totals(c.candidates[0]).virgin!);
a.units = 12345;
a.adoption = 0.4;
const report = brief(a, a.candidates[2]);
close(report.reduction.lo, (12.4 * 12345 * 0.4) / 1e6);
assert.equal(report.case.units, 12345);
assert.equal(
  readStore(JSON.stringify({ version: 1, cases: [a] })).cases[0].units,
  12345,
);
assert.throws(() => readStore('{"version":2,"cases":[]}'));
const csv = importCSV(sampleCSV);
close(totals(csv[0]).virgin, 4.6);
assert.equal(csv[0].price, null);
console.log(
  "PASS: illustrative arithmetic, intervals, missing data, validation, use checks, negative savings, no false payback, thresholds, active-data brief, versioned JSON and CSV.",
);

const pilotCase = structuredClone(a);
pilotCase.pilot = defaultPilot();
assert.equal(pilotCase.pilot.tests.length, 9);
assert.equal(
  pilotStatus(pilotCase, pilotCase.candidates[2]),
  "Define owners and trial criteria",
);
pilotCase.pilot.tests[0].status = "Passed";
assert.throws(() => validate(pilotCase));
pilotCase.pilot.tests[0].acceptance = "10 sample weights within agreed limit";
pilotCase.pilot.tests[0].result = "Synthetic verification record";
validate(pilotCase);
pilotCase.pilot.tests[0].status = "Failed";
assert.equal(
  pilotStatus(pilotCase, pilotCase.candidates[2]),
  "Stop — resolve mismatch or failed test",
);
assert.equal(
  readStore(JSON.stringify({ version: 1, cases: [pilotCase] })).cases[0].pilot
    ?.tests[0].status,
  "Failed",
);
console.log(
  "PASS: pilot validation, failure gate, nine retail checks and persisted report data.",
);

const [journeyA, journeyB, journeyC] = demos();
assert.equal(reviewProgress(journeyA, journeyA.candidates[2]).sourced, 0);
assert.equal(
  reviewProgress(journeyA, journeyA.candidates[2]).next.tab,
  "Components",
);
assert.equal(
  reviewProgress(journeyB, journeyB.candidates[1]).next.tab,
  "Use checks",
);
assert.equal(
  reviewProgress(journeyC, journeyC.candidates[1]).materialComplete,
  false,
);
journeyA.evidence[0].reviewed = true;
assert.equal(
  reviewProgress(journeyA, journeyA.candidates[2]).sourced,
  0,
  "Reviewed illustrative assumptions must not become sourced components",
);
journeyA.pilot = defaultPilot();
journeyA.pilot.tests[0].status = "Failed";
assert.equal(
  reviewProgress(journeyA, journeyA.candidates[2]).next.tab,
  "Pilot plan",
);
console.log(
  "PASS: workflow prioritizes mismatches and failed tests; illustrative sources remain unverified.",
);
