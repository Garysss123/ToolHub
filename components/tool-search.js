(function(){
  'use strict';
  if(window.ToolHubSearch?.initialized)return;
  const overlay=document.getElementById('tool-search-overlay');
  const dialog=document.getElementById('tool-search-dialog');
  const trigger=document.getElementById('tool-search-trigger');
  const closeButton=document.getElementById('tool-search-close');
  const input=document.getElementById('tool-search-input');
  const results=document.getElementById('tool-search-results');
  const status=document.getElementById('tool-search-status');
  const total=document.getElementById('tool-search-total');
  if(!overlay||!dialog||!trigger||!closeButton||!input||!results)return;

  if(!document.querySelector('link[data-toolhub-search]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/components/tool-search.css?v=20260821-1';
    link.dataset.toolhubSearch='';
    document.head.appendChild(link);
  }

  const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('zh-TW').replace(/[\s_./\\-]+/g,' ').trim();
  const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const i18n=window.ToolHubI18n;
  const isEnglish=document.documentElement.lang.toLowerCase().startsWith('en');
  const tr=value=>i18n?.locale==='en'?i18n.t(value):value;
  let tools=[],visible=[],activeIndex=0,lastFocus=null,sidebarObserver=null;

  function collectTools(){
    const sidebar=document.getElementById('sidebar-container');
    if(!sidebar)return false;
    const seen=new Set(),items=[];
    sidebar.querySelectorAll('a.nav-item[href]').forEach(link=>{
      let href=(link.getAttribute('href')||'').replace(/\/index\.html$/,'').replace(/\/$/,'')||'/';
      if(href==='/'||href==='/en'||seen.has(href))return;
      const originalName=(link.querySelector('span')?.textContent||link.textContent||'').replace(/\s+/g,' ').trim();
      if(!originalName)return;
      const group=link.closest('.nav-group');
      const originalCategory=(group?.querySelector('.toggle-btn span')?.textContent||'其他工具').replace(/\s+/g,' ').trim();
      const slug=decodeURIComponent(href.split('/').filter(Boolean).pop()||'');
      const name=tr(originalName),category=tr(originalCategory);
      if(isEnglish&&!href.startsWith('/en/'))href=`/en${href==='/'?'':href}${href.endsWith('/')?'':'/'}`;
      seen.add(href);
      items.push({name,category,href,slug,haystack:normalize(`${name} ${category} ${originalName} ${originalCategory} ${slug}`)});
    });
    tools=items;
    total.textContent=isEnglish?`${tools.length} tools`:`共 ${tools.length} 個工具`;
    if(!overlay.hidden)search(input.value);
    return tools.length>0;
  }

  function scoreTool(tool,query,tokens){
    const name=normalize(tool.name),category=normalize(tool.category),slug=normalize(tool.slug);
    if(!tokens.every(token=>tool.haystack.includes(token)))return -1;
    let score=0;
    if(name===query)score+=1000;
    else if(name.startsWith(query))score+=650;
    else if(name.includes(query))score+=420;
    if(slug===query)score+=700;
    else if(slug.startsWith(query))score+=340;
    else if(slug.includes(query))score+=220;
    if(category===query)score+=260;
    else if(category.includes(query))score+=140;
    tokens.forEach(token=>{if(name.startsWith(token))score+=80;else if(name.includes(token))score+=45;if(slug.includes(token))score+=25});
    return score;
  }

  function resultMarkup(tool,index){
    return `<a class="tool-search-result${index===activeIndex?' active':''}" href="${escapeHtml(tool.href)}" role="option" aria-selected="${index===activeIndex}" data-result-index="${index}"><span class="tool-search-result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg></span><span class="tool-search-result-copy"><strong>${escapeHtml(tool.name)}</strong><small>${escapeHtml(tool.category)}<i>・</i>${escapeHtml(tool.href)}</small></span><svg class="tool-search-result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>`;
  }

  function render(){
    if(!visible.length){
      results.innerHTML=isEnglish
        ?`<div class="tool-search-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8.5 11h5"/></svg><strong>No matching tools</strong><span>Try a shorter name, acronym, or category such as “JSON”, “image”, or “SEO”.</span></div>`
        :`<div class="tool-search-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8.5 11h5"/></svg><strong>找不到符合的工具</strong><span>試試較短的名稱、英文縮寫或分類，例如「JSON」、「圖片」、「SEO」。</span></div>`;
      return;
    }
    results.innerHTML=visible.map(resultMarkup).join('');
  }

  function search(raw){
    const query=normalize(raw),tokens=query.split(' ').filter(Boolean);
    if(!tools.length)collectTools();
    if(!query){
      visible=tools.slice(0,10);
      activeIndex=0;
      status.textContent=tools.length?(isEnglish?`Search ${tools.length} tools`:`輸入關鍵字搜尋 ${tools.length} 個工具`):(isEnglish?'Building the tool index…':'正在建立工具索引…');
      render();
      return;
    }
    const matches=tools.map(tool=>({tool,score:scoreTool(tool,query,tokens)})).filter(item=>item.score>=0).sort((a,b)=>b.score-a.score||a.tool.name.localeCompare(b.tool.name,'zh-TW'));
    visible=matches.slice(0,12).map(item=>item.tool);
    activeIndex=0;
    status.textContent=matches.length
      ?(isEnglish?`${matches.length} results${matches.length>12?' · showing the first 12':''}`:`找到 ${matches.length} 個符合結果${matches.length>12?'，顯示前 12 個':''}`)
      :(isEnglish?`No results for “${raw.trim()}”`:`找不到「${raw.trim()}」`);
    render();
  }

  function setActive(next){
    if(!visible.length)return;
    activeIndex=(next+visible.length)%visible.length;
    results.querySelectorAll('[data-result-index]').forEach((item,index)=>{
      const active=index===activeIndex;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',String(active));
      if(active)item.scrollIntoView({block:'nearest'});
    });
  }

  function openSearch(prefill=''){
    if(!collectTools()){
      const host=document.getElementById('component-sidebar');
      if(host&&!sidebarObserver){sidebarObserver=new MutationObserver(()=>{if(collectTools()){sidebarObserver.disconnect();sidebarObserver=null}});sidebarObserver.observe(host,{childList:true,subtree:true})}
    }
    lastFocus=document.activeElement;
    overlay.hidden=false;
    document.documentElement.classList.add('tool-search-open');
    trigger.setAttribute('aria-expanded','true');
    input.value=prefill;
    search(prefill);
    requestAnimationFrame(()=>input.focus());
  }

  function closeSearch(){
    if(overlay.hidden)return;
    overlay.hidden=true;
    document.documentElement.classList.remove('tool-search-open');
    trigger.setAttribute('aria-expanded','false');
    if(lastFocus&&document.contains(lastFocus))lastFocus.focus();
  }

  trigger.addEventListener('click',()=>openSearch());
  closeButton.addEventListener('click',closeSearch);
  overlay.addEventListener('mousedown',event=>{if(event.target===overlay)closeSearch()});
  input.addEventListener('input',()=>search(input.value));
  input.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'){event.preventDefault();setActive(activeIndex+1)}
    else if(event.key==='ArrowUp'){event.preventDefault();setActive(activeIndex-1)}
    else if(event.key==='Enter'&&visible[activeIndex]){event.preventDefault();location.href=visible[activeIndex].href}
  });
  results.addEventListener('mousemove',event=>{const item=event.target.closest('[data-result-index]');if(item)setActive(+item.dataset.resultIndex)});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!overlay.hidden){event.preventDefault();closeSearch();return}
    const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();overlay.hidden?openSearch():closeSearch()}
    else if(event.key==='/'&&!typing&&overlay.hidden){event.preventDefault();openSearch()}
  });
  dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button,input,a[href]')].filter(el=>!el.hidden&&el.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});

  const host=document.getElementById('component-sidebar');
  if(!collectTools()&&host){sidebarObserver=new MutationObserver(()=>{if(collectTools()){sidebarObserver.disconnect();sidebarObserver=null}});sidebarObserver.observe(host,{childList:true,subtree:true})}
  window.ToolHubSearch={initialized:true,open:openSearch,close:closeSearch,search,collect:collectTools};
})();
