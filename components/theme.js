(function(){
  'use strict';
  const version='20260824-1';
  if(window.ToolHubTheme?.version===version){window.ToolHubTheme.mount();return}

  const english=document.documentElement.lang.toLowerCase().startsWith('en');
  const catalog={
    midnight:{zh:'午夜黑',en:'Midnight',tone:'dark',swatch:['#0b1120','#38bdf8'],browser:'#0b1120'},
    ocean:{zh:'深海藍',en:'Deep Ocean',tone:'dark',swatch:['#061826','#22d3ee'],browser:'#061826'},
    violet:{zh:'紫羅蘭',en:'Violet',tone:'dark',swatch:['#160f28','#c084fc'],browser:'#160f28'},
    forest:{zh:'森林綠',en:'Forest',tone:'dark',swatch:['#071a16','#34d399'],browser:'#071a16'},
    light:{zh:'晨曦淺色',en:'Daylight',tone:'light',swatch:['#f8fafc','#0284c7'],browser:'#f8fafc'},
    sunset:{zh:'落日珊瑚',en:'Sunset Coral',tone:'dark',swatch:['#28120f','#fb7185'],browser:'#28120f'},
    rose:{zh:'玫瑰莓果',en:'Berry Rose',tone:'dark',swatch:['#260e1b','#f472b6'],browser:'#260e1b'},
    amber:{zh:'琥珀暖金',en:'Amber Gold',tone:'dark',swatch:['#21170a','#fbbf24'],browser:'#21170a'},
    graphite:{zh:'石墨灰',en:'Graphite',tone:'dark',swatch:['#0f1115','#e4e4e7'],browser:'#0f1115'},
    cyber:{zh:'賽博霓虹',en:'Cyber Neon',tone:'dark',swatch:['#03050c','#a3e635'],browser:'#03050c'},
    nord:{zh:'北境冰川',en:'Nordic Frost',tone:'dark',swatch:['#111827','#88c0d0'],browser:'#111827'},
    sakura:{zh:'櫻花柔粉',en:'Sakura',tone:'light',swatch:['#fff6f9','#db2777'],browser:'#fff6f9'},
    mint:{zh:'薄荷清新',en:'Fresh Mint',tone:'light',swatch:['#effcf7','#059669'],browser:'#effcf7'},
    lavender:{zh:'薰衣草霧',en:'Lavender Mist',tone:'light',swatch:['#f7f4ff','#7c3aed'],browser:'#f7f4ff'},
    sepia:{zh:'紙張米白',en:'Paper Sepia',tone:'light',swatch:['#f5efe3','#a16207'],browser:'#f5efe3'}
  };
  const labels=Object.fromEntries(Object.entries(catalog).map(([key,theme])=>[key,english?theme.en:theme.zh]));
  const switchTitle=english?'Change theme color':'切換主題顏色';
  const themeTitle=english?'Choose site theme':'選擇全站主題';
  const bindings=[];
  let fallbackHost=null;
  let saved='midnight';
  try{saved=localStorage.getItem('toolhub-theme')||'midnight'}catch(_){}
  if(!catalog[saved])saved='midnight';

  function ensureStyles(){
    let link=document.querySelector('link[href*="/components/theme.css"]');
    if(!link){link=document.createElement('link');link.rel='stylesheet';document.head.appendChild(link)}
    link.href=`/components/theme.css?v=${version}`;
    link.dataset.toolhubTheme='';
  }
  function applyTheme(theme,persist=false){
    if(!catalog[theme])theme='midnight';
    const root=document.documentElement;
    root.dataset.hubTheme=theme;
    root.dataset.hubTone=catalog[theme].tone;
    let meta=document.querySelector('meta[name="theme-color"]');
    if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta)}
    meta.content=catalog[theme].browser;
    if(persist)try{localStorage.setItem('toolhub-theme',theme)}catch(_){}
  }
  function optionsMarkup(){
    return Object.entries(catalog).map(([key,theme])=>`<button class="theme-option" data-theme="${key}" data-tone="${theme.tone}" role="radio"><span class="theme-swatch" style="--swatch-a:${theme.swatch[0]};--swatch-b:${theme.swatch[1]}"></span><span>${labels[key]}</span></button>`).join('');
  }
  function sync(){
    const active=document.documentElement.dataset.hubTheme;
    applyTheme(active,false);
    bindings.filter(binding=>binding.trigger.isConnected&&binding.menu.isConnected).forEach(({trigger,menu})=>{
      menu.querySelectorAll('[data-theme]').forEach(button=>{
        const selected=button.dataset.theme===active;
        button.classList.toggle('active',selected);
        button.setAttribute('aria-checked',String(selected));
      });
      const label=menu.querySelector('[data-theme-current],#theme-current-label');
      if(label)label.textContent=labels[active];
      trigger.dataset.theme=active;
    });
  }
  function close(binding,restoreFocus=false){
    binding.menu.hidden=true;
    binding.trigger.setAttribute('aria-expanded','false');
    if(restoreFocus)binding.trigger.focus();
  }
  function bind(trigger,menu){
    if(bindings.some(binding=>binding.trigger===trigger))return;
    const options=menu.querySelector('.theme-options');
    if(options){options.innerHTML=optionsMarkup();options.setAttribute('role','radiogroup');options.setAttribute('aria-label',themeTitle)}
    const binding={trigger,menu};bindings.push(binding);
    trigger.addEventListener('click',event=>{
      event.stopPropagation();
      const willOpen=menu.hidden;
      bindings.forEach(item=>{if(item!==binding)close(item)});
      menu.hidden=!willOpen;
      trigger.setAttribute('aria-expanded',String(willOpen));
      sync();
      if(willOpen)requestAnimationFrame(()=>menu.querySelector('.theme-option.active')?.focus());
    });
    menu.addEventListener('click',event=>{
      const button=event.target.closest('[data-theme]');
      if(!button||!catalog[button.dataset.theme])return;
      applyTheme(button.dataset.theme,true);
      sync();
      close(binding,true);
      window.dispatchEvent(new CustomEvent('toolhub-theme-change',{detail:{theme:button.dataset.theme,tone:catalog[button.dataset.theme].tone}}));
    });
    menu.addEventListener('keydown',event=>{
      if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key))return;
      const buttons=[...menu.querySelectorAll('.theme-option')],current=Math.max(0,buttons.indexOf(document.activeElement));
      let next=current+(event.key==='ArrowUp'||event.key==='ArrowLeft'?-1:1);
      if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;
      buttons[(next+buttons.length)%buttons.length]?.focus();event.preventDefault();
    });
  }
  function createFallback(){
    const host=document.createElement('div');host.className='theme-fallback-host';
    host.innerHTML=`<button id="theme-trigger-btn" class="theme-floating-btn" type="button" aria-expanded="false" aria-controls="theme-menu" title="${switchTitle}" aria-label="${switchTitle}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1 0 1.6-.7 1.6-1.7 0-.9-.8-1.4-.8-2.2 0-.9.7-1.7 1.7-1.7h2c3 0 5.5-2.5 5.5-5.5C22 6 17.5 2 12 2z"/></svg></button><div id="theme-menu" class="theme-menu standalone" hidden><div class="theme-menu-title"><span>${themeTitle}</span><span data-theme-current></span></div><div class="theme-options"></div></div>`;
    document.body.appendChild(host);fallbackHost=host;bind(host.querySelector('#theme-trigger-btn'),host.querySelector('#theme-menu'));
  }
  function mount(){
    const trigger=document.querySelector('#component-header #theme-trigger-btn,body>header #theme-trigger-btn');
    const menu=document.querySelector('#component-header #theme-menu,body>header #theme-menu');
    if(trigger&&menu){if(fallbackHost){fallbackHost.remove();fallbackHost=null}bind(trigger,menu)}
    else if(!fallbackHost&&!document.getElementById('theme-trigger-btn'))createFallback();
    else if(!fallbackHost){const existingTrigger=document.getElementById('theme-trigger-btn'),existingMenu=document.getElementById('theme-menu');if(existingTrigger&&existingMenu)bind(existingTrigger,existingMenu)}
    sync();
  }

  applyTheme(saved,false);
  ensureStyles();
  document.addEventListener('click',event=>bindings.forEach(binding=>{if(binding.menu.isConnected&&!binding.menu.hidden&&!binding.menu.contains(event.target)&&event.target!==binding.trigger)close(binding)}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')bindings.forEach(binding=>{if(!binding.menu.hidden)close(binding,true)})});
  window.ToolHubTheme={version,catalog,apply:theme=>{applyTheme(theme,true);sync()},sync,mount};
  mount();
})();
