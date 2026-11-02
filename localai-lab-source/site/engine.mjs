import {MODELS,PRESETS} from './catalog.mjs';
export const STORAGE_KEY='empyrios-localai-lab-v1';
export const CONTEXTS=Object.freeze([2048,4096,8192,16384,32768]);
export const PRIORITIES=Object.freeze(['fit','size','name']);
export const GIB_PER_GB=1e9/2**30;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const safeString=(v,max=90)=>String(v??'').replace(/[\x00-\x1F\x7F]/g,'').trim().slice(0,max);
export function formatGB(n){return n<1?`${Math.round(n*1000)} MB`:`${n.toFixed(n<10?1:0)} GB`;}
export function makeProfile(input){
  const name=safeString(input?.name||'Custom setup',48),gpu=safeString(input?.gpu||'Unknown GPU',60),cpu=safeString(input?.cpu||'Unknown CPU',60);
  const vramGB=Number(input?.vramGB),ramGB=Number(input?.ramGB);
  if(!Number.isFinite(vramGB)||vramGB<0||vramGB>192||!Number.isFinite(ramGB)||ramGB<4||ramGB>1024)throw new Error('Enter 0–192 GB VRAM and 4–1024 GB RAM.');
  return {name,gpu,cpu,vramGB:Math.round(vramGB*10)/10,ramGB:Math.round(ramGB*10)/10};
}
export function checkCatalog(models=MODELS){
  const ids=new Set(),tags=new Set();
  for(const m of models){
    if(!m||typeof m.id!=='string'||ids.has(m.id)||tags.has(m.tag))throw new Error('Duplicate or invalid model');
    ids.add(m.id);tags.add(m.tag);
    if(!Number.isFinite(m.downloadGB)||m.downloadGB<=0||!Number.isFinite(m.params)||m.params<=0||!Array.isArray(m.tasks)||!m.source.startsWith('https://ollama.com/library/'))throw new Error('Invalid catalog values');
  }
  return true;
}
export function estimate(model,profile,contextTokens=4096){
  if(!model||!Number.isFinite(model.downloadGB)||model.downloadGB<=0)throw new Error('Invalid model');
  const p=makeProfile(profile),context=Number(contextTokens);
  if(!CONTEXTS.includes(context))throw new Error('Unsupported context length');
  // Planning heuristic only. Download sizes are decimal GB; convert to GPU GiB roughly.
  // KV cache varies substantially with architecture, GQA, KV quantisation and batch size.
  // 0.065 GiB/4K/1B is deliberately approximate, not a benchmark.
  const weightsGiB=model.downloadGB*GIB_PER_GB*1.08;
  const kvGiB=0.20+(context/4096)*model.params*0.065;
  const visionGiB=model.vision?0.45:0;
  const runtimeGiB=0.85;
  const neededGiB=weightsGiB+kvGiB+runtimeGiB+visionGiB;
  const gpuReserveGiB=p.vramGB>0?0.8:0;
  const gpuUsableGiB=Math.max(0,p.vramGB-gpuReserveGiB);
  const sysReserveGiB=3.5;
  const sysUsableGiB=Math.max(0,p.ramGB-sysReserveGiB);
  const hostNeedGiB=weightsGiB+kvGiB+1.6+visionGiB;
  let tier='insufficient';
  if(p.vramGB>0&&neededGiB<=gpuUsableGiB)tier='gpu';
  else if(hostNeedGiB<=sysUsableGiB)tier=p.vramGB>0?'hybrid':'cpu';
  const risk=neededGiB>gpuUsableGiB?neededGiB-gpuUsableGiB:0;
  const headroomGiB=tier==='gpu'?gpuUsableGiB-neededGiB:sysUsableGiB-hostNeedGiB;
  return {tier,context,weightsGiB,kvGiB,runtimeGiB,visionGiB,neededGiB,gpuUsableGiB,sysUsableGiB,hostNeedGiB,headroomGiB,risk,profile:p,contextExceedsModel:context>model.contextMax};
}
export const TIER_LABELS=Object.freeze({gpu:'GPU fit',hybrid:'Hybrid / slower',cpu:'CPU only',insufficient:'Memory risk'});
export const TIER_INFO=Object.freeze({gpu:'Estimated to fit fully on GPU, but context and driver overhead may change results.',hybrid:'Likely needs CPU + GPU offloading, which can reduce speed significantly.',cpu:'No dedicated VRAM assumed. Likely to run in system memory, with CPU-limited performance.',insufficient:'Estimated system RAM is insufficient with this context. Try a smaller model or context.'});
export function rankModels(models,profile,context,task='all',query='',sort='fit'){
  const q=safeString(query,120).toLocaleLowerCase('en-GB');
  const rank={gpu:0,hybrid:1,cpu:2,insufficient:3};
  const rows=models.filter(m=>(task==='all'||m.tasks.includes(task))&&[m.name,m.family,m.tag,m.description,...m.tasks].join(' ').toLocaleLowerCase('en-GB').includes(q)).map(m=>({...m,assessment:estimate(m,profile,context)}));
  return rows.sort((a,b)=>{
    if(sort==='size')return a.downloadGB-b.downloadGB;
    if(sort==='name')return a.name.localeCompare(b.name);
    return rank[a.assessment.tier]-rank[b.assessment.tier]||b.params-a.params;
  });
}
export function recommended(rows,task='all'){
  const usable=rows.filter(x=>x.assessment.tier==='gpu');
  if(usable.length)return usable[0];
  return rows.find(x=>x.assessment.tier!=='insufficient')||null;
}
export function commandFor(model){
  if(!MODELS.some(m=>m.id===model?.id&&m.tag===model?.tag))throw new Error('Model is not in curated catalog');
  return `ollama run ${model.tag}`;
}
export function defaults(){return {version:1,profile:makeProfile(PRESETS[0]),context:4096,task:'all',sort:'fit',favourites:[],selected:[]};}
export function validateSettings(input){
  if(!input||input.version!==1)throw new Error('Unknown settings version');
  const profile=makeProfile(input.profile),context=CONTEXTS.includes(input.context)?input.context:4096;
  const validIds=new Set(MODELS.map(m=>m.id));
  const keep=xs=>Array.isArray(xs)?[...new Set(xs.filter(x=>typeof x==='string'&&validIds.has(x)))].slice(0,3):[];
  const fav=Array.isArray(input.favourites)?[...new Set(input.favourites.filter(x=>typeof x==='string'&&validIds.has(x)))].slice(0,100):[];
  return {version:1,profile,context,task:['all','coding','reasoning','vision','fast','general'].includes(input.task)?input.task:'all',sort:PRIORITIES.includes(input.sort)?input.sort:'fit',favourites:fav,selected:keep(input.selected)};
}
export function profileDiff(model,a,b,context=4096){return {left:estimate(model,a,context),right:estimate(model,b,context)};}
export function statusTotals(models,profile,context){const initial={gpu:0,hybrid:0,cpu:0,insufficient:0};return models.reduce((acc,m)=>(acc[estimate(m,profile,context).tier]++,acc),initial);}
export function safeDisplayText(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
