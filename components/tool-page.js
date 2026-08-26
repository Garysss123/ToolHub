(function(){
  'use strict';
  async function loadComponent(id,path){
    const host=document.getElementById(id); if(!host)return;
    try{const response=await fetch(path);if(!response.ok)throw new Error(String(response.status));host.innerHTML=await response.text();host.querySelectorAll('script').forEach(old=>{const script=document.createElement('script');[...old.attributes].forEach(a=>script.setAttribute(a.name,a.value));script.textContent=old.textContent;old.replaceWith(script)});}catch(error){console.warn('共用元件載入失敗：',path,error)}
  }
  function toast(message){let el=document.getElementById('tool-toast');if(!el){el=document.createElement('div');el.id='tool-toast';el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800)}
  async function copy(text,message='已複製到剪貼簿'){try{await navigator.clipboard.writeText(text);toast(message)}catch(_){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast(message)}}
  function download(name,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function cryptoFloat(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}
  document.addEventListener('DOMContentLoaded',async()=>{const suffix=document.documentElement.lang.toLowerCase().startsWith('en')?'-en':'';await Promise.all([loadComponent('component-header',`/components/header${suffix}.html`),loadComponent('component-sidebar',`/components/sidebar${suffix}.html?v=20260821-5`),loadComponent('component-footer',`/components/footer${suffix}.html`)]);if(window.lucide)lucide.createIcons();document.dispatchEvent(new Event('toolhub-ready'))});
  window.ToolHub={toast,copy,download,escapeHtml,cryptoFloat};
})();
