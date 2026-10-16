'use strict';
(() => {
  const root=document.documentElement,header=document.querySelector('header'),deck=window.ProjectDeck;
  // Only the intentionally sectional Home is controlled. Shared pages stay native.
  const ids=['about','portfolio','services','experience','playground','contact','site-footer'];
  const elements=ids.map(id=>document.getElementById(id));
  if(!header||!deck||elements.some(e=>!e))return;
  const intent=new SectionIntent(),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const nav=[...document.querySelectorAll('.nav-links a')];
  const state={currentSectionIndex:0,targetSectionIndex:null,direction:0,inputSource:'initial',transitionToken:0,accepted:0,completed:0,duration:0};
  const options={motion:'controlled',sensitivity:'balanced',portfolio:'section'};
  let registry=[],headerHeight=0,room=0,maxY=0,ready=false,motion=null,frame=0,geometryFrame=0,guardTimer=0,scrollFrame=0,touch=null,nativeTouch=false,writing=false,focusMoving=false;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),now=()=>performance.now();
  const reduced=()=>reduce.matches||root.dataset.motion==='reduce';
  const ease=t=>1-Math.pow(1-t,3);
  function allowed(s,y){return s.overflow?clamp(y,s.start,s.end):s.start;}
  function error(){const s=registry[state.currentSectionIndex];return s?scrollY-allowed(s,scrollY):0;}
  function publish(){
    const data={scrollState:intent.phase,scrollCurrent:registry[state.currentSectionIndex]?.id||'',scrollTarget:registry[state.targetSectionIndex]?.id||'',scrollSource:state.inputSource,scrollDirection:state.direction,scrollToken:state.transitionToken,scrollAccepted:state.accepted,scrollCompleted:state.completed,scrollDuration:state.duration,scrollError:Math.round(error()*100)/100,scrolled:scrollY>12};
    for(const[k,v]of Object.entries(data))if(root.dataset[k]!==String(v))root.dataset[k]=String(v);
  }
  function active(index){nav.forEach(a=>{const on=a.hash==='#'+registry[index]?.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  function measure(){
    headerHeight=header.getBoundingClientRect().height;room=Math.max(1,innerHeight-headerHeight);maxY=Math.max(0,root.scrollHeight-innerHeight);
    registry=elements.map((element,index)=>{const b=element.getBoundingClientRect(),top=b.top+scrollY,height=b.height,start=clamp(top-headerHeight,0,maxY),end=clamp(top+height-innerHeight,start,maxY),overflow=height>room+4;
      element.dataset.sectionFit=overflow?'tall':'fit';return {element,index,id:ids[index],alignment:index===ids.length-1?'end':'start',top,height,header:headerHeight,viewport:innerHeight,room,start,end,overflow,prev:ids[index-1]||null,next:ids[index+1]||null};});
  }
  function write(y){writing=true;scrollTo({top:clamp(y,0,maxY),behavior:'instant'});writing=false;}
  function snapshot(){return {...state,phase:intent.phase,options:{...options},position:scrollY,alignmentError:error(),nativeReading:!!registry[state.currentSectionIndex]?.overflow,registry:registry.map(({element,...s})=>s),deck:deck.snapshot()};}
  function hash(id,mode){if(mode==='none'||location.hash==='#'+id)return;history[mode==='push'?'pushState':'replaceState'](null,'','#'+id);}
  function guard(){
    clearTimeout(guardTimer);intent.advance(now());if(intent.phase==='IDLE_LOCKED'&&!intent.nativeGesture)nativeTouch=false;publish();
    if(intent.touchActive||intent.phase==='TRANSITIONING')return;
    if(intent.phase!=='IDLE_LOCKED'||intent.nativeGesture)guardTimer=setTimeout(guard,Math.max(1,intent.remaining(now())+1));
  }
  function targetY(m){const s=registry[m.index];return m.explicitTop!==null?clamp(m.explicitTop,0,maxY):m.edge==='end'?s.end:s.start;}
  function finish(){
    const m=motion;if(!m)return;motion=null;state.currentSectionIndex=m.index;state.targetSectionIndex=null;state.completed++;
    intent.arrive(now());active(m.index);hash(m.hash||registry[m.index].id,m.historyMode);publish();
    if(m.focus){focusMoving=true;const el=registry[m.index].element;el.setAttribute('tabindex','-1');el.focus({preventScroll:true});focusMoving=false;}
    document.dispatchEvent(new CustomEvent('section-reveal',{detail:{section:registry[m.index].element}}));
    document.dispatchEvent(new CustomEvent('section-settled',{detail:snapshot()}));m.resolve(true);guard();
  }
  function animate(time){
    frame=0;if(!motion)return;const m=motion,p=m.duration?clamp((time-m.startTime)/m.duration,0,1):1;
    write(m.from+(targetY(m)-m.from)*ease(p));
    if(p===1)finish();else frame=requestAnimationFrame(animate);
  }
  function go(index,{source='nav',historyMode='none',instant=false,top=null,edge='start',focus=false,hash:routeHash=null}={}){
    if(!ready)return Promise.resolve(false);index=clamp(index,0,registry.length-1);
    if(motion){motion.resolve(false);motion=null;cancelAnimationFrame(frame);}
    clearTimeout(guardTimer);const to=top!==null?top:edge==='end'?registry[index].end:registry[index].start;
    state.direction=Math.sign(to-scrollY);state.inputSource=source;state.targetSectionIndex=index;state.transitionToken++;state.accepted++;
    state.duration=instant||reduced()?0:420;intent.begin(state.direction,now());publish();
    return new Promise(resolve=>{motion={index,edge,explicitTop:top,from:scrollY,startTime:now(),duration:state.duration,deadline:now()+state.duration,historyMode,focus,hash:routeHash,resolve};
      // Reveal the incoming composition before its first moving frame, on the same deadline.
      document.dispatchEvent(new CustomEvent('section-enter',{detail:{section:registry[index].element,duration:state.duration}}));
      // Destination is committed in the input handler. There is no quiet timer before motion.
      if(!state.duration){write(targetY(motion));finish();}else frame=requestAnimationFrame(animate);
    });
  }
  function step(direction,source='keyboard'){
    const next=clamp(state.currentSectionIndex+direction,0,registry.length-1);
    if(next===state.currentSectionIndex){intent.begin(direction,now());intent.arrive(now());guard();return Promise.resolve(false);}
    return go(next,{source,edge:direction<0&&registry[next].overflow?'end':'start',focus:source==='keyboard'});
  }
  function modal(){return !!document.querySelector('dialog[open],[aria-modal="true"]:not([hidden]),.nav-links.active');}
  function exemption(target,direction){
    if(modal()||window.visualViewport?.scale>1)return true;
    for(let e=target;e&&e!==document.body;e=e.parentElement){
      if(e.matches?.('input,textarea,select,[contenteditable],dialog,[role="dialog"],[role="slider"],[data-native-scroll],.game-frame,canvas,pre'))return true;
      const css=getComputedStyle(e);
      if(/auto|scroll/.test(css.overflowY)&&e.scrollHeight>e.clientHeight+2){
        const can=direction>0?e.scrollTop+e.clientHeight<e.scrollHeight-1:e.scrollTop>1;
        if(can||/contain|none/.test(css.overscrollBehaviorY))return true;
      }
    }
    return false;
  }
  function nativeRoom(direction){const s=registry[state.currentSectionIndex];return s.overflow&&(direction>0?scrollY<s.end-1:scrollY>s.start+1);}
  function wheel(e){
    if(!ready||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?room:1),direction=Math.sign(delta);if(!direction||exemption(e.target,direction))return;
    nativeTouch=false;const time=now();intent.advance(time);
    if(intent.phase==='TRANSITIONING'||intent.phase==='MOMENTUM_GUARD'){e.preventDefault();intent.feed(delta,time);guard();return;}
    const s=registry[state.currentSectionIndex];
    if(nativeRoom(direction)){
      intent.observeNative(time);const boundary=direction>0?s.end:s.start;
      if(Math.abs(delta)>Math.abs(boundary-scrollY)){e.preventDefault();write(boundary);}guard();return;
    }
    e.preventDefault();const result=intent.feed(delta,time,{unit:e.deltaMode});state.inputSource='wheel';publish();
    if(result.commit)step(result.direction,'wheel');else guard();
  }
  addEventListener('wheel',wheel,{passive:false});
  addEventListener('touchstart',e=>{
    if(!ready||e.touches.length!==1){touch=null;intent.release(now());guard();return;}
    const t=e.touches[0];touch={x:t.clientX,y:t.clientY,at:now(),target:e.target,axis:null,committed:false,native:false};nativeTouch=false;intent.advance(now());
  },{passive:true});
  addEventListener('touchmove',e=>{
    if(!touch||e.touches.length!==1){touch=null;intent.release(now());guard();return;}const p=e.touches[0],dx=p.clientX-touch.x,dy=touch.y-p.clientY,direction=Math.sign(dy);
    if(touch.axis==='horizontal')return;
    if(!touch.axis&&Math.abs(dx)>Math.abs(dy)*1.15&&Math.abs(dx)>6){touch.axis='horizontal';return;}
    if(!direction||Math.abs(dx)>Math.abs(dy)||exemption(touch.target,direction))return;
    touch.axis='vertical';intent.touchActive=true;
    if(touch.committed||intent.phase==='TRANSITIONING'||intent.phase==='MOMENTUM_GUARD'){e.preventDefault();intent.lastInput=now();return;}
    if(!touch.native&&nativeRoom(direction)){touch.native=true;nativeTouch=true;}
    if(touch.native){
      intent.observeNative(now());const s=registry[state.currentSectionIndex];if(!nativeRoom(direction)){e.preventDefault();write(direction>0?s.end:s.start);}return;
    }
    // Suppress drift from the first vertical move, before the deliberate threshold.
    e.preventDefault();const decision=SectionIntent.touchDirection(dx,dy,now()-touch.at);
    if(decision){touch.committed=true;step(decision,'touch');}
  },{passive:false});
  for(const type of ['touchend','touchcancel'])addEventListener(type,()=>{if(touch){intent.release(now());touch=null;guard();}},{passive:true});
  function remeasure(){
    if(!ready)return;cancelAnimationFrame(geometryFrame);geometryFrame=requestAnimationFrame(()=>{
      geometryFrame=0;measure();
      if(motion){const time=now();motion.from=scrollY;motion.startTime=time;motion.duration=Math.max(0,motion.deadline-time);}
      else if(!modal()&&!(window.visualViewport?.scale>1))write(allowed(registry[state.currentSectionIndex],scrollY));
      publish();
    });
  }
  addEventListener('scroll',()=>{
    if(!ready||writing||motion)return;if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(motion||modal()||window.visualViewport?.scale>1)return;
      const s=registry[state.currentSectionIndex],y=allowed(s,scrollY);
      if(s.overflow&&nativeTouch){intent.observeNative(now());guard();}
      // Contain native inertia in a tall section; no delayed nearest-section snap.
      if(Math.abs(scrollY-y)>1)write(y);publish();
    });
  },{passive:true});
  document.addEventListener('keydown',e=>{
    if(!ready||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||exemption(e.target,1)||e.target.closest('button,a,input,textarea,select,summary,[role="tab"],[role="slider"]'))return;
    if(!['PageDown','PageUp',' ','Home','End','ArrowDown','ArrowUp'].includes(e.key))return;
    const direction=['PageUp','ArrowUp'].includes(e.key)||(e.key===' '&&e.shiftKey)?-1:1;
    nativeTouch=false;if(nativeRoom(direction)&&!['Home','End'].includes(e.key))return;
    e.preventDefault();if(e.repeat||motion)return;
    if(['Home','End'].includes(e.key))go(e.key==='Home'?0:registry.length-1,{source:'keyboard',focus:true});else step(direction);
  });
  function destination(value){if(value==='#main-content')return {index:0,id:'main-content'};const id=value.replace(/^#/,''),project=deck.snapshot().keys.indexOf(id.replace(/^project-/,''));if(id.startsWith('project-')&&project>=0)return {index:1,project,id};const index=ids.indexOf(id);return index>=0?{index,id}:null;}
  function route(value,{instant=false,source='nav',historyMode='push',focus=false}={}){const target=destination(value);if(!target)return false;if(target.project!==undefined)deck.settle(target.project);go(target.index,{source,instant,historyMode,focus,hash:target.id});return true;}
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(destination(a.hash)){e.preventDefault();route(a.hash,{focus:true});}});
  document.addEventListener('focusin',e=>{
    if(!ready||motion||focusMoving||modal())return;const i=elements.findIndex(el=>el.contains(e.target));if(i<0||i===state.currentSectionIndex)return;
    state.currentSectionIndex=i;const b=e.target.getBoundingClientRect(),s=registry[i];
    const desired=s.overflow?clamp(scrollY+(b.top<headerHeight?b.top-headerHeight:b.bottom>innerHeight?b.bottom-innerHeight:0),s.start,s.end):s.start;
    write(desired);intent.reset();active(i);publish();
  });
  addEventListener('popstate',()=>route(location.hash||'#about',{source:'history',historyMode:'none',instant:true}));
  addEventListener('hashchange',()=>{if(!motion)route(location.hash,{source:'hash',historyMode:'none',instant:true});});
  document.addEventListener('deck-commit',e=>{if(e.detail.historyMode==='push'&&state.currentSectionIndex===1)hash('project-'+e.detail.key,'push');});
  addEventListener('resize',remeasure);window.visualViewport?.addEventListener('resize',remeasure);
  reduce.addEventListener('change',()=>{if(motion&&reduced()){cancelAnimationFrame(frame);write(targetY(motion));finish();}});
  window.SectionScroll=Object.freeze({snapshot,go,step,route,project:index=>route('#project-'+deck.snapshot().keys[index],{source:'project',historyMode:'none'}),configure:()=>{},remeasure});
  function start(){
    if(ready)return;measure();ready=true;history.scrollRestoration='manual';root.dataset.sectionInput='controlled';root.dataset.scrollEngine='ready';root.dataset.scrollReady='true';
    if(!location.hash||!route(location.hash,{source:'initial',historyMode:'none',instant:true})){write(registry[0].start);active(0);publish();}
    const observer=new ResizeObserver(remeasure);elements.forEach(e=>observer.observe(e));observer.observe(header);document.fonts.ready.then(remeasure);
  }
  // Initialize even in a background Safari tab; geometry updates remain event-driven.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
