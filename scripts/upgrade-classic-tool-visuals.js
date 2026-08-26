const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const layouts=['aurora','split','blueprint','terminal','glass','editorial','neon','compact'];
const fallbackAccent='#38BDF8';

function homeToolSlugs(){
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  return [...new Set([...html.matchAll(/href="\/([a-z0-9-]+)(?:\/index\.html)?"/g)].map(match=>match[1]))];
}

function pickAccent(html){
  const config=html.match(/tailwind\.config\s*=\s*\{[\s\S]*?<\/script>/i)?.[0]||'';
  const primary=config.match(/\bprimary\s*:\s*['"](#[0-9a-f]{6})['"]/i)?.[1];
  const accent=config.match(/\baccent\s*:\s*['"](#[0-9a-f]{6})['"]/i)?.[1];
  const named=config.match(/\b(?:brand|au|palette|contrast|randcolor|mixer|favicon|aspect|spin|robot|meta|robots|manifest|grid|flexbox|md|hm|jy|yj|jc|cj|xj|jx|slug)\s*:\s*['"](#[0-9a-f]{6})['"]/i)?.[1];
  const defaultColor=config.match(/\bDEFAULT\s*:\s*['"](#[0-9a-f]{6})['"]/i)?.[1];
  if(primary)return primary;
  if(accent&&!/^#38bdf8$/i.test(accent))return accent;
  return named||defaultColor||accent||fallbackAccent;
}

function rgb(hex){
  const value=hex.replace('#','');
  return [0,2,4].map(index=>parseInt(value.slice(index,index+2),16)).join(',');
}

function upgradeBody(html,layout,accent){
  return html.replace(/<body\b([^>]*)>/i,(full,rawAttributes)=>{
    let attributes=rawAttributes
      .replace(/\sdata-tool-visual(?:="[^"]*")?/gi,'')
      .replace(/\sdata-classic-tool(?:="[^"]*")?/gi,'')
      .replace(/\sdata-classic-layout="[^"]*"/gi,'');
    const styleMatch=attributes.match(/\sstyle="([^"]*)"/i);
    const additions=`--classic-accent:${accent};--classic-accent-rgb:${rgb(accent)}`;
    if(styleMatch){
      const preserved=styleMatch[1].replace(/--classic-accent(?:-rgb)?\s*:[^;]+;?/gi,'').trim();
      attributes=attributes.replace(styleMatch[0],` style="${preserved}${preserved&&!preserved.endsWith(';')?';':''}${additions}"`);
    }else attributes+=` style="${additions}"`;
    return `<body${attributes} data-tool-visual data-classic-tool data-classic-layout="${layout}">`;
  });
}

function upgradePage(slug,index){
  const file=path.join(root,slug,'index.html');
  if(!fs.existsSync(file))return {slug,status:'missing'};
  const original=fs.readFileSync(file,'utf8');
  if(original.includes('data-expansion-tool'))return {slug,status:'expansion'};
  const existingLayout=original.match(/data-classic-layout="([^"]+)"/)?.[1];
  const layout=layouts.includes(existingLayout)?existingLayout:layouts[index%layouts.length];
  const accent=pickAccent(original);
  let html=original
    .replace(/<link rel="stylesheet" href="\/components\/tool-visual-core\.css">/g,'')
    .replace(/<link rel="stylesheet" href="\/components\/tool-classic-upgrade\.css">/g,'')
    .replace(/<script src="\/components\/tool-classic-upgrade\.js"><\/script>/g,'');
  html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="/components/tool-visual-core.css"><link rel="stylesheet" href="/components/tool-classic-upgrade.css"></head>');
  html=upgradeBody(html,layout,accent);
  const closingBody=html.toLowerCase().lastIndexOf('</body>');
  if(closingBody<0)throw new Error(`${slug} 缺少 </body>`);
  html=`${html.slice(0,closingBody)}<script src="/components/tool-classic-upgrade.js"></script>${html.slice(closingBody)}`;
  if(html!==original)fs.writeFileSync(file,html,'utf8');
  return {slug,status:html===original?'unchanged':'updated',layout,accent};
}

const results=homeToolSlugs().map(upgradePage);
const upgraded=results.filter(item=>item.status!=='expansion'&&item.status!=='missing');
const counts=Object.fromEntries(layouts.map(layout=>[layout,upgraded.filter(item=>item.layout===layout).length]));
console.log(`CLASSIC_TOOLS=${upgraded.length}`);
console.log(`EXPANSION_SKIPPED=${results.filter(item=>item.status==='expansion').length}`);
console.log(`MISSING=${results.filter(item=>item.status==='missing').length}`);
console.log(`UPDATED=${upgraded.filter(item=>item.status==='updated').length}`);
console.log(`LAYOUTS=${JSON.stringify(counts)}`);
