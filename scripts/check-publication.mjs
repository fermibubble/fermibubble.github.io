import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { searchEntries } from '../src/search.js';
import { articlePractice } from '../src/article-practice.mjs';
import { revisions } from '../src/legacy-revisions.mjs';
const dir=new URL('../dist/',import.meta.url).pathname;
const index=JSON.parse(await readFile(join(dir,'search-index.json'),'utf8'));
assert.equal(Object.keys(articlePractice).length,38,'Every current article has a practical extension');
assert.equal(Object.keys(revisions).length,8,'Every earlier article has a reviewed revision');
assert.equal(index.length,58);
assert.equal(new Set(index.map(e=>e.url)).size,index.length);
const queries=[['temperature scaling','confidence-must-earn-its-meaning'],['blockingqueue','busy-waiting'],['negative caching','negative-caching'],['paired bootstrap','make-the-winner-earn-release']];
for(const [query,slug] of queries){
 const found=searchEntries(index,query);assert(found.length&&found[0].url.includes(slug),query);assert(found[0].href.includes('#'),`${query}: section target missing`);
}
assert.equal(searchEntries(index,'a_word_that_does_not_exist').length,0);
assert.equal(searchEntries(index,'').length,0);
assert.equal(searchEntries(index,'<img onerror=alert(1)>').length,0);
assert(searchEntries(index,'CAS').some(e=>e.url.includes('state-requires-ownership')));
assert(searchEntries(index,'agent').length>8,'Full results must not be truncated by ranking');
let canonicalCount=0, articleCount=0;
async function walk(path){
 for(const e of await readdir(path,{withFileTypes:true})){
  const file=join(path,e.name);if(e.isDirectory()){await walk(file);continue;}if(!e.name.endsWith('.html'))continue;
  const html=await readFile(file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
  for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),`${file}: missing ${m[1]}`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: H1`);
  if(html.includes('http-equiv="refresh"')||e.name==='404.html')continue;
  canonicalCount++;
  assert(!html.includes('class="eval-chapter-nav"'),`${file}: redundant contents navigation`);
  for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:css|m?js))([^"']*)"/g)) assert(/^\?v=[a-f0-9]{16}$/.test(match[2]),`${file}: unversioned asset ${match[1]}`);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  await access(join(dir,schema.image.replace('https://oddly.fyi/','')));
  assert(schema.url===html.match(/<link rel="canonical" href="([^"]+)"/)[1]);
  if(schema['@type']==='Article'){articleCount++;assert.equal(schema.dateModified,'2026-10-19');assert(html.includes('revision-note'));}
  for(const m of html.matchAll(/<pre\b([^>]*)>/g))assert(m[1].includes('tabindex="0"'));
 }
}
await walk(dir);
assert.equal(canonicalCount,70);assert.equal(articleCount,46);
const sitemap=await readFile(join(dir,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,70);
const script=await readFile(join(dir,'assets/site.js'),'utf8');
const version=script.match(/search-index\.json\?v=([a-f0-9]{16})/)[1];
assert(script.includes(`./search.js?v=${version}`),'Search module and data must share a release version');
assert(!sitemap.includes('/404.html'));assert((await readFile(join(dir,'robots.txt'),'utf8')).includes('Sitemap: https://oddly.fyi/sitemap.xml'));
for(const entry of index){
 const html=await readFile(join(dir,entry.url,'index.html'),'utf8');
 for(const section of entry.sections)assert(html.includes(`id="${section.id}"`),`${entry.url}: stale search target`);
}
console.log(`Publication checks passed: ${canonicalCount} canonical pages, ${articleCount} articles, ${index.length} search entries; section targets, images, structured data, keyboard-scrollable code, full-text ranking.`);
