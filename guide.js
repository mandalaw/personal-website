'use strict';
(() => {
 const root=document.documentElement,dialog=document.getElementById('pocket-guide'),launch=document.getElementById('guide-launcher'),data=window.PortfolioData;
 if(!dialog||!launch||!data)return;
 const byId=new Map(data.guide.map(x=>[x.id,x])),answer=document.getElementById('guide-answer'),actions=document.getElementById('guide-actions'),primary=document.getElementById('guide-prompts'),more=document.getElementById('guide-all-prompts');
 let opener=null,topic=null,raf=0,hidden=false;
 const isOpen=()=>!dialog.hidden;
 const outside=[...document.querySelectorAll('header,main,footer,#guide-launcher')];
 const inertBefore=new Map();
 const backdrop=document.createElement('div');backdrop.className='guide-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 try{hidden=sessionStorage.getItem('mandalaw-guide-hidden')==='1'}catch{}
 root.dataset.guideReady='true';root.dataset.guideHidden=String(hidden);
 const safeLink=href=>/^(#[a-z][a-z0-9-]*|\/case-studies\/[a-z-]+\/|\/(?:resume|visuals)\/|mailto:dev@mandalawi\.ca(?:\?subject=Resume%20request)?|https:\/\/(?:trustai\.mandalawi\.ca\/|www\.linkedin\.com\/in\/devmandalaw|github\.com\/mandalaw))$/.test(href);
 const icons={best:'work',build:'web',ai:'model',fun:'terminal',resume:'resume',contact:'mail',trustai:'model',gdsc:'web',gis:'map',photo:'camera',study:'education',work:'work',othello:'board',break:'board',visuals:'video'};
 function glyph(name){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),use=document.createElementNS(ns,'use');svg.setAttribute('class','ui-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');use.setAttribute('href','#icon-'+name);svg.append(use);return svg}
 function questionButton(item){const b=document.createElement('button');b.type='button';b.textContent=item.q;b.prepend(glyph(icons[item.id]||'question'));b.dataset.guideTopic=item.id;b.addEventListener('click',()=>{show(item.id);answer.querySelector('h3').focus({preventScroll:true});dialog.scrollTop=0});return b}
 function prompts(ids=['best','build','ai','fun','resume','contact']){primary.replaceChildren(...ids.map(id=>byId.get(id)).filter(Boolean).map(questionButton));more.replaceChildren(...data.guide.filter(x=>!ids.includes(x.id)).map(questionButton))}
 function show(id){const item=byId.get(id);if(!item)return;topic=id;root.dataset.guideTopic=id;const h=document.createElement('h3'),p=document.createElement('p');h.textContent=item.q;h.tabIndex=-1;p.textContent=item.answer;answer.replaceChildren(h,p);actions.replaceChildren(...item.links.filter(([,href])=>safeLink(href)).map(([label,href])=>{const a=document.createElement('a');a.textContent=label+' ↗';a.href=href.startsWith('#')&&!window.SectionScroll?'/'+href:href;return a}));if(id==='break'){const b=document.createElement('button');b.type='button';b.dataset.gameOpen='reversi';b.textContent='Open the board';b.prepend(glyph('board'));actions.append(b)}}
 function home(){topic=null;root.dataset.guideTopic='home';answer.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p');h.textContent='A small tour, your way.';p.textContent='Pick a question. I’ll point you to the work.';answer.append(h,p);actions.replaceChildren()}
 function collision(){raf=0;window.LivingMascot?.layout()}
 function schedule(){if(!raf)raf=requestAnimationFrame(collision)}
 function context(){const item=data.contexts[root.dataset.scrollCurrent];if(item&&!isOpen()){document.getElementById('guide-context').textContent=item[0];launch.querySelector('.guide-launch-label').textContent=item[0]}schedule()}
 async function open(id,source){window.SitePanel?.close(false);opener=source||document.activeElement;hidden=false;root.dataset.guideHidden='false';try{sessionStorage.removeItem('mandalaw-guide-hidden')}catch{}
  // Settle an in-progress section through its own API before entering the guide panel.
  const S=window.SectionScroll,s=S?.snapshot();if(s&&['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(s.phase))await S.go(s.targetSectionIndex??s.currentSectionIndex,{instant:true,source:'guide-open',historyMode:'none'});
  if(id&&byId.has(id))show(id);else home();if(!isOpen()){outside.forEach(el=>{inertBefore.set(el,el.inert);el.inert=true});dialog.hidden=false;backdrop.hidden=false}root.dataset.guideOpen='true';document.getElementById('guide-close').focus({preventScroll:true});
 }
 function close(restore=true){dialog.hidden=true;backdrop.hidden=true;outside.forEach(el=>{if(inertBefore.has(el))el.inert=inertBefore.get(el)});inertBefore.clear();root.dataset.guideOpen='false';if(restore&&opener?.isConnected)opener.focus({preventScroll:true});schedule()}
 document.getElementById('guide-close').addEventListener('click',()=>close());
 backdrop.addEventListener('click',()=>close());
 
 document.getElementById('guide-hide').addEventListener('click',()=>{hidden=true;root.dataset.guideHidden='true';try{sessionStorage.setItem('mandalaw-guide-hidden','1')}catch{}close(false);const target=opener?.matches('button[data-guide-open]')?opener:document.querySelector('header a');target?.focus({preventScroll:true})});
 launch.addEventListener('click',()=>open(null,launch));
 document.addEventListener('click',e=>{const b=e.target.closest('button[data-guide-open]');if(b){e.preventDefault();open(b.dataset.guideOpen,b)}});
 actions.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(a.getAttribute('href').startsWith('#')&&window.SectionScroll){e.preventDefault();close(false);window.SectionScroll.route(a.hash,{source:'guide',focus:true})}else close(false)});
 // Focus stays inside the optional modal; these events must not reach sectional/deck handlers.
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...dialog.querySelectorAll('button,a[href],summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}e.stopPropagation()});
 dialog.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});dialog.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});dialog.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
 prompts();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('section-settled',context);document.addEventListener('deck-commit',schedule);addEventListener('load',context);
 window.PocketGuide=Object.freeze({open,close,show,prompts,snapshot:()=>({open:isOpen(),topic,hidden,visual:root.dataset.guideVisual})});
})();
