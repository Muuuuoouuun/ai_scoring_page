from pathlib import Path
from copy import deepcopy
from collections import Counter
from decimal import Decimal
import hashlib, json
base_path = Path('/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v16.json')
folder = Path('/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui')
report = Path('/private/tmp/ais-v17-cross-screen-review.md')
out = Path('/private/tmp/ais-v17-score-worksheet-proposed.json')
check_path = Path('/private/tmp/ais-v17-score-proposal-check.json')
base = json.loads(base_path.read_text())
proposed = deepcopy(base)
def gates(d):
    return [gate for area in d['areas'] for _, _, gs in area['groups'] for gate in gs]
def fixed(d):
    return [(a['name'], [(name, weight, [(g['id'],g['name'],g['weight']) for g in gs]) for name,weight,gs in a['groups']]) for a in d['areas']]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
old = {g['id']:g for g in gates(base)}
new = {g['id']:g for g in gates(proposed)}
assert old['3.4.4']['state']=='UNVERIFIED' and old['3.4.4']['weight']==6.25 and old['3.4.4']['earned']==0
current_evidence = ('E17V: Existing documented 28-principal desktop/mobile visual critiques are connected to current V01–V09 expanded-state viewport observations and the explicit V10 cross-screen comparison in ais-v17-cross-screen-review.md. Stored comparison fine print/history/warnings, full condition and record forms through their final controls, payment/refund/settlement, both sides of billing/monthly/admin tables, all three dated-comparison details and held/ineligible/multicurrency/preperiod/confirmed results, simple transition calculation, production search/result/filter/empty states, representative complete guide, and actual-role admin/feedback expansions have documented direct visual readings. Reviewer personally read117 images; bounded independent reviewer reports document68 more, total185 opened including one rejected and three limited captures; the189-file manifest is not an all-images-read claim. Four excluded and three limited captures are preserved with explicit replacement/coverage, and all189 file hashes/byte counts independently matched. Local synthetic fixtures and production QA/empty states stay distinct; viewport, document width and raster dimensions stay distinct. This credits completion of the fixed visual comparison, not perfect design, every value branch, native zoom, screen-reader speech, real-user tasks, actual email or production replay of all local captures.')
new['3.4.4']['state']='PASS'
new['3.4.4']['earned']=6.25
new['3.4.4']['evidence']='Historical V16 evidence: '+old['3.4.4']['evidence']+' Current V17: '+current_evidence
proposed['source']='97022e07918cc0254a252b6e7a219e35fb00e9bb'
proposed['date']='2026-09-13'
proposed['v16ChangesPreservedForHistory']=deepcopy(base['changes'])
proposed['changes']=[{'id':'3.4.4','from':'UNVERIFIED','to':'PASS','previousEarned':0,'earned':6.25,'delta':6.25,'reason':current_evidence}]
proposed['historicalSourceContextThroughV16']=deepcopy(base['sourceContext'])
publication={
 'source':'97022e07918cc0254a252b6e7a219e35fb00e9bb',
 'status':'succeeded','version':19,
 'versionId':'appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_7706ab31eb948191ad712d969e4053e3',
 'deploymentId':'appgdep_6aa57fa607b8819195b104c892a52351',
 'updatedAt':'2026-09-12T16:37:26.448721+00:00',
 'environmentRevision':2,'url':'https://ais-discovery-hub.aaahaaah19.chatgpt.site',
 'access':'owner-private/custom; one account, zero external users/groups',
 'observedBy':'root terminal tool receipt reported to reviewer; reviewer did not call Sites',
}
proposed['sourceContext']={
 'deployedSource':publication['source'],'deployedAt':publication['updatedAt'],
 'siteUrl':publication['url'],'access':'owner-private','environmentRevision':2,
 'previousDeployedSource':base['sourceContext']['deployedSource'],
 'previousDeployedAt':base['sourceContext']['deployedAt'],
 'v17PublicationStatus':'succeeded; owner-private; Sites version19; environment revision2; reported by root',
 'v17Change':'Bounded visual repairs and completed fixed expanded-state cross-screen critique. Native zoom/reflow and observed screen-reader gates remain unchanged and UNVERIFIED.',
 'historicalContext':'Full inherited V16 sourceContext preserved in historicalSourceContextThroughV16.',
}
proposed['evidenceRegister']['E17V']='docs/audits/v17-expanded-ui/manifest.json; /private/tmp/ais-v17-cross-screen-review.md and six linked independent V03/V04/V05/V07/V08/green visual reports. Existing V10 28-principal critique reused as historical context; original bytes and failed captures preserved.'
scores=[]
for a in proposed['areas']:
    score=sum((Decimal(str(g['earned'])) for _,_,gs in a['groups'] for g in gs),Decimal(0))
    scores.append({'area':a['name'],'score':float(score)})
proposed['totals']=scores
counts=dict(Counter(g['state'] for g in gates(proposed)))
proposed['counts']={key:counts.get(key,0) for key in ('PASS','GAP','UNVERIFIED')}
proposed['overall']='incomplete: only fixed gate3.4.4 changes in this V17 proposal. Design93.75→100; all other eight area scores are unchanged. Five of nine areas reach88; four retained GAP and seven UNVERIFIED gates remain. Actual email/unattended operations, external visitor and independent real-session evidence, native zoom/reflow and observed screen-reader tasks, representative comparison-understanding/guide reproduction, and deployed full export/download/destructive observation remain open.'
manifest=json.loads((folder/'manifest.json').read_text())
errors=[]
for entry in manifest['screenshots']:
    p=folder/entry['file']
    if p.stat().st_size!=entry['bytes'] or sha(p)!=entry['sha256']:
        errors.append(entry['file'])
assert not errors
reports=[report,Path('/private/tmp/ais-v17-v03-review.md'),Path('/private/tmp/ais-v17-v04-review.md'),Path('/private/tmp/ais-v17-v05-review.md'),Path('/private/tmp/ais-v17-v07-review.md'),Path('/private/tmp/ais-v17-v08-review.md'),Path('/private/tmp/ais-v17-v04-v05-green-review.md')]
proposed['v17Proposal']={
 'status':'PROPOSED: root owns adoption; original V16 worksheet unchanged',
 'baselineFile':str(base_path),'baselineSHA256':sha(base_path),'scope':['3.4.4'],
 'sourceAtCaptureStart':manifest['sourceAtStart'],
 'publication':publication,
 'environment':'Private expanded screens: actual localhost React UI and explicitly synthetic existing records; confirmed result uses documented temporary tax fixture restored by root. Search/guide/admin: actual prior production deployment with real allowed role and existing QA/zero-data states. Do not relabel all captures as V19 production.',
 'criterionInterpretation':'Complete documented cross-screen visual observation; not visual perfection, all value combinations, 200%/native reflow, screen-reader execution, real-user research or production replay of every local screenshot.',
 'reportHashes':[{'file':str(p),'sha256':sha(p)} for p in reports],
 'manifest':{'file':str(folder/'manifest.json'),'sha256':sha(folder/'manifest.json'),'files':len(manifest['screenshots']),'hashAndBytesMismatches':errors,'states':dict(Counter(e.get('status') for e in manifest['screenshots']))},
 'readingCounts':{'thisReviewer':117,'otherIndependentReports':68,'totalActuallyOpenedAcrossReviewers':185,'includesRejected':1,'includesLimited':3,'notOpened':4,'notOpenedFiles':['v08-search-M-01.jpg','v08-search-M-02.jpg','v08-search-D-valid-01.jpg','v06-date-validation-M.jpg']},
 'remainingUnverified':[g['id'] for g in gates(proposed) if g['state']=='UNVERIFIED'],
 'remainingGap':[g['id'] for g in gates(proposed) if g['state']=='GAP'],
 'scopeLimits':['Long single-line input/select values are not fully visible in static captures.','Green refund/monthly collapsed interiors reuse their earlier actually opened, unaffected-area observations.','One normal mobile filter capture shows result card and principal footer but clips the bottom feedback-link margin; shared footer is read elsewhere.','No newly invented state-combination, native zoom, reader, real-user or email completion credit.'],
}
# Verify every frozen structure and all non-target objects, including inherited evidence.
assert fixed(base)==fixed(proposed)
assert len(proposed['areas'])==9
assert sum(len(a['groups']) for a in proposed['areas'])==38
assert len(gates(proposed))==len(new)==152
assert all(sum(Decimal(str(w)) for _,w,_ in a['groups'])==100 for a in proposed['areas'])
for a in proposed['areas']:
    for _,weight,gs in a['groups']:
        assert len(gs)==4
        for g in gs:
            assert Decimal(str(g['weight']))==Decimal(str(weight))/4
            assert g['earned']==(g['weight'] if g['state']=='PASS' else 0)
changed=[key for key in old if old[key]!=new[key]]
assert changed==['3.4.4']
assert all(old[k]==new[k] for k in old if k!='3.4.4')
assert proposed['method']==base['method'] and proposed['caps']==base['caps']
assert proposed['counts']=={'PASS':141,'GAP':4,'UNVERIFIED':7}
assert len(proposed['changes'])==1 and proposed['changes'][0]['id']=='3.4.4'
score_deltas=[{'area':after['area'],'before':before['score'],'after':after['score'],'delta':after['score']-before['score']} for before,after in zip(base['totals'],scores)]
assert [x for x in score_deltas if x['delta']!=0]==[{'area':'디자인','before':93.75,'after':100.0,'delta':6.25}]
verification={
 'baselineSHA256':sha(base_path),'areas':9,'groups':38,'gates':152,'allIDsUnique':True,
 'fixedAreaGroupNamesGateIDsNamesAndWeightsIdentical':True,
 'other151GateObjectsIncludingEvidenceIdentical':True,
 'changedGateIDs':changed,'methodAndCapsIdentical':True,
 'allGroupWeightsSumTo100PerArea':True,'fourEqualBinaryGatesPerGroup':True,
 'counts':proposed['counts'],'scores':scores,'scoreDeltas':score_deltas,
 'areasAtLeast88':sum(x['score']>=88 for x in scores),'all9AtLeast88':False,
 'scopeGatesOnly':True,'originalWorksheetNotWritten':True,
 'manifestFilesHashAndBytesChecked':189,'manifestMismatches':errors,
}
proposed['v17Proposal']['independentVerification']=verification
out.write_text(json.dumps(proposed,ensure_ascii=False,indent=2)+'\n')
# Read the persisted proposal rather than treating generation as verification.
persisted=json.loads(out.read_text())
assert persisted==proposed
assert sha(base_path)==verification['baselineSHA256']
verification['proposalFile']=str(out)
verification['proposalSHA256']=sha(out)
check_path.write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'proposal':str(out),'check':str(check_path),'changedGateIDs':changed,'counts':proposed['counts'],'scores':scores,'areasAtLeast88':verification['areasAtLeast88'],'originalWorksheetHashUnchanged':True,'manifestMismatches':errors},ensure_ascii=False,indent=2))
