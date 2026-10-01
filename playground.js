'use strict';
(() => {
 const root=document.documentElement,panel=document.getElementById('scene-panel'),content=document.getElementById('scene-content');if(!panel)return;
 let opener=null,dispose=null,version=0;const prior=new Map(),outside=[...document.querySelectorAll('header,main,footer,#guide-launcher')];
 const backdrop=document.createElement('div');backdrop.className='scene-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 function close(restore=true){version++;dispose?.();dispose=null;panel.hidden=true;backdrop.hidden=true;prior.forEach((v,e)=>e.inert=v);prior.clear();root.dataset.sceneOpen='false';if(restore){const visible=opener?.isConnected&&opener.getClientRects().length&&!opener.closest('[hidden]')&&getComputedStyle(opener).visibility!=='hidden';(visible?opener:document.querySelector('header .logo'))?.focus({preventScroll:true})}}
 async function show(title,kicker,body,source,kind='detail'){
  if(!panel.hidden)close(false);window.PocketGuide?.close(false);opener=source||document.activeElement;
  const S=window.SectionScroll,s=S?.snapshot();if(s&&['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(s.phase))await S.go(s.targetSectionIndex??s.currentSectionIndex,{instant:true,source:'detail-open',historyMode:'none'});
  document.getElementById('scene-title').textContent=title;document.getElementById('scene-kicker').textContent=kicker;content.replaceChildren(body);panel.dataset.scene=kind;
  outside.forEach(el=>{prior.set(el,el.inert);el.inert=true});panel.hidden=false;backdrop.hidden=false;root.dataset.sceneOpen='true';panel.scrollTop=0;document.getElementById('scene-close').focus({preventScroll:true});return ++version;
 }
 async function identity(source){const t=document.getElementById('identity-content');if(t)await show('Behind Dev mandalaw','Found the human',t.content.cloneNode(true),source)}
 async function project(key,source){const t=document.getElementById('detail-'+key);if(t)await show(document.querySelector('[data-project="'+key+'"] h3').textContent,'Inside this project',t.content.cloneNode(true),source)}
 async function game(kind='reversi',source){const loading=document.createElement('p');loading.textContent='Opening the board…';const token=await show(kind==='signal'?'A little signal path.':'Your move.','New browser experiment',loading,source,'game');try{const module=await import('./reversi-ui.mjs');if(token!==version||panel.hidden)return;content.replaceChildren();dispose=kind==='signal'?module.mountSignal(content):module.mountReversi(content)}catch{if(token===version){content.textContent='The board couldn’t load. You can close this panel and keep exploring.'}}}
 async function takeBreak(source){const box=document.createElement('div'),p=document.createElement('p'),b=document.createElement('button');p.textContent='Two players, one screen. No high score to defend.';b.type='button';b.className='project-action secondary';b.dataset.gameOpen='reversi';b.textContent='Open the little board';box.append(p,b);await show('Take a break.','A small detour',box,source)}
 document.getElementById('scene-close').addEventListener('click',()=>close());backdrop.addEventListener('click',()=>close());
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.scene==='identity'){e.preventDefault();identity(b)}else if(b.dataset.projectDetail){e.preventDefault();project(b.dataset.projectDetail,b)}else if(b.dataset.gameOpen){e.preventDefault();game(b.dataset.gameOpen,b)}else if(b.dataset.route){window.SectionScroll?.route(b.dataset.route,{focus:true})}});
 panel.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(a.getAttribute('href').startsWith('#')&&window.SectionScroll){e.preventDefault();close(false);window.SectionScroll.route(a.hash,{source:'detail',focus:true})}else close(false)});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,a[href],summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled&&el.tabIndex!==-1);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}e.stopPropagation()});
 for(const event of ['wheel','touchstart','touchmove'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});
 window.SitePanel=Object.freeze({identity,project,game,takeBreak,close,snapshot:()=>({open:!panel.hidden,kind:panel.dataset.scene})});
 console.info('Dev mandalaw — curious enough to open the console? There’s a little board in Side quests.');
})();
