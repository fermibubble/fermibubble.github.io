import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { writingPath } from '../src/paths.mjs';
const origin = 'https://oddly.fyi';
const revised = '2026-10-19';
const esc = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const decode = text => text.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n,16))).replaceAll('&nbsp;',' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&middot;','·');
const plain = text => decode(text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/g,' ').replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
async function filesAt(path) {
  const result=[];
  for (const entry of await readdir(path,{withFileTypes:true})) {
    if (entry.isDirectory()) result.push(...await filesAt(join(path,entry.name)));
    else if(entry.name.endsWith('.html')) result.push(join(path,entry.name));
  }
  return result;
}
export async function enhancePublication(out, articles, collections) {
  const items = new Map(articles.map(item => [writingPath(item),item]));
  const oldIndex = JSON.parse(await readFile(join(out,'search-index.json'),'utf8'));
  const indexed = new Map(oldIndex.map(entry => [entry.url,entry]));
  const pages=[], minutes=new Map();
  for(const file of await filesAt(out)) {
    let html=await readFile(file,'utf8');
    if (/<meta http-equiv="refresh"/.test(html)) continue;
    const path='/' + file.slice(out.length+1).replace(/index\.html$/,'');
    if(path==='/404.html') continue;
    const item=items.get(path), legacy=/^\/anti-patterns\/[^/]+\/$/.test(path);
    const article=Boolean(item&&!item.seriesOverview || legacy);
    const title=plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || html.match(/<title>(.*?)<\/title>/)?.[1] || 'Oddly');
    const description=decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1]||'');
    // Heading IDs are stable, unique, and provide linkable search destinations.
    const used=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
    html=html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,(whole,level,attrs,body)=>{
      if(/\bid=/.test(attrs)) return whole;
      const base=plain(body).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section';
      let id=base, suffix=2; while(used.has(id)) id=`${base}-${suffix++}`; used.add(id);
      return `<h${level}${attrs} id="${id}">${body}</h${level}>`;
    });
    const body=(html.match(/data-article-body[^>]*>([\s\S]*?)<\/article>/)?.[1] || html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || '')
      .replace(/<details class="series-directory"[\s\S]*?<\/details>/g,'')
      .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g,'');
    const text=plain(body.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g,''));
    const readTime=Math.max(1,Math.ceil(text.split(/\s+/).length/200)); minutes.set(path,readTime);
    const headings=[...body.matchAll(/<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)];
    const sections=headings.map((m,i)=>({id:m[2],title:plain(m[3]).replace(/#$/,''),text:plain(body.slice(m.index+m[0].length,headings[i+1]?.index ?? body.length))}));
    if(article && headings.length>=3 && !html.includes('class="article-toc')) {
      const toc=`<details class="article-toc shell-narrow"><summary>On this page · ${readTime} min read</summary><ol>${sections.filter((_,i)=>headings[i][1]==='2').map(s=>`<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ol></details>`;
      const rule='<div class="article-rule shell"></div>';
      if(html.includes(rule)) html=html.replace(rule,rule+toc);
      else html=html.replace(/(<nav class="archive-topics[\s\S]*?<\/nav>)/,`$1${toc}`);
    }
    if(article) {
      html=html.replace(/(<div class="article-meta">[\s\S]*?<span>)\d+ min read/,`$1${readTime} min read`);
      if(item) html=html.replace(/(<p class="article-byline">[\s\S]*?<\/p>)/,`$1<p class="revision-note">Updated <time datetime="${revised}">October 19, 2026</time> · <a href="/changes/">Revision notes</a></p>`);
      html=html.replace('</article>','<aside class="follow-strip shell-narrow" aria-label="Continue reading">Find your next question in <a href="/start/">the reading paths</a>, try <a href="/toolkit/">the runnable examples</a>, or <a href="/follow/">follow new writing via RSS</a>.</aside></article>');
    }
    html=html.replace(/<pre(?![^>]*tabindex)([^>]*)>/g,'<pre$1 tabindex="0" aria-label="Code example; scroll horizontally if needed">');
    const image='/assets/social/'+(path==='/'?'home':path.replace(/^\/|\/$/g,'').replaceAll('/','--'))+'.png';
    const schema={ '@context':'https://schema.org', '@type':article?'Article':item?.seriesOverview?'CollectionPage':'WebPage', headline:title, description,url:origin+path, image:origin+image, inLanguage:'en', author:{'@type':'Person',name:'Chaitanya Meesala',url:origin+'/about/'}, ...(article?{dateModified:revised,...(item?{datePublished:item.publishedAt||item.date}:{}),mainEntityOfPage:origin+path}:{}) };
    html=html.replace('</head>',`<meta property="og:image" content="${origin+image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(title)} — Oddly"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head>`);
    pages.push({file,path,html,title,image});
    if(article || item || ['/start/','/toolkit/','/follow/','/changes/','/projects/','/ideas/','/about/'].includes(path)) {
      const entry=indexed.get(path)||{type:legacy?'Earlier article':'Page',title,description,url:path};
      indexed.set(path,{...entry,title,text:headings.length ? plain(body.slice(0,headings[0].index)) : text,sections,keywords:path.includes('eval')?'evaluation eval evals':path.includes('provenance')?'sources grounding':path.includes('ownership')?'compare and swap CAS':''});
    }
  }
  // Collection estimates include chapters, not the one-minute overview.
  const totals=Object.values(collections).map(c=>({path:writingPath(c.overview),total:c.essays.reduce((n,item)=>n+(minutes.get(writingPath(item))||0),0)}));
  for(const page of pages) {
    for(const collection of totals) {
      if(page.path===collection.path) page.html=page.html.replace(/\d+ min · complete collection/g,`${collection.total} min · complete collection`);
      // Cards/rows each contain the canonical collection URL and one read-time label.
      page.html=page.html.replace(/<(article|a)\b[^>]*class="(?:feature-card[^"\n]*|note-row|archive-item)"[\s\S]*?<\/\1>/g,block=>block.includes(`href="${collection.path}"`)?block.replace(/\d+ min (collection|· complete collection)/g,`${collection.total} min $1`):block);
    }
    page.html=page.html.replace(/<(article|a)\b[^>]*class="(?:feature-card[^"\n]*|note-row|archive-item|series-map-card)"[\s\S]*?<\/\1>/g, block => {
      const target = block.match(/href="([^"#]+)"/)?.[1];
      if (!target || totals.some(c=>c.path===target)) return block;
      const time=minutes.get(target);
      return time ? block.replace(/\d+ min(?! · complete collection)/g, `${time} min`) : block;
    });
    await writeFile(page.file,page.html);
  }
  await writeFile(join(out,'search-index.json'),JSON.stringify([...indexed.values()])+'\n');
  await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${origin+p.path}</loc></url>`).join('')}</urlset>`);
  await writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://oddly.fyi/sitemap.xml\n');
}
