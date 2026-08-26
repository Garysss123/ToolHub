const fs=require('fs');
const path=require('path');
const batch200=require('./tool-expansion-200-data').tools;
const batch250=require('./tool-expansion-250-data').tools;
const batch300=require('./tool-expansion-300-data').tools;
const root=path.resolve(__dirname,'..');

global.window={};
global.document={addEventListener(){}};
require('../components/tool-expansion-200.js');
require('../components/tool-expansion-250.js');
require('../components/tool-expansion-300.js');
require('../components/tool-expansion.js');

const profiles=window.ToolHubWorkspaceProfiles;
const expected=[...batch200,...batch250,...batch300].map(tool=>tool.slug);
const assigned=Object.values(profiles.groups).flat();
const errors=[];
if(Object.keys(profiles.groups).length!==15)errors.push(`工作區類型應為 15，實際 ${Object.keys(profiles.groups).length}`);
if(assigned.length!==150)errors.push(`工作區配置應為 150，實際 ${assigned.length}`);
if(new Set(assigned).size!==150)errors.push('工作區配置含重複工具');
for(const slug of expected){
  if(!profiles.bySlug[slug])errors.push(`${slug} 未配置工作區`);
  const html=fs.readFileSync(path.join(root,slug,'index.html'),'utf8');
  if((html.match(/\/components\/tool-expansion\.js\?v=20260823-experiences-2/g)||[]).length!==1)errors.push(`${slug} 未使用目前用途型介面腳本，或重複載入`);
  if(!html.includes('/components/tool-expansion.css?v=20260821-compositions-3'))errors.push(`${slug} 未使用新版獨立構圖樣式`);
}
for(const slug of assigned)if(!expected.includes(slug))errors.push(`${slug} 不屬於後 150 個工具`);
const counts=Object.fromEntries(Object.entries(profiles.groups).map(([name,slugs])=>[name,slugs.length]));
const compositions=Object.fromEntries([...batch200,...batch250,...batch300].reduce((map,tool)=>map.set(tool.layout,(map.get(tool.layout)||0)+1),new Map()));
if(Object.keys(compositions).length!==8)errors.push(`獨立構圖應為 8，實際 ${Object.keys(compositions).length}`);
if(errors.length){console.error(`WORKSPACE_AUDIT_FAILED=${errors.length}`);errors.forEach(error=>console.error(`- ${error}`));process.exit(1)}
console.log('WORKSPACE_AUDIT_OK');
console.log(`WORKSPACE_TYPES=${Object.keys(counts).length}`);
console.log(`WORKSPACE_TOOLS=${assigned.length}`);
console.log(`WORKSPACE_COUNTS=${JSON.stringify(counts)}`);
console.log(`COMPOSITION_COUNTS=${JSON.stringify(compositions)}`);
