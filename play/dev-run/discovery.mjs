export function createDiscovery({shell,entry,toggle,invite,immersive,signal}){
 const key='dev-run-fullscreen-discovered';
 const read=()=>{try{return sessionStorage.getItem(key)==='1'}catch{return false}};
 const learned=()=>{try{sessionStorage.setItem(key,'1')}catch{};toggle.classList.remove('first-look');invite.hidden=true};
 const small=()=>innerWidth<800||(innerWidth<=1000&&innerHeight<=500);
 function sync(){const active=immersive.active;toggle.disabled=entry.disabled;invite.querySelector('[data-expand]').disabled=entry.disabled;
  toggle.setAttribute('aria-label',active?'Exit fullscreen / immersive mode':'Enter fullscreen / immersive mode');
  toggle.setAttribute('aria-pressed',String(active));toggle.title=active?'Exit fullscreen':'Fullscreen · landscape recommended';
  toggle.querySelector('span').textContent=active?'Exit':'Full screen';toggle.dataset.active=String(active);
  const action=shell.querySelector('#companion-panel [data-fullscreen-action]');if(action){action.disabled=entry.disabled;action.textContent=active?'⛶ Exit fullscreen':'⛶ Want the whole screen?';}if(active)learned();
  const onboarding=!read()&&small()&&shell.dataset.status==='title';
  toggle.classList.toggle('first-look',onboarding);invite.hidden=!onboarding;
 }
 function enter(){if(entry.disabled&&!immersive.active)return;learned();return immersive.active?immersive.exit():immersive.enter()}
 toggle.addEventListener('click',enter,{signal});entry.addEventListener('click',learned,{signal});
 invite.querySelector('[data-expand]').addEventListener('click',enter,{signal});
 invite.querySelector('[data-dismiss]').addEventListener('click',learned,{signal});
 shell.addEventListener('click',e=>{if(e.target.closest('[data-fullscreen-action]'))enter()},{signal});
 const observer=new MutationObserver(sync);observer.observe(shell,{attributes:true,attributeFilter:['data-immersive','data-status']});observer.observe(entry,{attributes:true,attributeFilter:['disabled']});
 addEventListener('resize',sync,{signal});signal?.addEventListener('abort',()=>observer.disconnect(),{once:true});sync();return{sync,enter};
}
