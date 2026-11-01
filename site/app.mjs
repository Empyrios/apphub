import {APPS} from './catalog.mjs';
import {FILTERS,matchApps,normaliseFavourites,statusCounts,validateCatalog} from './logic.mjs';

validateCatalog(APPS);
const ICONS={
  leaf:'<path d="M20 4c-8 0-15 3-15 11 0 3.4 2.6 5.5 5.5 5.5C18 20.5 21 12 20 4Z"/><path d="M4 22c4-6 8-10 13-13"/>',
  heart:'<path d="M20.8 4.9c-2.2-2-5.6-1.7-7.5.5L12 6.8l-1.3-1.4a5.4 5.4 0 0 0-7.5-.5 5.9 5.9 0 0 0-.3 8.1L12 22l9.1-9a5.9 5.9 0 0 0-.3-8.1Z"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 3 2 6-7"/><path d="M16 6h4v4"/>',
  book:'<path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Z"/><path d="M12 6v15"/>',
  brain:'<path d="M12 19.5V5a4 4 0 0 0-7.5-2 4.5 4.5 0 0 0-2 7 5 5 0 0 0 1 7 4 4 0 0 0 7.5 2.5ZM12 19.5V5a4 4 0 0 1 7.5-2 4.5 4.5 0 0 1 2 7 5 5 0 0 1-1 7 4 4 0 0 1-7.5 2.5Z"/><path d="M8 8c-2 0-3 1-3 3m11-3c2 0 3 1 3 3"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13c5 3 15 3 20 0m-12 0h4"/>',
  cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2H2Zm15-15a4 4 0 0 1 0 8m2 3c2 1 3 2.5 3 4"/>',
  spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  grid:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z"/>',
  tag:'<path d="M13 3H4a1 1 0 0 0-1 1v9l8.8 8.1a2 2 0 0 0 2.8 0l6.5-6.5a2 2 0 0 0 0-2.8L13 3Z"/><circle cx="8" cy="8" r="1.5"/>',
  paw:'<path d="M8 14c2-3 6-3 8 0 2 2 4 3 3 5-1 3-4 2-7 1-3 1-6 2-7-1-1-2 1-3 3-5Z"/><ellipse cx="4.8" cy="10.5" rx="1.6" ry="2.4"/><ellipse cx="9" cy="6.9" rx="1.6" ry="2.4"/><ellipse cx="15" cy="6.9" rx="1.6" ry="2.4"/><ellipse cx="19.2" cy="10.5" rx="1.6" ry="2.4"/>'
};
const icon=(name,size=27)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.spark}</svg>`;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[ch]));
const STORAGE_KEY='empyrios-apphub-v1';
function getSettings(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');return {favourites:normaliseFavourites(value.favourites,APPS),theme:['dark','light'].includes(value.theme)?value.theme:'dark'};}catch{return {favourites:[],theme:'dark'}}}
let settings=getSettings();let currentFilter='all';let query='';let currentCategory='all';
const $=q=>document.querySelector(q);
const announce=message=>{$('#announcer').textContent=message;};
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));}catch{announce('Preferences could not be saved on this device.')}}
function applyTheme(){document.documentElement.dataset.theme=settings.theme;$('#theme-toggle').innerHTML=settings.theme==='dark'?'☀':'☾';$('#theme-toggle').setAttribute('aria-label',settings.theme==='dark'?'Switch to light mode':'Switch to dark mode');document.querySelector('meta[name="theme-color"]').content=settings.theme==='dark'?'#0B0D16':'#F4F2EF';}
function toggleFavourite(id){if(!APPS.some(x=>x.id===id))return;const fav=new Set(settings.favourites);fav.has(id)?fav.delete(id):fav.add(id);settings.favourites=[...fav];save();render();announce(`${APPS.find(a=>a.id===id).name} ${fav.has(id)?'added to':'removed from'} favourites.`)}
function chipLabel(filter){return {all:'All apps',built:'Built',building:'In progress',planned:'Planned',favourites:'Favourites'}[filter];}
function renderFilters(){const counts=statusCounts(APPS);$('#filters').innerHTML=FILTERS.map(filter=>`<button type="button" class="filter ${filter===currentFilter?'selected':''}" data-filter="${filter}" aria-pressed="${filter===currentFilter}"><span>${chipLabel(filter)}</span>${filter==='all'?`<span class="filter-count">${counts.total}</span>`:filter==='favourites'?`<span class="filter-count">${settings.favourites.length}</span>`:`<span class="filter-count">${counts[filter]}</span>`}</button>`).join('');}
function renderStats(){const c=statusCounts(APPS);$('#stats').innerHTML=`<div class="stat"><strong>${String(c.total).padStart(2,'0')}</strong><span>Projects</span></div><div class="stat"><strong>${String(c.built).padStart(2,'0')}</strong><span>Built</span></div><div class="stat"><strong>${String(c.building).padStart(2,'0')}</strong><span>In progress</span></div>`;}
function appCard(app,index){
  const fav=settings.favourites.includes(app.id),safeName=escapeHtml(app.name),website=app.website?`<a class="card-open" href="${app.website}" target="_blank" rel="noopener noreferrer" aria-label="Try ${safeName} website (publication unverified)">Try website <span aria-hidden="true">↗</span></a>`:'<span class="card-coming">On the roadmap <span aria-hidden="true">↗</span></span>';
  const repository=app.repository?`<a class="source-link" href="${app.repository}" target="_blank" rel="noopener noreferrer" aria-label="View ${safeName} source code">Source code ↗</a>`:'';
  const statusText={built:'Code ready',building:'In progress',planned:'Planned'}[app.status];
  return `<article class="app-card" style="--accent:${app.accent};--i:${index}" aria-label="${safeName}">
  <div class="card-art" aria-hidden="true"><div class="art-orbit art-orbit-one"></div><div class="art-orbit art-orbit-two"></div><div class="art-glyph">${icon(app.icon,82)}</div><span class="art-corner">${String(app.priority).padStart(2,'0')}</span><span class="art-stamp">✳</span></div>
  <div class="card-content"><div class="card-meta"><span>${escapeHtml(app.category)}</span><span class="app-status ${app.status}"><span class="status-dot"></span>${statusText}</span></div><div class="card-title-row"><h3>${safeName}</h3><button type="button" class="favourite ${fav?'is-favourite':''}" data-fav="${app.id}" aria-label="${fav?'Remove':'Add'} ${safeName} ${fav?'from':'to'} favourites" aria-pressed="${fav}" title="${fav?'Remove from favourites':'Add to favourites'}">${fav?'♥':'♡'}</button></div><p class="card-description">${escapeHtml(app.description)}</p><div class="card-tags">${app.features.map(feature=>`<span>${escapeHtml(feature)}</span>`).join('')}</div><div class="card-footer">${website}${repository}</div>${app.note?`<div class="card-disclaimer">${escapeHtml(app.note)}</div>`:''}</div></article>`;
}
function render(){renderFilters();const visible=matchApps(APPS,{query,filter:currentFilter,category:currentCategory,favourites:settings.favourites});$('#cards').innerHTML=visible.map(appCard).join('');$('#counter').textContent=`${visible.length} / ${APPS.length} PROJECTS`;$('#empty-state').hidden=visible.length>0;}
function reset(){query='';currentCategory='all';currentFilter='all';$('#search').value='';$('#category').value='all';render();$('#search').focus();}
function init(){
  const categories=[...new Set(APPS.map(a=>a.category))].sort((a,b)=>a.localeCompare(b));
  const select=$('#category');for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=category;select.append(option);}
  $('#search').addEventListener('input',e=>{query=e.target.value;render()});
  select.addEventListener('change',e=>{currentCategory=e.target.value;render()});
  $('#filters').addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(b){currentFilter=b.dataset.filter;render();}});
  $('#cards').addEventListener('click',e=>{const b=e.target.closest('button[data-fav]');if(b)toggleFavourite(b.dataset.fav);});
  $('#reset').addEventListener('click',reset);
  $('#theme-toggle').addEventListener('click',()=>{settings.theme=settings.theme==='dark'?'light':'dark';save();applyTheme();});
  document.addEventListener('keydown',e=>{const active=document.activeElement;const editing=active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement||active instanceof HTMLSelectElement;if(e.key==='/'&&!editing&&!e.ctrlKey&&!e.metaKey){e.preventDefault();$('#search').focus();}if(e.key==='Escape'&&active===$('#search')){$('#search').blur();}});
  renderStats();applyTheme();render();
  if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
init();
