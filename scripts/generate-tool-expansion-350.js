process.env.TOOLHUB_EXPANSION_BATCH='350';
require('./generate-tool-expansion-250');

const fs=require('fs');
const path=require('path');
const {tools}=require('./tool-expansion-350-data');
const root=path.resolve(__dirname,'..');
for(const tool of tools){
  const file=path.join(root,tool.slug,'index.html');
  let html=fs.readFileSync(file,'utf8');
  html=html.replaceAll(`https://toolhuben.com/${tool.slug}\"`,`https://toolhuben.com/${tool.slug}/\"`);
  fs.writeFileSync(file,html,'utf8');
}
const sidebarFile=path.join(root,'components','sidebar.html');
let sidebar=fs.readFileSync(sidebarFile,'utf8');
for(const tool of tools)sidebar=sidebar.replaceAll(`href="/${tool.slug}"`,`href="/${tool.slug}/"`);
fs.writeFileSync(sidebarFile,sidebar,'utf8');

const sitemapFile=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapFile,'utf8');
for(const tool of tools)sitemap=sitemap.replaceAll(`<loc>https://toolhuben.com/${tool.slug}</loc>`,`<loc>https://toolhuben.com/${tool.slug}/</loc>`);
fs.writeFileSync(sitemapFile,sitemap,'utf8');
