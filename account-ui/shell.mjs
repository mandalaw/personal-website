import {openAuth} from './auth-panel.mjs';
import {personalize} from './personalize.mjs';
import {icon} from './icons.mjs';
import {ACCOUNT_ORIGIN,accountLink,safeContext} from './context.mjs';
// Persist only the canonical visual preference so an OAuth callback without a query retains it.
try{const t=document.documentElement.dataset.theme;if(t==='day'||t==='night')localStorage.setItem('mandalaw-theme',t);}catch{}
const accountSurface=document.body.hasAttribute('data-account-surface');
let current={authenticated:false},flight=null,epoch=0,expires=null,last=0;
const cluster=document.createElement('div');cluster.className='account-cluster';cluster.setAttribute('data-private-ui','');
const trigger=document.createElement('button');trigger.type='button';trigger.className='account-control';trigger.setAttribute('aria-label','Checking account');trigger.disabled=true;trigger.append(icon('person'),document.createTextNode('…'));
const resume=document.createElement('a');resume.className='account-resume';resume.href=ACCOUNT_ORIGIN+'/api/platform/resources/resume';resume.hidden=true;resume.setAttribute('aria-label','Download résumé');resume.append(icon('resume'));const rt=document.createElement('span');rt.textContent='Résumé';resume.append(rt);
const menu=document.createElement('nav');menu.className='account-menu';menu.id='dev-account-menu';menu.setAttribute('aria-label','Your account');menu.hidden=true;
const notice=document.createElement('p');notice.className='account-notice';notice.setAttribute('role','status');notice.hidden=true;cluster.append(resume,trigger,menu,notice);
const mount=document.querySelector('.nav-container')||document.querySelector('.ws-header')||document.querySelector('.run-header')||document.querySelector('header');
if(mount){const toggle=mount.querySelector('.toggle-container');mount.insertBefore(cluster,toggle||null);}
const mobileResume=document.createElement('li');mobileResume.className='account-mobile-resume';mobileResume.hidden=true;const mobileResumeLink=resume.cloneNode(true);mobileResumeLink.hidden=false;mobileResume.append(mobileResumeLink);document.querySelector('#primary-navigation')?.append(mobileResume);
const context=()=>safeContext(accountSurface?new URLSearchParams(location.search).get('return')||'/':location.pathname+location.hash);
const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');};
function message(text){notice.textContent=text;notice.hidden=!text;}
function clear(){epoch++;clearTimeout(expires);current={authenticated:false};close();render(current);}
function link(label,path,mark){const a=document.createElement('a');a.href=accountLink(path,context());a.append(icon(mark),document.createTextNode(label));a.addEventListener('click',e=>e.stopPropagation());return a;}
function render(s){current=s;personalize(s);resume.hidden=!s.authenticated||!s.capabilities?.resume;mobileResume.hidden=resume.hidden;trigger.replaceChildren();trigger.disabled=false;trigger.dataset.state=s.authenticated?'member':'guest';trigger.removeAttribute('aria-controls');trigger.removeAttribute('aria-expanded');trigger.removeAttribute('aria-haspopup');menu.replaceChildren();
 const name=typeof s.displayName==='string'&&!s.displayName.includes('@')?s.displayName.trim().split(/\s+/)[0].slice(0,30):'';
 const fallback=icon('person');trigger.append(fallback);
 if(s.authenticated&&s.avatar){const img=document.createElement('img');img.className='account-avatar';img.width=24;img.height=24;img.alt='';img.referrerPolicy='no-referrer';img.decoding='async';img.hidden=true;img.onload=()=>{if(img.isConnected){fallback.setAttribute('hidden','');img.hidden=false;}};img.onerror=()=>{img.remove();fallback.removeAttribute('hidden');};img.src=s.avatar;trigger.prepend(img);}
 const label=document.createElement('span');label.className='account-first';label.textContent=s.authenticated?(name||'Account'):'Sign in';trigger.append(label);trigger.setAttribute('aria-label',s.authenticated?'Account'+(name?' for '+name:''):'Sign in');
 if(s.authenticated){trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',menu.id);trigger.append(document.createTextNode('⌄'));const welcome=document.createElement('p');welcome.className='account-welcome';welcome.textContent=name?'Welcome, '+name+'.':'Good to have you here.';menu.append(welcome,link('Your account','/account/#settings','person'),link('Saved & passport','/account/#member','work'),link('Résumé','/access/','resume'));if(s.capabilities?.owner)menu.append(link('Career Control Room','/owner/','code'));const logout=document.createElement('button');logout.type='button';logout.append(icon('arrow'),document.createTextNode('Sign out'));logout.onclick=signOut;menu.append(logout);
 clearTimeout(expires);expires=setTimeout(()=>{clear();document.dispatchEvent(new Event('dev-account-expired'));message('Your account will be checked when you open it.');},Math.max(1,Math.min(s.validForMs||60000,3600000)));
 }
 announce();
}
function announce(){document.dispatchEvent(new CustomEvent('dev-account-state',{detail:{authenticated:!!current.authenticated,member:!!current.capabilities?.member}}));}
document.addEventListener('dev-account-state-request',announce);
async function refresh(force=false){if(accountSurface)return;if(flight)return flight;if(!force&&Date.now()-last<10000)return;const version=epoch;last=Date.now();flight=(async()=>{try{const r=await fetch(ACCOUNT_ORIGIN+'/api/ui/session',{credentials:'include',cache:'no-store',headers:{'X-Dev-Account':'1'},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error();const s=await r.json();if(epoch===version){render(s);message('');}}catch{if(epoch===version){clear();message('Account check unavailable. Sign in is still available.');}}finally{flight=null;}})();return flight;}
async function signOut(){clear();message('Signing out…');try{const r=await fetch(ACCOUNT_ORIGIN+(accountSurface?'/api/logout':'/api/ui/logout'),{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json','X-Dev-Account':'1'},body:'{}',signal:AbortSignal.timeout(8000)});const d=await r.json();if(!r.ok||(!accountSurface&&!d.signedOut))throw Error();message('Signed out.');channel?.postMessage('signed-out');if(accountSurface)location.assign('https://www.mandalawi.ca/');}catch{message('Sign-out could not finish. Open your account to try again.');}}
let channel;try{channel=new BroadcastChannel('dev-account-events');channel.onmessage=e=>{if(e.data==='signed-out')clear();};}catch{}
trigger.onclick=async()=>{if(!current.authenticated){await refresh(true);if(!current.authenticated){openAuth('signin',context(),trigger);return;}}if(menu.hidden){await refresh(true);if(!current.authenticated)return;menu.hidden=false;trigger.setAttribute('aria-expanded','true');}else close();};
cluster.addEventListener('keydown',e=>{if(e.key==='Escape'){close();trigger.focus();}});document.addEventListener('click',e=>{if(!cluster.contains(e.target))close();});cluster.addEventListener('focusout',e=>{if(e.relatedTarget&&!cluster.contains(e.relatedTarget))close();});
addEventListener('pagehide',clear);addEventListener('pageshow',e=>{if(e.persisted){clear();refresh(true);}});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')clear();else refresh();});addEventListener('focus',()=>refresh());
new MutationObserver(()=>{for(const a of menu.querySelectorAll('a')){const u=new URL(a.href);u.searchParams.set('theme',document.documentElement.dataset.theme==='night'?'night':'day');a.href=u.href;}}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
refresh(true);

if(accountSurface)document.addEventListener('dev-account-projection',e=>render(e.detail));
document.addEventListener('click',e=>{const a=e.target.closest('[data-open-account]');if(a){e.preventDefault();openAuth(a.dataset.openAccount,context(),a);}});
const create=document.createElement('button');create.type='button';create.className='account-create';create.textContent='Create account';create.prepend(icon('plus'));create.onclick=()=>openAuth('create',context(),create);cluster.insertBefore(create,trigger);document.addEventListener('dev-account-state',e=>{create.hidden=e.detail.authenticated;});
