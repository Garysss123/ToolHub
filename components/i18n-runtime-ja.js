(function(){
  'use strict';
  if(window.ToolHubI18n?.initialized||!location.pathname.match(/^\/ja(?:\/|$)/))return;

  const dictionary=window.ToolHubI18nDictionary||{};
  const replacements=Object.entries(dictionary).filter(([key])=>key.length>=2).sort((a,b)=>b[0].length-a[0].length);
  const cjk=/[\u3400-\u9fff\uf900-\ufaff]/;
  const skipTags=new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','NOSCRIPT']);

  function translateText(value){
    if(!value||!cjk.test(value))return value;
    const leading=value.match(/^\s*/)?.[0]||'';
    const trailing=value.match(/\s*$/)?.[0]||'';
    const clean=value.trim().replace(/\s+/g,' ');
    if(/^\d+\s*行$/.test(clean))return leading+clean+trailing;
    if(/^共\s*\d+\s*筆資料$/.test(clean))return leading+clean.replace(/^共\s*(\d+)\s*筆資料$/,'$1 件')+trailing;
    if(/^-?\d+(?:\.\d+)?\s*分$/.test(clean))return leading+clean+trailing;
    if(dictionary[clean])return leading+dictionary[clean]+trailing;
    const prefixed=clean.match(/^([>$#]\s*)(.+)$/);
    if(prefixed&&dictionary[prefixed[2]])return leading+prefixed[1]+dictionary[prefixed[2]]+trailing;
    let output=clean;
    for(const [source,target] of replacements){if(output.includes(source))output=output.split(source).join(target)}
    return output!==clean?leading+output+trailing:value;
  }

  function localizePath(value){
    if(!value||value.startsWith('#')||/^(?:[a-z]+:|\/\/)/i.test(value))return value;
    if(value==='/en'||value==='/en/')return '/ja/';
    if(value.startsWith('/en/'))return '/ja/'+value.slice(4);
    if(value==='/ja'||value.startsWith('/ja/'))return value;
    if(value==='/mangalens-privacy'||value.startsWith('/mangalens-privacy/'))return value;
    if(!value.startsWith('/'))return value;
    return '/ja'+value;
  }

  function translateElement(element){
    if(!element||element.nodeType!==Node.ELEMENT_NODE)return;
    if(skipTags.has(element.tagName)||element.closest('[contenteditable="true"], [data-i18n-skip]'))return;
    for(const attr of ['title','placeholder','aria-label','alt']){
      const value=element.getAttribute(attr);if(value&&cjk.test(value))element.setAttribute(attr,translateText(value));
    }
    if(element.tagName==='A'){
      const href=element.getAttribute('href'),target=localizePath(href);if(target!==href)element.setAttribute('href',target);
    }
  }

  function translateRoot(root){
    if(!root)return;
    if(root.nodeType===Node.TEXT_NODE){
      const parent=root.parentElement;
      if(parent&&!skipTags.has(parent.tagName)&&!parent.closest('[contenteditable="true"], [data-i18n-skip]')){
        const next=translateText(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;
      }
      return;
    }
    if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
    if(root.nodeType===Node.ELEMENT_NODE)translateElement(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode()))node.nodeType===Node.ELEMENT_NODE?translateElement(node):translateRoot(node);
  }

  let scheduled=false;const translatedChrome=new WeakSet();
  function refresh(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;translateRoot(document.querySelector('main'));
      document.querySelectorAll('body>header,#component-header,#component-sidebar,#component-footer').forEach(element=>{
        if(!translatedChrome.has(element)&&cjk.test(element.textContent||'')){translateRoot(element);translatedChrome.add(element)}
      });
      document.querySelectorAll('#toast,#tool-toast,body>.toast,#tool-search-overlay').forEach(translateRoot);
    });
  }
  function refreshAfterInteraction(){setTimeout(refresh,0);setTimeout(refresh,160);setTimeout(refresh,700)}

  document.documentElement.lang='ja';translateRoot(document.querySelector('main'));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshAfterInteraction,{once:true});else refreshAfterInteraction();
  window.addEventListener('load',refreshAfterInteraction,{once:true});document.addEventListener('toolhub-ready',refreshAfterInteraction);
  for(const type of ['click','input','change','submit'])document.addEventListener(type,refreshAfterInteraction,true);
  let observedMain=null;
  function observeMain(){
    const main=document.querySelector('main');if(!main||main===observedMain)return;observedMain=main;let mutationTimer=0;
    new MutationObserver(()=>{clearTimeout(mutationTimer);mutationTimer=setTimeout(refresh,80)}).observe(main,{subtree:true,childList:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeMain,{once:true});else observeMain();
  window.ToolHubI18n={initialized:true,locale:'ja',t:translateText,localizePath,translateRoot,refresh};
})();
