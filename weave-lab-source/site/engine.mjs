import {ASPECTS,FORMS,RULESETS,getForm,LINES} from './data.mjs';

export const SIZE=7;
const MAX_CASCADES=120;
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function normaliseSeed(value){
  if(typeof value==='number'&&Number.isSafeInteger(value))return value>>>0;
  if(typeof value==='string'&&/^\d{1,10}$/.test(value.trim()))return Number(value)>>>0;
  if(typeof value==='string'&&value.length){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
  return 20261102;
}
export function rng(seed){return {value:normaliseSeed(seed)};}
export function next(random){random.value=(Math.imul(random.value,1664525)+1013904223)>>>0;return random.value/4294967296;}
export function randInt(random,maximum){assert(Number.isInteger(maximum)&&maximum>0,'Invalid random range');return Math.floor(next(random)*maximum);}
export function adjacent(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&a<49&&b>=0&&b<49&&Math.abs(Math.floor(a/7)-Math.floor(b/7))+Math.abs(a%7-b%7)===1;}
export const copyBoard=board=>board.map(c=>({...c}));
const change=(board,a,b)=>{[board[a],board[b]]=[board[b],board[a]]};
export function weaveGroups(board){
  assert(Array.isArray(board)&&board.length===49,'Loom must contain 49 Strands');
  const runs=[];
  for(let axis=0;axis<2;axis++)for(let fixed=0;fixed<7;fixed++){
    let at=0;
    while(at<7){let end=at+1;const cell=n=>board[axis===0?fixed*7+n:n*7+fixed];
      while(end<7&&cell(end).aspect===cell(at).aspect)end++;
      if(end-at>=3)runs.push(Array.from({length:end-at},(_,i)=>axis===0?fixed*7+at+i:(at+i)*7+fixed));
      at=end;
    }
  }
  const groups=[];
  for(const run of runs){const set=new Set(run);for(let i=groups.length-1;i>=0;i--){if(groups[i].some(cell=>set.has(cell))){groups[i].forEach(cell=>set.add(cell));groups.splice(i,1)}}groups.push([...set].sort((a,b)=>a-b));}
  return groups;
}
export function legalSwaps(board,{productiveOnly=false}={}){
  const pairs=[];
  for(let a=0;a<49;a++)for(const b of [a+1,a+7])if(adjacent(a,b)){
    if(productiveOnly){change(board,a,b);const works=weaveGroups(board).length>0;change(board,a,b);if(!works)continue;}
    pairs.push([a,b]);
  }
  return pairs;
}
export function isStableBoard(board){return weaveGroups(board).length===0&&legalSwaps(board,{productiveOnly:true}).length>0;}
const newStrand=(state)=>({id:state.nextId++,aspect:randInt(state.random,6),threaded:false});
const markerCount=board=>board.reduce((sum,x)=>sum+Number(x.threaded),0);
export function addMarkers(board,random,target,cap=14){
  const total=markerCount(board),need=Math.min(Math.max(0,target-total),Math.max(0,cap-total));
  const available=board.map((c,i)=>!c.threaded?i:-1).filter(x=>x>=0);
  for(let n=0;n<need;n++){const j=randInt(random,available.length),index=available.splice(j,1)[0];board[index].threaded=true;}
  return need;
}
function clearStable(state){
  const items=state.board;
  for(let attempt=0;attempt<10000;attempt++){
    for(let i=48;i>0;i--){const j=randInt(state.random,i+1);change(items,i,j)}
    if(isStableBoard(items))return;
  }
  throw Error('Could not reshuffle Loom');
}
export function createLoom(seed,ruleset='canonical'){
  const rule=typeof ruleset==='string'?RULESETS[ruleset]:ruleset;
  assert(rule?.loomSize===7,'Unsupported ruleset');
  const state={seed:normaliseSeed(seed),random:rng(seed),nextId:1,board:[],turn:0,threads:0,history:[],last:null,ruleId:rule.id};
  for(let attempt=0;attempt<10000;attempt++){
    state.board=Array.from({length:49},()=>newStrand(state));
    if(isStableBoard(state.board))break;
  }
  assert(isStableBoard(state.board),'Could not create valid opening Loom');
  addMarkers(state.board,state.random,rule.startingMarkers,rule.markerCap);
  return state;
}
export function cloneLoom(state){return {...state,board:copyBoard(state.board),random:{...state.random},history:state.history.map(x=>({...x})),last:state.last?{...state.last}:null};}
export function resolveWeaves(state,rule){
  const info={groups:0,strands:0,cascades:0,bonus:false,threads:0,essence:Array(6).fill(0),steps:[],reshuffled:false,markerRefills:0};
  while(true){
    const groups=weaveGroups(state.board);
    if(!groups.length)break;
    if(++info.cascades>MAX_CASCADES)throw Error('Cascade safety limit reached');
    const removed=new Set(groups.flat());
    info.groups+=groups.length;info.strands+=removed.size;
    if(groups.some(x=>x.length>=4))info.bonus=true;
    for(const id of removed){const strand=state.board[id];info.essence[strand.aspect]++;if(strand.threaded)info.threads++;}
    info.steps.push({groupSizes:groups.map(x=>x.length),matched:removed.size,threadGain:[...removed].filter(i=>state.board[i].threaded).length});
    let liveMarkers=state.board.filter((x,i)=>x.threaded&&!removed.has(i)).length;
    for(let col=0;col<7;col++){
      const kept=[];
      for(let row=6;row>=0;row--){const pos=row*7+col;if(!removed.has(pos))kept.push(state.board[pos]);}
      for(let row=6;row>=0;row--){let current=kept[6-row];
        if(!current){current=newStrand(state);if(liveMarkers<rule.markerCap&&next(state.random)<rule.refillThreadChance){current.threaded=true;liveMarkers++;info.markerRefills++;}}
        state.board[row*7+col]=current;
      }
    }
  }
  if(!isStableBoard(state.board)){clearStable(state);info.reshuffled=true;}
  if(rule.minMarkers>0)addMarkers(state.board,state.random,rule.minMarkers,rule.markerCap);
  // v0.1.2 drought handling: one random Thread Marker when the Loom has none
  // and not all players are at Thread cap. The single-player lab uses its own cap.
  else if(rule.droughtAtZero&&markerCount(state.board)===0&&state.threads<rule.threadCap)addMarkers(state.board,state.random,1,rule.markerCap);
  state.threads=Math.min(rule.threadCap,state.threads+info.threads);
  return info;
}
export function applySwap(state,a,b,ruleId=state.ruleId){
  assert(adjacent(a,b),'Swap must be between orthogonally adjacent Strands');
  const rule=typeof ruleId==='string'?RULESETS[ruleId]:ruleId;
  assert(rule?.loomSize===7,'Unknown ruleset');
  change(state.board,a,b);
  const outcome=resolveWeaves(state,rule);
  const entry={move:++state.turn,a,b,...outcome,threadsAfter:state.threads};
  state.last=entry;state.history.push(entry);
  if(state.history.length>200)state.history.shift();
  return entry;
}
export function rankSwaps(state,ruleId=state.ruleId){
  const scores=legalSwaps(state.board).map(([a,b])=>{
    const shadow=cloneLoom(state);const r=applySwap(shadow,a,b,ruleId);
    return{a,b,score:r.strands+r.threads*1.8+Number(r.bonus)*3+r.cascades*.6,strands:r.strands,threads:r.threads,bonus:r.bonus,cascades:r.cascades,essence:r.essence};
  });
  return scores.sort((x,y)=>y.score-x.score||x.a-y.a||x.b-y.b);
}
export function calculateDamage({attacker,target,art,mode='canonical',smoothing=50,shield=0,hpPct=100,crit=false,heads=0,heat=0,burn=0,fortress=0,retaliated=false,firstArt=true,defenceBuff=0,attackBuff=0,customAP=null}){
  const source=typeof attacker==='string'?getForm(attacker):attacker;
  const victim=typeof target==='string'?getForm(target):target;
  assert(source&&victim&&art,'Missing attacker, target, or Art');
  assert(Number.isFinite(smoothing)&&smoothing>0,'Defence constant must be positive');
  const attack=source.attack*(1+attackBuff/100);
  const baseDef=mode==='legacy'?(victim.phy+victim.sp)/2:art.damageType==='physical'?victim.phy:victim.sp;
  const defence=Math.max(0,baseDef*(1+defenceBuff/100));
  const initialShield=Math.max(0,Number(shield)||0);
  let ap=customAP===null?art.ap:Number(customAP),hits=1;
  if(!Number.isFinite(ap)||ap<0)throw Error('Invalid Ability Power');
  const modifiers=[];
  if(customAP!==null)modifiers.push('Experimental Ability Power override');
  if(art.special==='heads'){ap+=12*heads;modifiers.push(`+${12*heads} AP from Bud Heads`);}
  if(art.special==='bites'){hits=art.baseHits+heads;modifiers.push(`${hits} separate bites`);}
  if(art.special==='execute'&&hpPct<=50){ap+=art.executeAP;modifiers.push('Wounded-target finisher');}
  if(art.special==='kilnix'){ap+=8*heat+2*burn;modifiers.push('Heat and Burn scaling');}
  if(art.special==='crucivar'){ap+=10*heat;modifiers.push('Heat scaling; pending fixed Burn release not included');}
  if(art.special==='fortress'){ap+=18*fortress;modifiers.push('Fortress stacks consumed');}
  else if(source.id==='cragkyl'&&ap>0&&art.special!=='fortress'){ap+=6*fortress;modifiers.push('Fortress bonus');}
  if(retaliated&&(source.id==='craglet'||source.id==='cragkyl')){ap+=source.evolved?20:18;modifiers.push('Retaliation bonus');}
  if((source.id==='ruklet'||source.id==='rukhara')&&hpPct<=50&&firstArt){ap+=source.evolved?16:10;modifiers.push('First-Art Trait bonus');}
  const direct=art.damageType!=='utility'&&art.timing!=='delayed';
  if(!direct)hits=0;
  const legacy=mode==='legacy';
  const normal=({value})=>Math.max(1,Math.floor((legacy?value*attack/(attack+defence||1):value*attack/(smoothing+defence))*(crit?1.5:1)+0.5));
  const each=direct?normal({value:ap}):0;
  const raw=each*hits;
  const immune=Boolean(art.trueDamage&&(victim.line==='craglet'));
  const bypass=Boolean(art.trueDamage&&!immune);
  const shieldRemoved=Math.min(initialShield,art.shieldRemoval||0);
  const availableShield=Math.max(0,initialShield-shieldRemoved);
  const shieldAbsorbed=bypass?0:Math.min(raw,availableShield);
  const hpDamage=Math.min(Math.max(0,victim.hp*hpPct/100),Math.max(0,raw-shieldAbsorbed));
  if(art.timing==='delayed')modifiers.push('Delayed trigger, not direct cast damage');
  if(legacy)modifiers.push('Legacy Defence approximated from current Archive split stats');
  if(art.damageType==='utility')modifiers.push('No immediate damage; utility and reaction simulation excluded');
  if(immune)modifiers.push('Craglet/Cragkyl convert True Damage to normal');
  return{ap,attack,defence,hits,perHit:each,raw,shieldRemoved,shieldAbsorbed,hpDamage,percent: victim.hp>0?hpDamage/victim.hp*100:0,bypass,immune,modifiers,legacy,provisional:true};
}
export function damageMatrix(attackerId,artIndex=0,options={}){
  const source=getForm(attackerId);assert(source,'Unknown attacker');const art=source.arts[artIndex];assert(art,'Unknown Art');
  return FORMS.map(target=>({target:target.id,name:target.name,aspect:target.aspect,percent:calculateDamage({attacker:source,target,art,...options}).percent}));
}
export const DRAFT_ORDER=[0,1,1,0,0,1];
export function createDraft(){return{picks:[[],[]],history:[],complete:false};}
export function draftPick(draft,line){
  assert(LINES.includes(line),'Unknown species line');
  assert(!draft.complete,'Draft is complete');
  assert(!draft.history.includes(line),'Species already drafted; no mirror picks');
  const side=DRAFT_ORDER[draft.history.length];assert(side!==undefined,'No draft slot');
  draft.picks[side].push(line);draft.history.push(line);draft.complete=draft.history.length===6;
  return side;
}
export function autoDraft(draft,seed){const r=rng(seed);while(!draft.complete){const free=LINES.filter(x=>!draft.history.includes(x));draftPick(draft,free[randInt(r,free.length)]);}return draft;}
