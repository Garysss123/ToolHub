(function(){
  'use strict';
  if(window.ToolHubLanguage?.initialized)return;
  const KEY='toolhub-language',PROMPT_KEY='toolhub-language-prompt-dismissed';
  const UNLOCALIZED=new Set(['/mangalens-privacy']);
  const current=location.pathname==='/en'||location.pathname.startsWith('/en/')?'en':'zh-Hant';
  const copy={
    'zh-Hant':{switchLabel:'English',switchTitle:'切換為英文',title:'選擇您的語言',body:'我們依照瀏覽器語系為您建議顯示語言。您之後可隨時在頁尾切換。',recommended:'建議',zh:'繁體中文',zhNote:'台灣與香港使用者',en:'English',enNote:'All other regions',later:'稍後再說'},
    en:{switchLabel:'Traditional Chinese',switchTitle:'Switch to Traditional Chinese',title:'Choose your language',body:'We recommend a language based on your browser settings. You can change it anytime in the footer.',recommended:'Recommended',zh:'Traditional Chinese',zhNote:'For Taiwan and Hong Kong',en:'English',enNote:'For all other regions',later:'Maybe later'}
  }[current];
  const preferred=(()=>{try{return localStorage.getItem(KEY)}catch(_){return null}})();
  const languages=navigator.languages?.length?navigator.languages:[navigator.language||''];
  const traditional=languages.some(value=>/^zh-(tw|hk)$/i.test(value)||/^zh-hant(?:-|$)/i.test(value));
  const suggested=traditional?'zh-Hant':'en';

  if(!document.querySelector('link[data-toolhub-language]')){
    const link=document.createElement('link');link.rel='stylesheet';link.href='/components/language.css?v=20260821-1';link.dataset.toolhubLanguage='';document.head.appendChild(link);
  }

  function targetFor(locale){
    const path=location.pathname.replace(/\/index\.html$/,'').replace(/\/+$/,'')||'/';
    if(locale==='en'){
      if(UNLOCALIZED.has(path))return '/en/'+(location.hash||'');
      const clean=path==='/en'||path.startsWith('/en/')?path:`/en${path==='/'?'':path}`;
      return (clean==='/'?'/':clean+'/')+(location.hash||'');
    }
    const clean=path==='/en'?'/':path.startsWith('/en/')?(path.slice(3)||'/'):path;
    return (clean==='/'?'/':clean+'/')+(location.hash||'');
  }
  function store(locale){try{localStorage.setItem(KEY,locale);localStorage.removeItem(PROMPT_KEY)}catch(_){}}
  function switchTo(locale){store(locale);const target=targetFor(locale);if(target!==location.pathname+location.hash)location.assign(target)}
  function syncButtons(root=document){root.querySelectorAll('[data-language-switch]').forEach(button=>{const label=button.querySelector('[data-language-switch-label]');if(label)label.textContent=copy.switchLabel;button.title=copy.switchTitle;button.setAttribute('aria-label',copy.switchTitle)})}
  function closePrompt(){const modal=document.getElementById('language-welcome');if(modal)modal.remove();document.documentElement.classList.remove('language-dialog-open')}
  function promptDismissed(){try{return sessionStorage.getItem(PROMPT_KEY)==='1'}catch(_){return false}}
  function dismiss(){try{sessionStorage.setItem(PROMPT_KEY,'1')}catch(_){}closePrompt()}
  function showPrompt(){
    if(preferred||promptDismissed()||document.getElementById('language-welcome'))return;
    const zhRecommended=suggested==='zh-Hant',enRecommended=suggested==='en';
    const host=document.createElement('div');host.id='language-welcome';host.className='language-welcome';
    host.innerHTML=`<section class="language-welcome-card" role="dialog" aria-modal="true" aria-labelledby="language-welcome-title"><button class="language-welcome-close" type="button" data-language-later aria-label="${current==='en'?'Close':'關閉'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button><div class="language-welcome-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg></div><span class="language-welcome-kicker">TOOLHUB LANGUAGE</span><h2 id="language-welcome-title">${copy.title}</h2><p>${copy.body}</p><div class="language-welcome-options"><button type="button" data-language-choice="zh-Hant" class="${zhRecommended?'recommended':''}">${zhRecommended?`<em>${copy.recommended}</em>`:''}<strong>${copy.zh}</strong><span>${copy.zhNote}</span></button><button type="button" data-language-choice="en" class="${enRecommended?'recommended':''}">${enRecommended?`<em>${copy.recommended}</em>`:''}<strong>${copy.en}</strong><span>${copy.enNote}</span></button></div><button type="button" class="language-welcome-later" data-language-later>${copy.later}</button></section>`;
    document.body.appendChild(host);document.documentElement.classList.add('language-dialog-open');
    host.querySelector(`[data-language-choice="${suggested}"]`)?.focus();
  }

  document.addEventListener('click',event=>{
    const switcher=event.target.closest('[data-language-switch]');if(switcher){event.preventDefault();switchTo(current==='en'?'zh-Hant':'en');return}
    const choice=event.target.closest('[data-language-choice]');if(choice){switchTo(choice.dataset.languageChoice);return}
    if(event.target.closest('[data-language-later]')||event.target.id==='language-welcome')dismiss();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('language-welcome'))dismiss()});
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)syncButtons(node)})));
  observer.observe(document.documentElement,{childList:true,subtree:true});syncButtons();
  // Never redirect a crawlable URL automatically. The stored preference only
  // suppresses the first-visit prompt; users change language explicitly.
  // English pages remain directly accessible while their copy is reviewed,
  // but the public Traditional Chinese site no longer interrupts first visits
  // or promotes an unfinished locale during AdSense quality review.
  window.ToolHubLanguage={initialized:true,current,suggested,switchTo,targetFor,showPrompt,closePrompt,syncButtons};
})();
