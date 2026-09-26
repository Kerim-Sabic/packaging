"""Bounded public-document regression, not a general accuracy benchmark.
Usage: .venv/Scripts/python scripts/public-document-check.py first.pdf second.pdf
Sources and exact reference items are documented in PUBLIC_DOCUMENT_TEST.md.
Raw source text stays in the local backend cache; this report contains only checks.
"""
import sys,json,time
from pathlib import Path
import httpx

assert len(sys.argv)==3,'Supply the two public PDFs in the documented order'
rows=[]
for path,sku,mass in zip(sys.argv[1:],['2200022012','140012032'],['21.38','15.43']):
    t=time.monotonic()
    with httpx.Client(timeout=300,trust_env=False) as client:
        response=client.post('http://127.0.0.1:8000/extract',files=[('files',(Path(path).name,Path(path).read_bytes(),'application/pdf'))])
        response.raise_for_status(); result=response.json()
    assert not result['error'],result['error']
    supported=[p for p in result['proposals'] if p['status']=='supported_proposal']
    def found(field,value): return any(p['fieldName']==field and p['value']==value and p['pageNumber']==1 for p in supported)
    checks={
        'exact_item':found('sku',sku),
        'nominal_mass_g':found('total_mass',mass),
        'material':found('material','CPET'),
        'maximum_temperature_C':found('temperature_max','220'),
        'no_invented_recycled_percentage':not any('recycled' in p['fieldName'] and p['value'] is not None for p in supported),
        'no_inferred_plastic_mass':not any(p['fieldName']=='plastic_mass' and p['value'] is not None for p in supported),
    }
    rows.append({'item':sku,'version':result['version'],'mode':result['mode'],'requestSeconds':round(time.monotonic()-t,1),'checks':checks,'matched':sum(checks.values()),'total':len(checks)})
report={'scope':'Two same-manufacturer, same-layout public PDFs. Target-field regression only; not overall extraction accuracy or supplier validation. Cached timings are not inference timings.','documents':rows}
target=Path(__file__).resolve().parents[1]/'.local/public-document-check.json'
target.parent.mkdir(exist_ok=True)
target.write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
assert all(all(row['checks'].values()) for row in rows),'Review failed targets; do not hide misses'
