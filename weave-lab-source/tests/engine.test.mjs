import test from 'node:test';
import assert from 'node:assert/strict';
import {ASPECTS,FORMS,LINES,RULESETS,getForm} from '../site/data.mjs';
import {normaliseSeed,rng,next,adjacent,weaveGroups,legalSwaps,isStableBoard,createLoom,copyBoard,cloneLoom,applySwap,rankSwaps,calculateDamage,createDraft,draftPick,autoDraft} from '../site/engine.mjs';
import {chooseSwap,runLoomTrial,runLoomBatch,compareLoomRules,runBattleProxy,runProxyBatch,validateImportedScenario} from '../site/simulation.mjs';

test('six Aspects, 12 Archive forms, 36 Arts, no temporary identity',()=>{
 assert.equal(ASPECTS.length,6);assert.equal(FORMS.length,12);assert.equal(new Set(FORMS.map(x=>x.id)).size,12);
 assert.deepEqual(FORMS.filter(x=>!x.evolved).map(x=>x.line),LINES);
 for(const line of LINES)assert.equal(FORMS.filter(f=>f.line===line).length,2);
 for(const f of FORMS){assert.equal(f.arts.length,3);assert(f.hp>0&&f.attack>0&&f.phy>0&&f.sp>0);assert(f.arts.every(a=>a.cost>0&&a.ap>=0));}
 assert.equal(FORMS.reduce((n,f)=>n+f.arts.length,0),36);
});
test('ruleset versions preserve distinct historical and v0.2 mechanics',()=>{
 assert.equal(RULESETS.legacy.startingMarkers,3);assert.equal(RULESETS.legacy.reweaveCost,6);assert.equal(RULESETS.legacy.droughtAtZero,true);
 assert.equal(RULESETS.canonical.startingMarkers,8);assert.equal(RULESETS.canonical.reweaveCost,4);
 assert.equal(RULESETS.canonical.refillThreadChance,.35);assert.equal(RULESETS.canonical.minMarkers,6);assert.equal(RULESETS.canonical.markerCap,14);
});
test('seed handling and RNG stream deterministic',()=>{
 assert.equal(normaliseSeed('Alpha'),normaliseSeed('Alpha'));assert.notEqual(normaliseSeed('Alpha'),normaliseSeed('Beta'));
 const a=rng(19),b=rng(19);assert.deepEqual([next(a),next(a),next(a)],[next(b),next(b),next(b)]);
});
test('orthogonal adjacent validation rejects diagonal and wrap',()=>{
 assert.equal(adjacent(0,1),true);assert.equal(adjacent(0,7),true);assert.equal(adjacent(6,7),false);assert.equal(adjacent(0,8),false);assert.equal(adjacent(-1,0),false);assert.equal(adjacent(48,49),false);
});
test('every created board is stable and presents legal one-swap Weaves',()=>{
 for(const rule of ['legacy','canonical'])for(let seed=0;seed<40;seed++){
  const a=createLoom(seed,rule);assert.equal(a.board.length,49);assert(isStableBoard(a.board));assert(legalSwaps(a.board,{productiveOnly:true}).length>0);
  assert.equal(a.board.filter(x=>x.threaded).length,RULESETS[rule].startingMarkers);
 }
});
test('seeded boards have fully repeatable Strand identity and Thread flags',()=>{
 const a=createLoom(9345),b=createLoom(9345);assert.deepEqual(a,b);
 const ranked=rankSwaps(a);assert.equal(ranked.length,84);assert(ranked[0].score>=ranked[1].score);
 applySwap(a,ranked[0].a,ranked[0].b);applySwap(b,ranked[0].a,ranked[0].b);
 assert.deepEqual(a,b);
});
test('intersecting row and column Weaves merge unique Strands',()=>{
 const b=Array.from({length:49},(_,id)=>({id,aspect:(id*2+Math.floor(id/7)*3)%6,threaded:false}));
 b[3*7+2].aspect=1;b[3*7+3].aspect=1;b[3*7+4].aspect=1;b[2*7+3].aspect=1;b[4*7+3].aspect=1;
 const groups=weaveGroups(b);assert(groups.some(g=>g.length>=5&&new Set(g).size===g.length));
});
test('valid non-matching swaps spend a Move and obey Thread minimum',()=>{
 const a=createLoom(20);const non=rankSwaps(a).find(x=>x.strands===0);assert(non);
 const outcome=applySwap(a,non.a,non.b);assert.equal(a.turn,1);assert.equal(outcome.strands,0);assert(a.board.filter(x=>x.threaded).length>=6);
});
test('Threads stay capped at six while marker counts obey cap',()=>{
 let a=createLoom(27);for(let i=0;i<20;i++){const [x,y]=chooseSwap(a,'greedy');applySwap(a,x,y);assert(a.threads>=0&&a.threads<=6);assert(a.board.filter(x=>x.threaded).length<=14);}assert(a.history.length===20);
});
test('bonus Move at most one regardless of cascade groups',()=>{
 const a=createLoom(27);for(let i=0;i<45;i++){const [x,y]=chooseSwap(a);const z=applySwap(a,x,y);assert.equal(typeof z.bonus,'boolean');assert(z.threads>=0&&z.groups>=0);assert.equal(z.strands,z.essence.reduce((a,b)=>a+b,0));}
});
test('canonical damage formula AP times ATK divided by 50 plus relevant defence',()=>{
 const source=getForm('rukhara'),target=getForm('maledith');const hit=calculateDamage({attacker:source,target,art:{name:'Probe',ap:40,cost:0,damageType:'physical'},mode:'canonical'});
 assert.equal(hit.perHit,55);assert.equal(hit.raw,55);
});
test('physical and Special Defence are handled independently',()=>{
 const source=getForm('rukhara'),target=getForm('cragkyl');const physical=calculateDamage({attacker:source,target,art:{name:'P',ap:40,cost:0,damageType:'physical'}});
 const special=calculateDamage({attacker:source,target,art:{name:'S',ap:40,cost:0,damageType:'special'}});
 assert(physical.raw<special.raw);
});
test('True Damage ignores Shield except Craglet and Cragkyl immunity',()=>{
 const attacker=getForm('craglet'),art=attacker.arts[0];const normalTarget=calculateDamage({attacker,target:'mothrit',art,shield:200});
 const immuneTarget=calculateDamage({attacker,target:'cragkyl',art,shield:200});
 assert.equal(normalTarget.shieldAbsorbed,0);assert(normalTarget.bypass);assert.equal(immuneTarget.hpDamage,0);assert(immuneTarget.immune);assert(immuneTarget.shieldAbsorbed>0);
});
test('delayed damage and utility Arts are not counted as immediate hits',()=>{
 const runic=calculateDamage({attacker:'fjordfin',target:'craglet',art:getForm('fjordfin').arts[1]});
 const wall=calculateDamage({attacker:'fjordfin',target:'craglet',art:getForm('fjordfin').arts[2]});
 assert.equal(runic.hpDamage,0);assert.equal(wall.hpDamage,0);
});
test('separate bite hits round per bite rather than summed AP',()=>{
 const source=getForm('bloomdra'),target=getForm('mothrit'),art=source.arts[0];const r=calculateDamage({attacker:source,target,art,heads:3});assert.equal(r.hits,8);assert.equal(r.raw,r.perHit*8);
});
test('conditional abilities increase Art AP only when enabled',()=>{
 const a=getForm('rukhara'),target=getForm('maledith'),art=a.arts[2];
 const high=calculateDamage({attacker:a,target,art,hpPct:90,firstArt:true});const low=calculateDamage({attacker:a,target,art,hpPct:50,firstArt:true});
 assert.equal(low.ap-high.ap,48);
 const fort=getForm('cragkyl'),last=fort.arts[2];assert.equal(calculateDamage({attacker:fort,target,art:last,fortress:5}).ap,180);
});
test('snaking exclusivity and auto-draft',()=>{
 const d=createDraft();assert.equal(draftPick(d,'fjordfin'),0);assert.equal(draftPick(d,'craglet'),1);assert.throws(()=>draftPick(d,'fjordfin'),/already drafted/);
 autoDraft(d,4);assert(d.complete);assert.equal(d.picks[0].length,3);assert.equal(d.picks[1].length,3);assert.equal(new Set(d.history).size,6);
});
test('Loom trials and comparisons reproduce outputs for same seeds',()=>{
 const config={seed:33,samples:3,moves:12,policy:'first'};
 const a=runLoomBatch({...config,ruleset:'canonical'}),b=runLoomBatch({...config,ruleset:'canonical'});assert.deepEqual(a,b);
 const cmp=compareLoomRules(config);assert.equal(cmp.legacy.ruleset,'legacy');assert.equal(cmp.canonical.ruleset,'canonical');assert.equal(cmp.legacy.totalMoves,36);
});
test('battle proxy preserves separate Team Threads and reports censored runs',()=>{
 const a=runBattleProxy({seed:3,maxMoves:15});const b=runBattleProxy({seed:3,maxMoves:15});assert.deepEqual(a,b);
 assert(a.threadBalances.length===2);assert(a.threadBalances.every(x=>x>=0&&x<=6));
 assert.equal(a.moves<=15,true);assert.equal(a.censored,a.winner===null);
});
test('proxy batch counts only completed runs for victory fraction',()=>{
 const a=runProxyBatch({seed:17,samples:3,maxMoves:20});assert.equal(a.runs.length,3);assert.equal(a.summary.completed+a.summary.censored,3);assert(a.summary.side0WinAmongCompleted===null||a.summary.side0WinAmongCompleted>=0);
});
test('scenario import validates ruleset, seed, line exclusivity and names',()=>{
 const base={seed:321,ruleId:'canonical',attacker:'mothrit',target:'ruklet',artIndex:1,smoothing:50,rosterA:['fjordfin','kilnix','ruklet'],rosterB:['craglet','budwyrm','mothrit']};assert.deepEqual(validateImportedScenario(base),base);
 assert.throws(()=>validateImportedScenario({...base,ruleId:'invalid'}),/ruleset/);
 assert.throws(()=>validateImportedScenario({...base,rosterB:['fjordfin','budwyrm','mothrit']}),/draft/);
 assert.throws(()=>validateImportedScenario({...base,smoothing:0}),/smoothing/);
});

import {decodeReport,summarizeReport,aggregateReports,MAX_REPORT_COUNT} from '../site/report-inspector.mjs';
const sampleReport=()=>({schemaVersion:1,weaveVersion:'0.1.2',engineRevision:'weave-engine-v0.1.2-immunity.1',rulesetFingerprint:'1a2b3c4d',seed:129,rosters:[['fjordfin','status','craglet'],['moveeco','support','resource']],actions:[{kind:'swap',a:3,b:4},{kind:'cast',casterId:'0-0',artIndex:0},{kind:'timeout'},{kind:'reweave',weaverId:'0-0'}],events:[{kind:'bonusMove',actionIndex:1,turn:1,side:0},{kind:'timeoutSwap',actionIndex:2,turn:1,side:1}],result:0,turnCount:12,state:{winner:0,threads:[3,4],teams:[[{name:'Fjordfin',hp:78,maxHp:120,essence:5,shield:10,rewoven:false},{name:'Status',hp:50,maxHp:110,essence:2,shield:0,rewoven:false},{name:'Craglet',hp:110,maxHp:130,essence:0,shield:0,rewoven:false}],[{name:'MoveEco',hp:0,maxHp:105,essence:0,shield:0,rewoven:false},{name:'Support',hp:0,maxHp:115,essence:0,shield:0,rewoven:false},{name:'Resource',hp:0,maxHp:105,essence:0,shield:0,rewoven:false}]]}});
test('Battle Report parser accepts known v0.1.2 shapes without claiming engine replay',()=>{const report=sampleReport();assert.deepEqual(decodeReport(JSON.stringify(report)),report);const s=summarizeReport(report);assert.equal(s.totalActions,4);assert.equal(s.actions.cast,1);assert.deepEqual(s.eventCounts.bonusMove,[1,0]);assert.match(s.verification,/NOT been verified/);});
test('Battle Report inspector rejects malformed schema and unsupported version',()=>{const r=sampleReport();assert.throws(()=>decodeReport({...r,weaveVersion:'0.2.0'}),/only supports/);assert.throws(()=>decodeReport({...r,actions:[{kind:'nonsense'}]}),/Invalid action/);assert.throws(()=>decodeReport({...r,result:'winner'}),/result/);assert.throws(()=>decodeReport('{broken json'),/valid JSON/);});
test('Reports do not mistake incomplete Battles for completed wins',()=>{const r=sampleReport();r.result=null;r.state.winner=null;const a=summarizeReport(r);assert.equal(a.complete,false);const total=aggregateReports([r]);assert.equal(total.counts.completed,0);assert.equal(total.counts.incomplete,1);});
test('Aggregates preserve source fingerprint diversity and duplicate-seed flags',()=>{const a=sampleReport(),b=sampleReport();b.rulesetFingerprint='cafebabe';b.result=1;b.state.winner=1;const z=aggregateReports([a,b]);assert.equal(z.counts.total,2);assert.equal(z.counts.fingerprintVariants,2);assert.equal(z.counts.duplicateSeeds,1);assert.equal(z.counts.player0Wins,1);assert.equal(z.counts.player1Wins,1);});
test('Report inputs and roster lengths are bounded',()=>{const r=sampleReport();assert.throws(()=>decodeReport({...r,rosters:[['a'],['b']]}),/rosters/);assert.throws(()=>aggregateReports(Array(MAX_REPORT_COUNT+1).fill(r)),/Import up to/);});
