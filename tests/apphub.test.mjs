import test from 'node:test';
import assert from 'node:assert/strict';
import {APPS} from '../site/catalog.mjs';
import {validateCatalog,matchApps,normaliseFavourites,statusCounts,isSafeLink} from '../site/logic.mjs';

test('catalog validates and includes exactly 13 intentional apps',()=>{
 assert.equal(validateCatalog(APPS),true);
 assert.equal(APPS.length,13);
 assert.deepEqual(new Set(APPS.map(a=>a.id)).size,13);
 for(const app of ['dayforge','duoquest','jobpilot','tutorforge','studyforge','weavelab','wealthtrack','localai','coachdesk','lifeos','tripcraft','dealhunter','creaturelife'])assert.ok(APPS.find(x=>x.id===app),app);
});
test('status summary matches app data',()=>assert.deepEqual(statusCounts(APPS),{total:13,built:2,building:1,planned:10}));
test('search finds terms across descriptions and features',()=>{
 assert.deepEqual(matchApps(APPS,{query:'spaced repetition'}).map(a=>a.id),['studyforge']);
 assert.deepEqual(matchApps(APPS,{query:'VRAM'}).map(a=>a.id),['localai']);
 assert.deepEqual(matchApps(APPS,{query:'xyz-no-results'}),[]);
});
test('status and category filters intersect',()=>{
 assert.deepEqual(matchApps(APPS,{filter:'planned',category:'Education'}).map(a=>a.id),['tutorforge','studyforge','coachdesk']);
 assert.deepEqual(matchApps(APPS,{filter:'built'}).map(a=>a.id),['dayforge','duoquest']);
});
test('favourites are normalised and pinned first in all apps',()=>{
 assert.deepEqual(normaliseFavourites(['duoquest','duoquest','bogus','dayforge',34],APPS),['duoquest','dayforge']);
 assert.equal(matchApps(APPS,{favourites:['lifeos']})[0].id,'lifeos');
 assert.deepEqual(matchApps(APPS,{filter:'favourites',favourites:['lifeos']}).map(a=>a.id),['lifeos']);
});
test('rejects unsafe links and duplicate IDs',()=>{
 assert.equal(isSafeLink('javascript:alert(1)'),false);
 assert.equal(isSafeLink('http://example.com'),false);
 assert.equal(isSafeLink('https://github.com/Empyrios/apphub'),true);
 assert.throws(()=>validateCatalog([...APPS,APPS[0]]),/duplicate/);
 assert.throws(()=>validateCatalog([{...APPS[0],website:'javascript:alert(1)'}]),/Unsafe/);
 assert.throws(()=>validateCatalog([{...APPS[0],status:'planned'}]),/Unreleased/);
});
test('catalog public launch URLs are fully qualified https',()=>{
 for(const app of APPS)for(const key of ['website','repository'])if(app[key])assert.equal(new URL(app[key]).protocol,'https:');
});
