// GENERATED canonical header controller from site.js.
'use strict';
(() => {
const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion:reduce)'),narrow=matchMedia('(max-width:900px)'),menu=document.querySelector('.menu-icon'),links=document.querySelector('.nav-links'),theme=document.getElementById('toggle-dark-mode');
const reduced=()=>reduce.matches||root.dataset.motion==='reduce';
function closeMenu(returnFocus=false){links.classList.remove('active');links.inert=narrow.matches;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');if(returnFocus)menu.focus()}
closeMenu();menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';links.classList.toggle('active',open);links.inert=narrow.matches&&!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')closeMenu(true)});
for(const type of ['click','focusin'])document.addEventListener(type,e=>{if(!e.target.closest('header'))closeMenu()});
narrow.addEventListener('change',()=>closeMenu());links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
function applyTheme(save=false){const night=theme.checked;root.dataset.theme=night?'night':'day';document.body.classList.toggle('dark-mode',night);document.querySelector('meta[name=theme-color]').content=getComputedStyle(root).getPropertyValue('--canvas').trim();if(save)try{localStorage.setItem('mandalaw-theme',root.dataset.theme)}catch{}root.dataset.themeTransition='true';clearTimeout(applyTheme.timer);applyTheme.timer=setTimeout(()=>root.dataset.themeTransition='false',reduced()?0:340)}
theme.checked=root.dataset.theme==='night';applyTheme();theme.addEventListener('change',()=>applyTheme(true));root.classList.remove('theme-initializing');
})();

document.querySelectorAll('footer [data-guide-open],footer [data-game-open]').forEach(b=>b.addEventListener('click',()=>location.assign(b.hasAttribute('data-game-open')?'/#playground':'/#services')));
