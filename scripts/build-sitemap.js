const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),site='https://toolhuben.com',lastmod=process.env.TOOLHUB_LASTMOD||new Date().toISOString().slice(0,10);
const sidebar=fs.readFileSync(path.join(root,'components','sidebar.html'),'utf8'),slugs=new Set([...sidebar.matchAll(/href="\/([^"/]+)\/?"/g)].map(match=>match[1]).filter(slug=>fs.existsSync(path.join(root,slug,'index.html'))));
let prior='';try{prior=execFileSync('git',['show','HEAD:sitemap.xml'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024})}catch(_){prior=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8')}
const order=[...prior.matchAll(/<loc>https:\/\/toolhuben\.com\/([^<\/]+)\/?<\/loc>/g)].map(match=>match[1]).filter(slug=>slugs.has(slug));for(const slug of slugs)if(!order.includes(slug))order.push(slug);
const alternate=(zh,en)=>`    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${zh}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`;
const entry=(url,links,priority='0.8')=>`  <url>\n    <loc>${url}</loc>\n${links}\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
const blocks=[];
for(const slug of ['', 'about','contact','privacy-policy','terms-of-service']){const suffix=slug?`/${slug}/`:'/',zh=`${site}${suffix}`,en=`${site}/en${suffix}`;blocks.push(entry(zh,alternate(zh,en),slug?'0.7':'1.0'),entry(en,alternate(zh,en),slug?'0.7':'1.0'))}
for(const slug of order){const zh=`${site}/${slug}/`,en=`${site}/en/${slug}/`;blocks.push(entry(zh,alternate(zh,en)),entry(en,alternate(zh,en)))}
const qualityZh=`${site}/quality/`,qualityEn=`${site}/en/quality/`;blocks.push(entry(qualityZh,alternate(qualityZh,qualityEn),'0.7'),entry(qualityEn,alternate(qualityZh,qualityEn),'0.7'));
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${blocks.join('\n')}\n</urlset>\n`;fs.writeFileSync(path.join(root,'sitemap.xml'),xml,'utf8');
console.log(`SITEMAP_TOOL_ORDER=${order.length}`);console.log(`SITEMAP_URLS=${blocks.length}`);console.log(`SITEMAP_LANGUAGE_PAIRS=${order.length+6}`);console.log('SITEMAP_NEWEST_PAGE=quality');
