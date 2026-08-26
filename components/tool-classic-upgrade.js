(() => {
  'use strict';

  const layoutIcons={
    aurora:'sparkles',
    split:'panels-top-left',
    blueprint:'drafting-compass',
    terminal:'terminal-square',
    glass:'gem',
    editorial:'scan-text',
    neon:'zap',
    compact:'layout-dashboard'
  };

  function directChildOf(element,parent){
    let current=element;
    while(current&&current.parentElement!==parent)current=current.parentElement;
    return current&&current.parentElement===parent?current:null;
  }

  function syncOriginalAccent(body,heading,kicker){
    const gradientTarget=heading.querySelector('[class*="bg-gradient"],[class*="from-"]');
    const gradient=gradientTarget?getComputedStyle(gradientTarget).backgroundImage:'';
    let match=gradient.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i);
    if(!match&&kicker){
      const color=getComputedStyle(kicker).color;
      match=color.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i);
    }
    if(!match)return;
    const values=match.slice(1,4).map(Number);
    if(values.every(value=>value>235)||values.every(value=>value<25))return;
    body.style.setProperty('--classic-accent',`rgb(${values.join(',')})`);
    body.style.setProperty('--classic-accent-rgb',values.join(','));
  }

  function enhance(){
    const body=document.body,main=document.querySelector('main');
    if(!body?.hasAttribute('data-classic-tool')||!main)return;
    main.classList.add('classic-main');

    const heading=main.querySelector('h1')||[...main.querySelectorAll('h2')].find(element=>!element.closest('.seo,.seo-upgrade'));
    if(heading){
      const hero=heading.matches('h2')?(directChildOf(heading,main)||heading.parentElement):(heading.closest('header.hero')||heading.parentElement);
      hero?.classList.add('classic-hero');
      heading.classList.add('classic-hero-title');
      const children=hero?[...hero.children]:[];
      const headingIndex=children.indexOf(heading);
      const kicker=children.slice(0,headingIndex).reverse().find(el=>el.matches('div,span'));
      kicker?.classList.add('classic-hero-kicker');
      syncOriginalAccent(body,heading,kicker);
      const lead=children.slice(headingIndex+1).find(el=>el.matches('p'))||hero?.querySelector('p');
      lead?.classList.add('classic-hero-lead');
      if(hero&&!hero.querySelector('.classic-hero-mark')){
        const layout=body.dataset.classicLayout||'aurora',mark=document.createElement('div');
        mark.className='classic-hero-mark';mark.setAttribute('aria-hidden','true');
        mark.innerHTML=`<i data-lucide="${layoutIcons[layout]||'sparkles'}"></i><span></span>`;
        hero.appendChild(mark);
      }

      const heroBlock=directChildOf(hero,main);
      let sibling=heroBlock?.nextElementSibling;
      while(sibling&&!sibling.matches('.seo,.seo-upgrade,article')){
        if(sibling.matches('.tool-grid')||sibling.querySelector('input,textarea,select,button,canvas,[contenteditable="true"]')){
          sibling.classList.add('classic-workspace');
          break;
        }
        sibling=sibling.nextElementSibling;
      }
    }

    main.querySelectorAll('.tool-grid').forEach(el=>el.classList.add('classic-workspace'));
    main.querySelectorAll('.seo,.seo-upgrade').forEach(el=>el.classList.add('classic-seo'));

    const directPanels='.panel,.glass-panel,.seo-upgrade-card,.daw-panel';
    main.querySelectorAll(directPanels).forEach(el=>el.classList.add('classic-card','tool-visual-surface'));
    main.querySelectorAll('section,article,aside,div').forEach(el=>{
      if(el.closest('.classic-hero')||el.classList.contains('classic-card'))return;
      const cls=el.getAttribute('class')||'';
      const looksLikeCard=/(?:rounded-(?:xl|2xl|3xl)|glass-panel)/.test(cls)&&/(?:border|shadow|bg-hub|bg-slate|bg-\[)/.test(cls);
      const hasContent=!!el.querySelector(':scope > h2,:scope > h3,input,textarea,select,canvas,pre');
      if(looksLikeCard&&hasContent)el.classList.add('classic-card','tool-visual-surface');
    });

    if(window.lucide)window.lucide.createIcons();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);
  else enhance();
})();
