export const STATUSES = Object.freeze(['built','building','planned']);
export const FILTERS = Object.freeze(['all','built','building','planned','favourites']);
const validId = value => typeof value === 'string' && /^[a-z][a-z0-9-]{1,39}$/.test(value);
export function validateCatalog(catalog){
  if(!Array.isArray(catalog)||catalog.length<1)throw new Error('The catalog must contain apps.');
  const ids=new Set(),priorities=new Set();
  for(const app of catalog){
    if(!app||!validId(app.id)||ids.has(app.id))throw new Error('Invalid or duplicate app ID.');
    ids.add(app.id);
    if(typeof app.name!=='string'||!app.name.trim()||typeof app.description!=='string'||!app.description.trim())throw new Error(`Incomplete listing: ${app.id}`);
    if(!STATUSES.includes(app.status))throw new Error(`Invalid app status: ${app.id}`);
    if(!Number.isInteger(app.priority)||app.priority<0||priorities.has(app.priority))throw new Error(`Invalid priority: ${app.id}`);
    priorities.add(app.priority);
    if(typeof app.category!=='string'||!app.category.trim())throw new Error(`Invalid category: ${app.id}`);
    for(const key of ['website','repository']) if(app[key]!==undefined && !isSafeLink(app[key]))throw new Error(`Unsafe link for ${app.id}`);
    if(app.status!=='built' && app.website)throw new Error(`Unreleased app must not have a launch link: ${app.id}`);
  }
  return true;
}
export function isSafeLink(url){
  try{const u=new URL(url);return u.protocol==='https:' && !u.username && !u.password;}catch{return false;}
}
export function normaliseFavourites(input,apps){
  const ids=new Set(apps.map(app=>app.id));
  return Array.isArray(input)?[...new Set(input.filter(id=>validId(id)&&ids.has(id)))].slice(0,50):[];
}
export function matchApps(apps,{query='',filter='all',category='all',favourites=[]}={}){
  const q=String(query).trim().toLocaleLowerCase('en-GB');
  const fav=new Set(favourites);
  return apps.filter(app=>{
    if(filter==='favourites'&&!fav.has(app.id))return false;
    if(STATUSES.includes(filter)&&app.status!==filter)return false;
    if(category!=='all'&&app.category!==category)return false;
    if(!q)return true;
    return [app.name,app.eyebrow,app.category,app.description,...app.features].join(' ').toLocaleLowerCase('en-GB').includes(q);
  }).sort((a,b)=>(fav.has(b.id)?1:0)-(fav.has(a.id)?1:0)||a.priority-b.priority);
}
export function statusCounts(apps){return {total:apps.length,built:apps.filter(x=>x.status==='built').length,building:apps.filter(x=>x.status==='building').length,planned:apps.filter(x=>x.status==='planned').length};}
