from pathlib import Path
import json, copy, hashlib
from collections import Counter
ROOT=Path('/Users/bigmac_moon/dev/ai_score')
basepath=ROOT/'docs/audits/2026-09-13-score-worksheet-v15.json'
base=json.loads(basepath.read_text())
d=copy.deepcopy(base)
epath=ROOT/'docs/audits/v16-ui-recovery'
receipt=json.loads((epath/'deployment-receipt.json').read_text())
new_evidence={
 '4.3.3': 'E16R: Root-observed current local React UI: ordinary guest community→Claude question draft→development authentication→same open form/context/values restored with consent unchecked; Claude/Figma drafts isolated; reply retains parent/body and a new submitted reply has the correct Claude parent context. Final review-before-login-final.json→review-after-login-final.json preserves all 14 non-consent fields, including usedAt=2026-09-11; consent true→false. Actual local dev-server stop→submit connection error with draft retained→restart→one local question saved. Final screenshots and DB receipts preserved; earlier date-13 review-login-green.json is superseded and earns no final restoration credit. No real external ChatGPT authentication, expired-session edit recovery, or accepted-response-loss/idempotency claim.',
 '7.2.4': 'E16P: Root-observed actual local React UI with two explicitly synthetic, different user_id parent/reply records: published baseline→hidden parent→deleted parent→reply B full body/author/date readable→return to list; reviewer directly read all three original captures, including both hidden/deleted fallback states. Fixture cleanup recorded. This proves the fixed readable UI task, not two real people/accounts, production identity isolation, or execution of the actual author/admin mutation controls.'
}
changes=[]
for a in d['areas']:
 for gn,gw,gs in a['groups']:
  for g in gs:
   if g['id'] in new_evidence:
    changes.append({'id':g['id'],'from':'UNVERIFIED','to':'PASS','previousEarned':g['earned'],'earned':g['weight'],'delta':g['weight'],'reason':new_evidence[g['id']]})
    assert g['state']=='UNVERIFIED' and g['earned']==0
    g.update(state='PASS',earned=g['weight'],evidence=new_evidence[g['id']])
d['source']=receipt['source']
d['date']='2026-09-13'
d['totals']=[{'area':a['name'],'score':sum(g['earned'] for _,_,gs in a['groups'] for g in gs)} for a in d['areas']]
d['counts']=dict(Counter(g['state'] for a in d['areas'] for _,_,gs in a['groups'] for g in gs))
d['changes']=changes
d['overall']='incomplete: only fixed gates 4.3.3 and 7.2.4 are proposed PASS from bounded current local UI observations. Five of nine areas reach 88; four retained GAP and eight UNVERIFIED gates remain. Actual email/unattended operations, external-user and independent real-session evidence, complete expanded visual/zoom/reader tasks, representative use tasks, and deployed full export/delete observation remain open.'
d['evidenceRegister']['E16R']='docs/audits/v16-ui-recovery/ — draft-after-login-green.json; context-isolation-green.json; reply-login-green.json; ais-v16-reply-context-red.json/green.json; review-before-login-final.json and review-after-login-final.json; network-failure-green.json/png; network-retry-green.png; root sequence account and ais-v16-final-code-review.md. Red and superseded observations retained separately.'
d['evidenceRegister']['E16P']='docs/audits/v16-ui-recovery/ — parent-published.png, parent-hidden.png, parent-deleted.png/json, ais-v16-thread-fixture.md/py and ais-v16-local-cleanup.json; root actual UI observation plus reviewer direct image reading; synthetic local users only.'
d['evidenceRegister']['P16']='docs/audits/v16-ui-recovery/deployment-receipt.json — succeeded owner-private Sites version18, source2d54809d51bc2cacd096bd403e187afadcda078a, 2026-09-12T15:50:21.869820+00:00, environment revision2. This publication receipt does not relabel the local recovery/fixture tasks as production observations.'
d['v16Proposal']={
 'status':'PROPOSED: root owns final worksheet adoption; original V15 files unchanged',
 'baselineFile':str(basepath),
 'baselineSHA256':hashlib.sha256(basepath.read_bytes()).hexdigest(),
 'scope':['4.3.3','7.2.4'],
 'publication':{'source':receipt['source'],'version':receipt['version']['version_number'],'status':receipt['deployment']['status'],'at':receipt['deployment']['updated_at'],'environmentRevision':receipt['deployment']['env_set_revision'],'url':receipt['deployment']['url'],'observedBy':'root; receipt read by reviewer'},
 'uiEvidenceEnvironment':'localhost current React UI with development authentication and synthetic local fixtures; not independent real external production accounts',
 'historicalSourceContext':'Inherited sourceContext fields remain historical as received from V15; this v16Proposal.publication records the verified V16 receipt. Existing evidence is preserved for all 150 non-target gates.',
 'independentReview':'Read supplied artifacts and code-review report; directly opened baseline/hidden/deleted parent, connection-error and retry-success images; independently compared final review fields and recomputed all weights, totals and ID deltas. No browser/Sites/source/Git/operational mutations; no new test run is claimed.',
 'remainingUnverified':['1.3.4','3.4.4','5.1.4','5.2.4','6.1.4','6.3.4','8.1.4','8.5.4'],
 'remainingGap':['1.2.4','8.4.3','8.4.4','9.4.4']
}
# Strictly verify the frozen rubric and all non-target gate evidence.
assert len(d['areas'])==len(base['areas'])==9
ids=[]; changed=[]; groups=0
for old_a,new_a in zip(base['areas'],d['areas']):
 assert old_a['name']==new_a['name']
 assert len(old_a['groups'])==len(new_a['groups'])
 for old_group,new_group in zip(old_a['groups'],new_a['groups']):
  groups+=1
  assert old_group[:2]==new_group[:2] and len(new_group[2])==4
  assert sum(g['weight'] for g in new_group[2])==new_group[1]
  for o,n in zip(old_group[2],new_group[2]):
   ids.append(n['id'])
   for k in ('id','name','weight'): assert o[k]==n[k]
   if o!=n:
    changed.append(n['id']); assert n['id'] in new_evidence
    assert {k for k in set(o)|set(n) if o.get(k)!=n.get(k)}=={'state','earned','evidence'}
   else: assert n['id'] not in new_evidence
   assert n['earned']==(n['weight'] if n['state']=='PASS' else 0)
assert groups==38 and len(ids)==len(set(ids))==152
assert changed==['4.3.3','7.2.4']
assert d['counts']=={'PASS':140,'GAP':4,'UNVERIFIED':8}
assert [x['score'] for x in d['totals']]==[86.25,100,93.75,100,87.5,86.25,100,81.25,93.75]
assert d['caps']==base['caps'] and d['method']==base['method']
assert sum(x['score']>=88 for x in d['totals'])==5
before=json.loads((epath/'review-before-login-final.json').read_text())
after=json.loads((epath/'review-after-login-final.json').read_text())
bv=[x for x in before['values'] if x['type']!='checkbox']
av=[x for x in after['values'] if x['type']!='checkbox']
assert len(bv)==14 and bv==av
assert next(x['value'] for x in av if x['type']=='date')=='2026-09-11'
assert next(x['checked'] for x in before['values'] if x['type']=='checkbox') is True
assert next(x['checked'] for x in after['values'] if x['type']=='checkbox') is False
verify={'areas':9,'groups':groups,'gates':len(ids),'allIDsUnique':True,'fixedNamesIDsWeightsPreserved':True,'all150OtherGateObjectsIncludingEvidenceUnchanged':True,'changedIDs':changed,'counts':d['counts'],'scores':d['totals'],'areasAtLeast88':5,'all9AtLeast88':False,'finalReviewNonConsentFieldsIdentical':14,'finalReviewDate':'2026-09-11','restoredConsent':False,'capsAndMethodUnchanged':True}
d['v16Proposal']['independentVerification']=verify
out=Path('/private/tmp/ais-v16-gate-assessment.json')
out.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert json.loads(out.read_text())==d
print(json.dumps(verify,ensure_ascii=False,indent=2))
print('written',out)
