import { type Case, type Candidate, type PilotPlan, totals, fmt } from './domain';
import { NumberInput } from './components';
export function trialMetrics(units: number | null, rejected: number | null, virgin: number | null) {
  const complete = units !== null && units > 0 && rejected !== null && rejected >= 0 && rejected <= units;
  const rate = complete ? rejected! / units! : null;
  return { rate, perUsable: rate !== null && rate < 1 && virgin !== null ? virgin / (1-rate) : null };
}
export function TrialResults({k,c,p,update,readonly=false}: {k:Case;c:Candidate;p:PilotPlan;update?:(p:PilotPlan)=>void;readonly?:boolean}) {
  const matches = p.observations?.baselineId === k.baseline && p.observations?.candidateId === c.id;
  const o = matches ? p.observations! : { baselineId:k.baseline, candidateId:c.id, baselineUnits:null, baselineRejected:null, candidateUnits:null, candidateRejected:null, reference:'' };
  const base = k.candidates.find(x=>x.id===k.baseline)!;
  const b=trialMetrics(o.baselineUnits,o.baselineRejected,totals(base).virgin);
  const a=trialMetrics(o.candidateUnits,o.candidateRejected,totals(c).virgin);
  return <section className="trial-observations">
    <div className="eyebrow">OBSERVED PACK PERFORMANCE</div>
    <h3>Less plastic must still protect the product.</h3>
    {p.observations && !matches && <p className="trial-conclusion">Saved observations belong to another comparison. Switch back to those candidates to view them. Entering a new sample here replaces that observation set; export your case first to retain both.</p>}
    <p>Record comparable trial samples using the same rejection definition, food, contact conditions and observation period. Leave fields blank until measured. Counts alone do not establish safety or statistical equivalence.</p>
    {!readonly && <div className="form-row">
      {(['baselineUnits','baselineRejected','candidateUnits','candidateRejected'] as const).map((key,i)=><NumberInput key={key} label={['Baseline packs tested','Baseline packs rejected','Candidate packs tested','Candidate packs rejected'][i]} value={o[key]} step="1" onChange={n=>update?.({...p,observations:{...o,[key]:n}})}/>)}
    </div>}
    <div className="trial-metrics">
      <div><b>{fmt(b.rate===null?null:b.rate*100)}%</b><span>baseline rejected · {fmt(o.baselineRejected)} / {fmt(o.baselineUnits)} packs</span></div>
      <div><b>{fmt(a.rate===null?null:a.rate*100)}%</b><span>candidate rejected · {fmt(o.candidateRejected)} / {fmt(o.candidateUnits)} packs</span></div>
      <div><b>{fmt(b.perUsable)} → {fmt(a.perUsable)} g</b><span>virgin plastic consumed per usable pack</span></div>
    </div>
    <p className="trial-conclusion">{a.rate!==null && b.rate!==null ? a.rate>b.rate ? 'Hold: the candidate has a higher observed rejection rate. Investigate product loss before any rollout.' : 'No increase in rejection rate in these entered samples. This does not establish equivalent performance; review sample size, severity and all trial gates.' : 'No outcome claimed. Enter both measured samples and rejected counts to compare.'}</p>
    <p>Material per usable pack = entered virgin plastic per pack ÷ usable fraction. Includes packaging on rejected units; excludes the environmental impact of wasted food and replacement logistics. Unknown component content stays unknown. This is not an LCA.</p>
    {readonly ? <p>Trial evidence: {o.reference||'Not attached'}</p> : <label className="field">Trial evidence and method<textarea placeholder="Date, lot, reviewer, rejection definition and evidence location" value={o.reference} onChange={e=>update?.({...p,observations:{...o,reference:e.target.value}})}/></label>}
  </section>;
}
