import { ImmersiveState } from './viewport.mjs?v=c77ee2bc882e';
export function createImmersive({shell,canvas,entry,onStart,onSuspend,onResume,onPause,onResize,status,signal}) {
  const state=new ImmersiveState(), panel=document.getElementById('play-guide'), exitButton=document.getElementById('exit-immersive');
  let saved=null, epoch=0, native=false, orientationOwned=false, resumeAfter=false, allowPortrait=false, timer=0, resizing=false, lastSize='', first=true;
  try{first=localStorage.getItem('dev-run-controls-seen')!=='1';}catch{}
  const fullscreenElement=()=>document.fullscreenElement||document.webkitFullscreenElement;
  const change=next=>{state.set(next);shell.dataset.immersive=state.value;};
  const portrait=()=>innerWidth<innerHeight&&innerWidth<700;
  const focusables=()=>[...(panel.hidden?shell:panel).querySelectorAll('button,a,input,select,[tabindex="0"]')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length);
  function sync(kind){if(!state.active||['ENTERING','ROTATE_PROMPT'].includes(state.value)||panel.hidden===false)return;if(kind==='paused'||kind==='over')change('PAUSED');else if(kind==='running'||kind==='won')change('IMMERSIVE');}
  function lockPage(){
    const siblings=[...document.body.children].filter(e=>!e.contains(shell)), peers=[...shell.parentElement.children].filter(e=>e!==shell);
    saved={x:scrollX,y:scrollY,body:document.body.getAttribute('style'),html:document.documentElement.getAttribute('style'),focus:document.activeElement,inert:[...new Set([...siblings,...peers])].map(e=>[e,e.inert])};
    for(const [e]of saved.inert)e.inert=true;
    Object.assign(document.body.style,{position:'fixed',top:-saved.y+'px',left:-saved.x+'px',width:'100%',overflow:'hidden'});document.documentElement.style.overflow='hidden';
    document.body.classList.add('run-immersive');shell.classList.add('is-immersive');shell.setAttribute('role','region');shell.setAttribute('aria-label','Dev Run immersive game');
  }
  function restorePage(){
    if(!saved)return;const old=saved;saved=null;
    shell.classList.remove('is-immersive');document.body.classList.remove('run-immersive');shell.removeAttribute('role');shell.removeAttribute('aria-label');
    for(const [e,v]of old.inert)e.inert=v;
    for(const [e,v]of [[document.body,old.body],[document.documentElement,old.html]])if(v===null)e.removeAttribute('style');else e.setAttribute('style',v);
    window.scrollTo({left:old.x,top:old.y,behavior:'instant'});old.focus?.focus({preventScroll:true});
  }
  function remember(){first=false;try{localStorage.setItem('dev-run-controls-seen','1');}catch{}}
  function guide(rotate){
    change(rotate?'ROTATE_PROMPT':'PAUSED');onSuspend();panel.hidden=false;
    panel.querySelector('h2').textContent=rotate?'Rotate for the full run.':'Two thumbs. One run.';
    panel.querySelector('.guide-message').textContent=rotate?'More room to see what’s coming. Portrait works too.':'Hold a direction. Tap Jump with your other thumb. Build momentum, then Slide.';
    document.getElementById('guide-go').textContent=rotate?'Play anyway':'Let’s go';
    panel.querySelector('h2').focus({preventScroll:true});
  }
  function continuePlay(){allowPortrait=portrait();remember();panel.hidden=true;change('IMMERSIVE');measure();if(resumeAfter)onResume();else sync(status());canvas.focus({preventScroll:true});}
  function measure(){
    const landscape=innerWidth>=innerHeight;shell.dataset.layout=landscape?'landscape':'portrait';
    shell.style.setProperty('--play-height',(window.visualViewport?.height||innerHeight)+'px');
    onResize();const b=canvas.getBoundingClientRect();lastSize=[Math.round(b.width),Math.round(b.height),landscape].join(':');
  }
  async function enter(){
    if(state.value!=='PAGE')return;if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portfolio-game',{detail:{name:'devrun_fullscreen_requested',props:{}}}));const token=++epoch;change('ENTERING');allowPortrait=false;native=false;resumeAfter=['running','title','won'].includes(status());
    lockPage();if(status()==='title')onStart();onSuspend();
    // Invoke within the original click activation, before awaiting anything.
    let request;try{const method=shell.requestFullscreen||shell.webkitRequestFullscreen;if(method)request=Promise.resolve(method.call(shell,{navigationUI:'hide'}));}catch{}
    try{if(request)await request;}catch{/* The fixed shell is the supported fallback. */}
    if(token!==epoch){if(fullscreenElement()===shell){try{await (document.exitFullscreen?.()||document.webkitExitFullscreen?.());}catch{}}return;}
    native=fullscreenElement()===shell;shell.dataset.presentation=native?'fullscreen':'immersive';if(!native)if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portfolio-game',{detail:{name:'devrun_fullscreen_rejected',props:{reason:'unavailable'}}}));if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portfolio-game',{detail:{name:'devrun_fullscreen_entered',props:{presentation:native?'native':'immersive'}}}));shell.dataset.orientation='manual';
    if(native&&screen.orientation?.lock){try{await screen.orientation.lock('landscape');orientationOwned=true;shell.dataset.orientation='locked';}catch{/* Manual rotation remains available. */}}
    if(token!==epoch){if(orientationOwned){try{screen.orientation.unlock();}catch{}orientationOwned=false;}return;}
    measure();if(portrait())guide(true);else if(first)guide(false);else{change('IMMERSIVE');if(resumeAfter)onResume();else sync(status());canvas.focus({preventScroll:true});}
  }
  async function exit(){
    if(!state.active||state.value==='EXITING')return;const wasPresented=['fullscreen','immersive'].includes(shell.dataset.presentation),previousPresentation=native?'native':'immersive';++epoch;change('EXITING');clearTimeout(timer);resizing=false;panel.hidden=true;onSuspend();
    if(orientationOwned){try{screen.orientation.unlock();}catch{}orientationOwned=false;}
    if(fullscreenElement()===shell){try{const fn=document.exitFullscreen||document.webkitExitFullscreen;if(fn)await fn.call(document);}catch{}}
    if(wasPresented&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portfolio-game',{detail:{name:'devrun_fullscreen_exited',props:{presentation:previousPresentation}}}));native=false;restorePage();change('PAGE');shell.dataset.presentation='page';shell.dataset.layout='page';onResize();onPause('Your run is paused.');entry.focus({preventScroll:true});
  }
  function resize(){
    if(state.value==='ENTERING'||state.value==='EXITING')return;
    const b=canvas.getBoundingClientRect(),size=[Math.round(b.width),Math.round(b.height),innerWidth>=innerHeight].join(':');
    const viewportHeight=String(window.visualViewport?.height||innerHeight);
    if(size===lastSize&&(!state.active||shell.style.getPropertyValue('--play-height')===viewportHeight+'px'))return;
    if(!resizing){if(panel.hidden)resumeAfter=status()==='running'||(status()==='won');if(resumeAfter)onSuspend();resizing=true;}
    shell.dataset.resize='SCHEDULED';clearTimeout(timer);
    timer=setTimeout(()=>{shell.dataset.resize='MEASURING';measure();shell.dataset.resize='APPLYING';resizing=false;
      if(state.active&&portrait()&&!allowPortrait){guide(true);}else if(state.value==='ROTATE_PROMPT'&&!portrait()){panel.hidden=true;remember();change('IMMERSIVE');if(resumeAfter)onResume();}
      else if(panel.hidden&&resumeAfter){onResume();}
      shell.dataset.resize='IDLE';
    },100);
  }
  entry.addEventListener('click',enter,{signal});exitButton.addEventListener('click',exit,{signal});
  document.getElementById('guide-go').addEventListener('click',continuePlay,{signal});
  document.getElementById('guide-exit').addEventListener('click',exit,{signal});
  for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,()=>{if(native&&fullscreenElement()!==shell&&state.value!=='EXITING')exit();else if(state.active&&state.value!=='ENTERING')resize();},{signal});
  window.addEventListener('resize',resize,{signal});window.visualViewport?.addEventListener('resize',resize,{signal});screen.orientation?.addEventListener('change',resize,{signal});
  shell.addEventListener('keydown',e=>{if(!state.active)return;if(e.key==='Escape'&&!panel.hidden){e.preventDefault();e.stopPropagation();exit();return;}if(e.key==='Tab'){const a=focusables();if(!a.length)return;const first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}},{signal});
  signal.addEventListener('abort',()=>{clearTimeout(timer);if(orientationOwned){try{screen.orientation.unlock();}catch{}}restorePage();},{once:true});
  return {enter,exit,resize,sync,get active(){return state.active;},get transitioning(){return ['ENTERING','EXITING'].includes(state.value)||resizing;},get state(){return state.value;}};
}
