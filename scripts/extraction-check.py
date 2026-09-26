"""One bounded live fixture check. Run with local backend and model ready."""
import json, sys
from pathlib import Path
import httpx
root=Path(__file__).resolve().parents[1]
with httpx.Client(timeout=300,trust_env=False) as client:
    files=[('files',(name,(root/'public/demo'/name).read_bytes(),'text/plain')) for name in ['spec-1.txt','spec-2.txt']]
    response=client.post('http://127.0.0.1:8000/extract',files=files)
    response.raise_for_status(); result=response.json()
assert not result['error'],result['error']
proposals=result['proposals']
assert any(p['value']=='16' and p['unit']=='g' for p in proposals),'16 g missing'
assert any(p['value']=='90' and 'tray' in p['scope'].lower() for p in proposals),'Scoped tray percentage missing'
assert any('up to' in p['verbatimSupportingText'].lower() and p['status']=='ambiguous' for p in proposals),'Up-to not flagged'
assert any(p['status']=='not_found' and p['value'] is None for p in proposals),'Missing field not preserved'
assert any(p['status']=='conflicting' for p in proposals),'Conflict not detected'
pages={(p['documentId'],p['pageNumber']):p['text'] for p in result['pages']}
for p in proposals:
    if p['status']=='supported_proposal':
        assert ' '.join(p['verbatimSupportingText'].split()).lower() in ' '.join(pages[(p['documentId'],p['pageNumber'])].split()).lower()
(root/'public/demo/extraction-recorded.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'PASS','proposals':len(proposals),'model':result['model'],'mode':result['mode'],'statuses':{s:sum(p['status']==s for p in proposals) for s in ['supported_proposal','ambiguous','conflicting','not_found']}},indent=2))
