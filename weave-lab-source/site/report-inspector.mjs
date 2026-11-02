// Read-only analysis of exported Weave v0.1.2 Battle Reports.
// Schema-level validation is not equivalent to game-engine verified replay.
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const integer=(x,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
export const MAX_REPORT_BYTES=2_000_000;
export const MAX_REPORT_COUNT=100;
export class ReportImportError extends Error{}
const fail=(message)=>{throw new ReportImportError(message)};
export function decodeReport(input){
  let value=input;
  if(typeof value==='string'){
    if(input.length>MAX_REPORT_BYTES)fail('Battle Report exceeds the 2 MB limit');
    try{value=JSON.parse(input)}catch{fail('Battle Report is not valid JSON')}
  }
  if(!record(value))fail('Battle Report must be an object');
  if(value.schemaVersion!==1)fail('Expected Battle Report schemaVersion 1');
  if(value.weaveVersion!=='0.1.2')fail('Inspector only supports released v0.1.2 reports');
  if(!integer(value.seed,0,0xffffffff))fail('Invalid seed');
  if(typeof value.engineRevision!=='string'||!value.engineRevision.startsWith('weave-engine-v0.1.2')||value.engineRevision.length>200)fail('Invalid engine revision');
  if(typeof value.rulesetFingerprint!=='string'||!(/^[0-9a-f]{8}$/i.test(value.rulesetFingerprint)))fail('Invalid ruleset fingerprint');
  if(!Array.isArray(value.rosters)||value.rosters.length!==2||value.rosters.some(team=>!Array.isArray(team)||team.length!==3||team.some(x=>typeof x!=='string'||x.length>100)))fail('Expected two three-Weaver rosters');
  if(value.rosters.some(team=>new Set(team).size!==3))fail('Duplicate Weavers within a team');
  if(!Array.isArray(value.actions)||value.actions.length>10000)fail('Invalid action history');
  if(!Array.isArray(value.events)||value.events.length>20000)fail('Invalid derived events');
  if(!integer(value.turnCount,1,20000))fail('Invalid Turn count');
  if(![0,1,'draw',null].includes(value.result))fail('Invalid Battle result');
  if(!record(value.state)||!Array.isArray(value.state.teams)||value.state.teams.length!==2||value.state.teams.some(team=>!Array.isArray(team)||team.length!==3))fail('Invalid final Battle snapshot');
  const allowedActions=new Set(['timeout','swap','cast','reweave','traitChoice','surrender']);
  const allowedEvents=new Set(['timeoutSwap','bonusMove']);
  for(const [i,action] of value.actions.entries()){
    if(!record(action)||!allowedActions.has(action.kind))fail(`Invalid action ${i}`);
    if(action.kind==='swap'&&(!integer(action.a,0,48)||!integer(action.b,0,48)))fail(`Invalid swap ${i}`);
    if(action.kind==='cast'&&(!integer(action.artIndex,0,2)||typeof action.casterId!=='string'))fail(`Invalid Art ${i}`);
  }
  for(const [i,event] of value.events.entries()){
    if(!record(event)||!allowedEvents.has(event.kind))fail(`Invalid derived event ${i}`);
    if(event.side!==0&&event.side!==1)fail(`Invalid derived event side ${i}`);
  }
  return value;
}
const percent=(part,total)=>total?part/total:null;
const average=values=>values.length?values.reduce((sum,x)=>sum+x,0)/values.length:0;
export function summarizeReport(input){
 const report=decodeReport(input);
 const actions={swap:0,timeout:0,cast:0,reweave:0,traitChoice:0,surrender:0};
 const perCaster={};
 for(const action of report.actions){actions[action.kind]++;if(action.kind==='cast'){perCaster[action.casterId]=(perCaster[action.casterId]||0)+1;}}
 const eventCounts={bonusMove:[0,0],timeoutSwap:[0,0]};
 for(const event of report.events){eventCounts[event.kind][event.side]++;}
 const finalTeams=report.state.teams.map((team,side)=>team.map((w,slot)=>({side,slot,name:typeof w.name==='string'?w.name.slice(0,80):`slot ${slot+1}`,hp:typeof w.hp==='number'?w.hp:null,maxHp:typeof w.maxHp==='number'?w.maxHp:null,shield:typeof w.shield==='number'?w.shield:null,essence:typeof w.essence==='number'?w.essence:null,rewoven:!!w.rewoven})));
 return{seed:report.seed,version:report.weaveVersion,revision:report.engineRevision,fingerprint:report.rulesetFingerprint,rosters:report.rosters,result:report.result,turnCount:report.turnCount,totalActions:report.actions.length,actions,eventCounts,perCaster,finalTeams,finalThreads:Array.isArray(report.state.threads)?report.state.threads.slice(0,2):[],stateWinner:report.state.winner,complete:report.result!==null,
  warnings:[report.result===null?'This is a mid-battle snapshot, not a completed match.':null,report.state.winner!==report.result?'Reported result and final state winner disagree.':null].filter(Boolean),
  verification:'Structural checks only. Engine replay, history validity, state hash, fingerprint authenticity and imported file provenance have NOT been verified.'};
}
export function aggregateReports(inputs){
 if(!Array.isArray(inputs)||inputs.length>MAX_REPORT_COUNT)fail(`Import up to ${MAX_REPORT_COUNT} reports`);
 const reports=inputs.map(summarizeReport),completed=reports.filter(r=>r.complete), fingerprints=[...new Set(reports.map(r=>r.fingerprint))],seedCount=new Set(reports.map(r=>r.seed)).size;
 const actions={swap:0,timeout:0,cast:0,reweave:0,traitChoice:0,surrender:0};
 for(const r of reports)for(const k of Object.keys(actions))actions[k]+=r.actions[k];
 return{reports,counts:{total:reports.length,completed:completed.length,incomplete:reports.length-completed.length,uniqueSeeds:seedCount,duplicateSeeds:reports.length-seedCount,fingerprintVariants:fingerprints.length,player0Wins:completed.filter(r=>r.result===0).length,player1Wins:completed.filter(r=>r.result===1).length,draws:completed.filter(r=>r.result==='draw').length},averages:{turnsCompleted:average(completed.map(r=>r.turnCount)),actionsPerReport:average(reports.map(r=>r.totalActions)),bonusesPerReport:average(reports.map(r=>r.eventCounts.bonusMove.reduce((a,b)=>a+b,0))),timeoutsPerReport:average(reports.map(r=>r.actions.timeout))},actions,versions:[...new Set(reports.map(r=>r.version))],fingerprints,verification:'Parsed local file exports only. Not engine-authenticated replays and not conclusive population-level evidence.'};
}
