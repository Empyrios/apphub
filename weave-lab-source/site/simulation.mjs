import {ASPECTS,FORMS,LINES,RULESETS,getForm,getLineForms} from './data.mjs';
import {applySwap,calculateDamage,cloneLoom,createDraft,createLoom,draftPick,legalSwaps,next,normaliseSeed,randInt,rankSwaps,rng,adjacent} from './engine.mjs';

const average=(a)=>a.length?a.reduce((sum,x)=>sum+x,0)/a.length:0;
const quantile=(values,share)=>{if(!values.length)return 0;const s=[...values].sort((a,b)=>a-b);const i=(s.length-1)*share,lo=Math.floor(i),hi=Math.ceil(i);return s[lo]*(hi-i)+s[hi]*(i-lo);};
const clip=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
export function chooseSwap(state,policy='greedy'){
 const legal=legalSwaps(state.board);
 if(policy==='random')return legal[randInt(state.random,legal.length)];
 if(policy==='first'){
   const rated=rankSwaps(state);return rated.find(x=>x.strands>0)?[rated.find(x=>x.strands>0).a,rated.find(x=>x.strands>0).b]:[legal[0][0],legal[0][1]];
 }
 const ranked=rankSwaps(state);const chosen=ranked[0];return [chosen.a,chosen.b];
}
// Exact to our standalone Loom model, not validated against Weave's released TypeScript engine.
export function runLoomTrial({seed=2,ruleset='canonical',moves=30,policy='greedy'}={}){
 const s=createLoom(seed,ruleset),summaries=[];
 for(let move=0;move<moves;move++){
  const [a,b]=chooseSwap(s,policy);const info=applySwap(s,a,b,ruleset);
  summaries.push({move:move+1,matched:info.strands,weaves:info.groups,cascades:info.cascades,threadsGained:info.threads,threadBalance:info.threadsAfter,bonus:info.bonus,essence:info.essence,reshuffled:info.reshuffled});
 }
 return{seed:normaliseSeed(seed),ruleset,policy,moves,summaries,threads:s.threads,finalBoard:s.board.map(x=>({...x})),finalRandom:s.random.value};
}
export function runLoomBatch({seed=2,samples=30,moves=30,policy='greedy',ruleset='canonical'}={}){
 if(!Number.isInteger(samples)||samples<1||samples>350)throw Error('Samples must be between 1 and 350');
 if(!Number.isInteger(moves)||moves<1||moves>150)throw Error('Moves must be between 1 and 150');
 if(!['canonical','legacy'].includes(ruleset))throw Error('Unknown ruleset');
 if(!['greedy','random','first'].includes(policy))throw Error('Unknown swap policy');
 const runs=[],all=[],hist=Array(8).fill(0);
 for(let i=0;i<samples;i++){
  const trial=runLoomTrial({seed:(normaliseSeed(seed)+i*7919)>>>0,ruleset,moves,policy});
  const s=trial.summaries;
  const out={matched:s.reduce((x,y)=>x+y.matched,0),threads:s.reduce((x,y)=>x+y.threadsGained,0),bonuses:s.filter(x=>x.bonus).length,cascades:s.reduce((x,y)=>x+y.cascades,0),deadLooms:s.filter(x=>x.reshuffled).length,productive:s.filter(x=>x.matched>0).length,essence:s.reduce((x,y)=>x+y.essence.reduce((a,b)=>a+b,0),0)};
  runs.push(out);all.push(...s);for(const move of s)hist[Math.min(7,move.matched)]++;
 }
 const total=samples*moves;
 return{ruleset,seed:normaliseSeed(seed),samples,moves,policy,totalMoves:total,
  summary:{matchedPerMove:average(runs.map(x=>x.matched/moves)),threadDropsPerMove:average(runs.map(x=>x.threads/moves)),bonusRate:average(runs.map(x=>x.bonuses/moves)),cascadeStepsPerMove:average(runs.map(x=>x.cascades/moves)),deadLoomRate:average(runs.map(x=>x.deadLooms/moves)),productiveRate:average(runs.map(x=>x.productive/moves)),essencePerMove:average(runs.map(x=>x.essence/moves)),matchedP10:quantile(runs.map(x=>x.matched/moves),.1),matchedP90:quantile(runs.map(x=>x.matched/moves),.9)},
  histogram:hist,runs};
}
export function compareLoomRules(config={}){
 const a=runLoomBatch({...config,ruleset:'legacy'}),b=runLoomBatch({...config,ruleset:'canonical'});
 return{legacy:a,canonical:b,delta:Object.fromEntries(Object.keys(a.summary).map(k=>[k,b.summary[k]-a.summary[k]])),note:'Matched seed inputs, but rule changes alter RNG consumption. This is a deterministic exploratory contrast, not a matched-state causal trial or a full-match win-rate estimate.'};
}
export function damageSensitivity(attacker,target,artIndex,config={}){
 const form=getForm(attacker),art=form?.arts[artIndex];if(!art)throw Error('Unknown Art');
 return[40,50,65].map(smoothing=>({smoothing,...calculateDamage({attacker,target,art,mode:'canonical',smoothing,...config})}));
}
export function buildRoster(lines){
 if(!Array.isArray(lines)||lines.length!==3||new Set(lines).size!==3||lines.some(line=>!LINES.includes(line)))throw Error('Need three unique Weaver lines');
 return lines.map((line,slot)=>({line,slot,form:getLineForms(line).find(f=>!f.evolved),rewoven:false,essence:0,shield:0,hp:getLineForms(line).find(f=>!f.evolved).hp,heads:0,heat:0,burn:0}));
}
// Deliberate simplified proxy. It ignores most status reactions, chain timing, targeting effects,
// full Art scripts and expert draft strategy. It is NOT an authoritative Weave battle simulator.
export function runBattleProxy({seed=3,rosterA=['fjordfin','kilnix','ruklet'],rosterB=['craglet','budwyrm','mothrit'],ruleset='canonical',policy='greedy',maxMoves=120}={}){
 const allLines=[...rosterA,...rosterB];if(new Set(allLines).size!==6)throw Error('Proxy requires an exclusive six-line draft');
 const teams=[buildRoster(rosterA),buildRoster(rosterB)],loom=createLoom(seed,ruleset),rule=RULESETS[ruleset];
 if(!rule)throw Error('Unknown ruleset');
 const rand=rng(normaliseSeed(seed)^0xa5a5a5a5);let side=randInt(rand,2),round=1,moves=0,casts=0,swaps=0,reweaves=0,bonusMoves=0,totalDamage=0;
 const threadBalances=[0,0];
 const events=[],resourceGains=[0,0],reweaveTurns=[],maxRecorded=240;
 const log=(kind,details)=>{if(events.length<maxRecorded)events.push({move:moves,side,turn:round,kind,...details});};
 const living=side=>teams[side].filter(x=>x.hp>0);
 const won=()=>!living(0).length?1:!living(1).length?0:null;
 while(moves<maxMoves&&won()===null){
  const active=living(side);if(!active.length)break;
  let remaining=2,added=0;
  while((remaining>0||added>0)&&moves<maxMoves&&won()===null){
    if(remaining>0)remaining--;else added--;
    moves++;
    const candidates=living(side);
    let acted=false;
    if(threadBalances[side]>=rule.reweaveCost){
      const target=candidates.find(x=>!x.rewoven);
      if(target){const previous=target.form;target.form=getLineForms(target.line).find(f=>f.evolved);target.rewoven=true;target.hp=clip(target.hp/previous.hp*target.form.hp,1,target.form.hp);threadBalances[side]-=rule.reweaveCost;reweaves++;reweaveTurns.push(round);
        log('reweave',{weaver:target.form.name,threads:threadBalances[side]});acted=true;}
    }
    if(!acted){
      const choices=[];
      for(const who of candidates)for(const art of who.form.arts){if(art.damageType==='utility'||art.timing==='delayed'||art.cost>who.essence)continue;
        for(const target of living(1-side)){
          const hit=calculateDamage({attacker:who.form,target:target.form,art,hpPct:clip(target.hp/target.form.hp*100,0,100),shield:target.shield,heat:who.heat,heads:who.heads});
          const priority=hit.hpDamage+Math.min(target.shield,hit.raw)*.2+(target.hp<=hit.hpDamage?25:0)+art.cost*-.1;
          choices.push({who,art,target,hit,priority});
        }
      }
      const winner=choices.sort((a,b)=>b.priority-a.priority||a.art.cost-b.art.cost)[0];
      if(winner){const{who,art,target,hit}=winner;who.essence-=art.cost;target.shield=Math.max(0,target.shield-hit.shieldRemoved-hit.shieldAbsorbed);target.hp=Math.max(0,target.hp-hit.hpDamage);casts++;totalDamage+=hit.hpDamage;
        if(art.special==='bites')who.hp=Math.min(who.form.hp,who.hp+hit.hpDamage*(who.rewoven?0.5:0.4));
        log('art',{caster:who.form.name,art:art.name,target:target.form.name,hpDamage:+hit.hpDamage.toFixed(1),targetHp:+target.hp.toFixed(1)});acted=true;
      }
    }
    if(!acted){
      const [a,b]=chooseSwap(loom,policy);
      loom.threads=threadBalances[side];
      const out=applySwap(loom,a,b,ruleset);
      threadBalances[side]=loom.threads;
      for(const [i,amt]of out.essence.entries())for(const w of candidates)if(w.form.aspect===ASPECTS[i]){const gain=Math.min(amt,Math.max(0,w.form.capacity-w.essence));w.essence+=gain;resourceGains[side]+=gain;}
      swaps++;if(out.bonus){added++;bonusMoves++;}
      log('swap',{a,b,matched:out.strands,threads:out.threads,bonus:out.bonus});
    }
  }
  side=1-side;round++;
 }
 return{seed:normaliseSeed(seed),ruleset,policy,rosters:[rosterA,rosterB],winner:won(),censored:won()===null,rounds:round-1,moves,casts,swaps,reweaves,bonusMoves,totalDamage,resourceGains,threadBalances,reweaveTurns,teams:teams.map(team=>team.map(w=>({name:w.form.name,hp:+w.hp.toFixed(1),maxHp:w.form.hp,essence:w.essence,rewoven:w.rewoven}))),events,note:'Exploratory damage-and-resource proxy only: omits full statuses, Taunt/Stealth, reactive Traits, exact Arts scripts, actual elapsed decision time and online multiplayer. Never use its win rates as production balance evidence.'};
}
export function runProxyBatch(config={}){
 const n=clip(Number(config.samples)||10,1,100);
 const results=[];
 for(let i=0;i<n;i++){
  const seed=(normaliseSeed(config.seed)+i*1069)>>>0;
  results.push(runBattleProxy({...config,seed}));
 }
 const decisive=results.filter(x=>x.winner!==null);
 return{runs:results,summary:{total:results.length,completed:decisive.length,censored:results.length-decisive.length,side0WinAmongCompleted:decisive.length?decisive.filter(x=>x.winner===0).length/decisive.length:null,avgMoves:average(results.map(x=>x.moves)),avgArts:average(results.map(x=>x.casts)),avgBonusMoves:average(results.map(x=>x.bonusMoves)),avgReweaves:average(results.map(x=>x.reweaves)),p90Moves:quantile(results.map(x=>x.moves),.9)},note:results[0]?.note};
}
export function validateImportedScenario(input){
 if(typeof input!=='object'||input===null||Array.isArray(input))throw Error('Invalid scenario object');
 const {seed,ruleId,attacker,target,artIndex,smoothing,rosterA,rosterB}=input;
 if(!['legacy','canonical'].includes(ruleId))throw Error('Invalid ruleset');
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid seed');
 if(!getForm(attacker)||!getForm(target))throw Error('Unknown Weaver');
 if(!Number.isInteger(artIndex)||artIndex<0||artIndex>2)throw Error('Invalid Art index');
 if(!Number.isFinite(smoothing)||smoothing<1||smoothing>500)throw Error('Invalid smoothing');
 if(!Array.isArray(rosterA)||!Array.isArray(rosterB)||new Set([...rosterA,...rosterB]).size!==6)throw Error('Invalid draft');
 if([...rosterA,...rosterB].some(x=>!LINES.includes(x)))throw Error('Unknown species line');
 return{seed,ruleId,attacker,target,artIndex,smoothing,rosterA:[...rosterA],rosterB:[...rosterB]};
}
