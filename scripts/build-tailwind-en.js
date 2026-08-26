const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const match=html.match(/<script>\s*tailwind\.config\s*=\s*([\s\S]*?)\s*<\/script>/i);
if(!match)throw new Error('找不到首頁 Tailwind 設定');

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'toolhub-tailwind-en-'));
const config=path.join(temp,'tailwind.config.cjs');
const input=path.join(temp,'input.css');
const output=path.join(root,'components','tailwind-en.css');
const content=[
  path.join(root,'en','**','*.html'),
  path.join(root,'components','*.html'),
  path.join(root,'components','*.js')
];

fs.writeFileSync(config,`const base=${match[1]};\nbase.content=${JSON.stringify(content)};\nmodule.exports=base;\n`);
fs.writeFileSync(input,'@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
const npxCli=path.join(path.dirname(process.execPath),'node_modules','npm','bin','npx-cli.js');
const command=process.platform==='win32'?process.execPath:'npx';
const args=process.platform==='win32'?[npxCli]:[];
args.push('--yes','tailwindcss@3.4.17','-c',config,'-i',input,'-o',output,'--minify');
const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});
const resolved=path.resolve(temp),tempRoot=path.resolve(os.tmpdir());
if(resolved.startsWith(tempRoot+path.sep))fs.rmSync(resolved,{recursive:true,force:true});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status||1);
console.log(`TAILWIND_EN_BYTES=${fs.statSync(output).size}`);
