'use strict';
(() => {
  const root=document.documentElement,header=document.querySelector('header'),deck=window.ProjectDeck;
  if(!header||!deck||typeof SectionIntent==='undefined')return; // Native document is the failure fallback.
  const q=new URLSearchParams(location.search),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const curves={
    silk:{duration:560,ease:t=>1-(1-t)**3},
    cinematic:{duration:720,ease:t=>1-(1-t)**4},
    mobile:{duration:460,ease:t=>1-(1-t)**5},
    original:{duration:620,ease:t=>t*t*(3-2*t)}
  };
  const options={motion:curves[q.get('curve')]?q.get('curve'):'silk',sensitivity:SectionIntent.profiles[q.get('sensitivity')]?q.get('sensitivity'):'balanced',portfolio:q.get('portfolio')==='story'?'story':'section'};
  const intent=new SectionIntent(options.sensitivity);
  const elements=[...document.querySelectorAll('main>section'),document.querySelector('footer')].filter(Boolean);
  const nav=[...document.querySelectorAll('.nav-links a')];
  const state={phase:'IDLE',currentSectionIndex:0,targetSectionIndex:null,direction:0,inputSource:'initial',transitionToken:0,accepted:0,completed:0};
  let landedTop=null,registry=[],headerHeight=0,room=0,maxY=0,frame=0,resizeFrame=0,pendingResizeIndex=null,scrollFrame=0,releaseTimer=0,activeResolve=null,ready=false,touch=null,nested=null,nestedTarget=null,nestedTime=-Infinity;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),reduced=()=>reduce.matches||root.dataset.motion==='reduce';
  const busy=()=>['INTENT_DETECTED','TRANSITIONING','SETTLING'].includes(state.phase);
  const serialRegistry=()=>registry.map(({element,...rest})=>({...rest}));
  function publish(){root.dataset.scrollState=state.phase;root.dataset.scrollCurrent=registry[state.currentSectionIndex]?.id||'';root.dataset.scrollTarget=registry[state.targetSectionIndex]?.id||'';root.dataset.scrollSource=state.inputSource;root.dataset.scrollToken=state.transitionToken;root.dataset.scrollAccepted=state.accepted;root.dataset.scrollCompleted=state.completed;root.dataset.scrollCurve=options.motion;root.dataset.scrollSensitivity=options.sensitivity;root.dataset.scrollPortfolio=options.portfolio;root.dataset.scrolled=String(scrollY>12);}
  function phase(value){state.phase=value;publish();}
  function active(index){nav.forEach(a=>{const on=a.hash==='#'+registry[index]?.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  // One geometry registry, measured only at initialization/content resize, never on each wheel packet.
  function measure(){headerHeight=header.getBoundingClientRect().height;room=innerHeight-headerHeight;maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight);registry=elements.map((element,index)=>{const rect=element.getBoundingClientRect(),top=rect.top+scrollY,height=rect.height,offset=Number(element.dataset.scrollOffset)||0,anchor=element.dataset.scrollAnchor||'top';const destination=top-headerHeight+offset-(anchor==='center'?Math.max(0,(room-height)/2):0);return {element,index,id:element.id,top,height,header:headerHeight,viewport:innerHeight,room,anchor,offset,start:clamp(destination,0,maxY),end:clamp(top+height-innerHeight,0,maxY),overflow:height>room+3};});publish();}
  function currentFromPosition(){if(landedTop!==null&&Math.abs(scrollY-landedTop)<=1)return state.currentSectionIndex;if(scrollY>=maxY-1)return registry.length-1;const line=scrollY+headerHeight+room*.28;let i=0;for(const s of registry)if(s.top<=line)i=s.index;return i;}
  function syncNative(){if(!ready||busy())return;state.currentSectionIndex=currentFromPosition();active(state.currentSectionIndex);publish();}
  function updateHash(id,mode='replace'){if(mode==='none'||location.hash==='#'+id)return;history[mode==='push'?'pushState':'replaceState'](null,'','#'+id);}
  function reveal(index){const section=registry[index]?.element;if(section?.matches('section'))document.dispatchEvent(new CustomEvent('section-reveal',{detail:{section}}));}
  function cancel(){state.transitionToken++;cancelAnimationFrame(frame);clearTimeout(releaseTimer);if(activeResolve){activeResolve(false);activeResolve=null;}state.targetSectionIndex=null;phase('IDLE');}
  function release(){clearTimeout(releaseTimer);const gap=performance.now()-intent.last,remaining=SectionIntent.profiles[intent.mode].release-gap;if(remaining>0){phase('COOLDOWN');releaseTimer=setTimeout(release,remaining+1);}else phase('IDLE');}
  function go(index,{source='nav',historyMode='replace',instant=false,top=null,focus=false,hash=null}={}) {
    if(!ready)return Promise.resolve(false);
    index=clamp(index,0,registry.length-1);cancel();const token=state.transitionToken;
    const from=scrollY,to=clamp(top??registry[index].start,0,maxY),distance=to-from;
    state.targetSectionIndex=index;state.direction=Math.sign(distance);state.inputSource=source;state.accepted++;phase('INTENT_DETECTED');active(index);
    const motion=curves[options.motion],duration=instant||reduced()?0:motion.duration;
    phase('TRANSITIONING');
    return new Promise(resolve=>{
      activeResolve=resolve;const began=performance.now();let revealed=false;
      function tick(now){if(token!==state.transitionToken)return;const t=duration?clamp((now-began)/duration,0,1):1;
        scrollTo({top:from+distance*motion.ease(t),behavior:'instant'});
        if(!revealed&&t>=.38){revealed=true;reveal(index);}
        if(t<1){frame=requestAnimationFrame(tick);return;}
        phase('SETTLING');scrollTo({top:to,behavior:'instant'});
        frame=requestAnimationFrame(()=>{if(token!==state.transitionToken)return;scrollTo({top:to,behavior:'instant'});state.currentSectionIndex=index;landedTop=to;state.targetSectionIndex=null;state.completed++;updateHash(hash||registry[index].id,historyMode);active(index);
          if(focus){const el=registry[index].element;if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
          // Wheel/touch never steal DOM focus; keyboard/nav move it to the visible section.
          activeResolve=null;release();resolve(true);document.dispatchEvent(new CustomEvent('section-settled',{detail:snapshot()}));
        });
      }
      if(duration)frame=requestAnimationFrame(tick);else tick(began);
    });
  }
  function nativeRoom(direction){const s=registry[state.currentSectionIndex];return s?.overflow&&(direction>0?scrollY<s.end-3:scrollY>s.start+3);}
  async function step(direction,source='wheel') {
    if(busy()||deck.snapshot().phase!=='IDLE')return false;
    const s=registry[state.currentSectionIndex],d=deck.snapshot();
    if(s.id==='portfolio'&&options.portfolio==='story'&&!d.compact){const next=d.current+direction;if(next>=0&&next<d.keys.length){cancel();const token=state.transitionToken;state.targetSectionIndex=s.index;state.direction=direction;state.inputSource=source;state.accepted++;phase('INTENT_DETECTED');phase('TRANSITIONING');await deck.select(next,{history:'none'});if(token!==state.transitionToken)return false;state.targetSectionIndex=null;state.completed++;updateHash('project-'+deck.snapshot().keys[deck.snapshot().current]);phase('SETTLING');release();return true;}}
    const next=state.currentSectionIndex+direction;if(next<0||next>=registry.length)return false;
    return go(next,{source,top:direction<0&&registry[next].overflow?registry[next].end:null,focus:source==='keyboard'});
  }
  function findNested(target){for(let el=target;el&&el!==document.body;el=el.parentElement){if(el.matches?.('input,textarea,select,[contenteditable="true"],dialog,[data-native-scroll]'))return {element:el,always:true};if(/auto|scroll/.test(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+2)return {element:el,always:false};}return null;}
  function nestedCanScroll(target,direction,time){if(time-nestedTime>150||nestedTarget!==target){nested=findNested(target);nestedTarget=target;}nestedTime=time;if(!nested)return false;return nested.always||(direction>0?nested.element.scrollTop+nested.element.clientHeight<nested.element.scrollHeight-2:nested.element.scrollTop>1);}
  addEventListener('wheel',event=>{
    if(!ready||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||!event.deltaY||Math.abs(event.deltaX)>Math.abs(event.deltaY)*.9)return;
    const now=performance.now(),direction=Math.sign(event.deltaY),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?room:1);
    if(nestedCanScroll(event.target,direction,now))return;
    if(!busy()&&nativeRoom(direction)){intent.feed(delta,now,{locked:true,unit:event.deltaMode});root.dataset.scrollReason='native overflow';const s=registry[state.currentSectionIndex],edge=direction>0?s.end:s.start;if(event.cancelable&&(direction>0?scrollY+delta>=edge:scrollY+delta<=edge)){event.preventDefault();scrollTo({top:edge,behavior:'instant'});}return;}
    if(!event.cancelable)return;event.preventDefault();
    const result=intent.feed(delta,now,{locked:busy()||deck.snapshot().phase!=='IDLE',unit:event.deltaMode});
    root.dataset.scrollInput=result.type;root.dataset.scrollDelta=delta.toFixed(2);root.dataset.scrollDirection=String(direction);root.dataset.scrollReason=result.reason;
    if(result.direction)step(result.direction,'wheel');else if(!busy())release();
  },{passive:false});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&busy()){const target=state.targetSectionIndex??state.currentSectionIndex;deck.settle(deck.snapshot().target??deck.snapshot().current);go(target,{source:'escape',instant:true});return;}
    if(!ready||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('button,input,textarea,select,[contenteditable="true"],[role="slider"],[role="tab"]')||(event.key===' '&&event.target.closest('a')))return;
    if(!['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key))return;
    const dir=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:1;
    if(nestedCanScroll(event.target,dir,performance.now())||(!busy()&&nativeRoom(dir)&&!['Home','End'].includes(event.key)))return;
    event.preventDefault();if(event.repeat||busy())return;intent.reset();
    if(event.key==='Home'||event.key==='End')go(event.key==='Home'?0:registry.length-1,{source:'keyboard',focus:true});else step(dir,'keyboard');
  });
  // Capturing starts only for fitted pages, one finger, dominant vertical movement, away from edges/controls.
  addEventListener('touchstart',event=>{touch=null;if(!ready||event.touches.length!==1||visualViewport?.scale>1||event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;const t=event.touches[0];if(t.clientX<24||t.clientX>innerWidth-24)return;touch={x:t.clientX,y:t.clientY,handled:false,target:event.target};},{passive:true});
  addEventListener('touchmove',event=>{if(!touch||event.touches.length!==1){touch=null;return;}const t=event.touches[0],dx=touch.x-t.clientX,dy=touch.y-t.clientY;if(touch.handled){if(event.cancelable)event.preventDefault();return;}if(Math.abs(dx)>Math.abs(dy)){touch=null;return;}if(Math.abs(dy)<12)return;const dir=Math.sign(dy);if(nativeRoom(dir)||nestedCanScroll(touch.target,dir,performance.now())||!event.cancelable){touch=null;return;}event.preventDefault();touch.handled=true;if(!busy())step(dir,'touch');},{passive:false});
  for(const type of ['touchend','touchcancel'])addEventListener(type,()=>{touch=null;},{passive:true});
  // Tab escapes to native focus behavior; never snap users back after focus scrolls.
  document.addEventListener('keydown',event=>{if(event.key==='Tab'&&busy())go(state.targetSectionIndex??state.currentSectionIndex,{source:'focus escape',instant:true,historyMode:'none'});},true);
  function destination(hash){const id=hash.replace(/^#/,''),project=deck.snapshot().keys.indexOf(id.replace(/^project-/,''));if(id.startsWith('project-')&&project>=0)return {index:registry.findIndex(s=>s.id==='portfolio'),project,id};const index=registry.findIndex(s=>s.id===id);return index>=0?{index,id}:null;}
  function route(hash,{instant=false,source='nav',historyMode='push',focus=false}={}){const target=destination(hash);if(!target)return false;if(target.project!==undefined)deck.settle(target.project);let top=null;if(target.project!==undefined&&deck.snapshot().compact){const el=document.getElementById(target.id);top=el.getBoundingClientRect().top+scrollY-headerHeight;}go(target.index,{source,instant,historyMode,focus,hash:target.id,top});return true;}
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;if(destination(link.hash)){event.preventDefault();intent.reset();route(link.hash,{focus:true});}});
  addEventListener('popstate',()=>{intent.reset();route(location.hash||'#about',{source:'history',historyMode:'none',instant:true});});
  addEventListener('hashchange',()=>{if(!busy())route(location.hash,{source:'hash',historyMode:'none',instant:true});});
  document.addEventListener('deck-commit',event=>{if(event.detail.historyMode==='push'&&registry[state.targetSectionIndex??state.currentSectionIndex]?.id==='portfolio')updateHash('project-'+event.detail.key,'push');});
  addEventListener('scroll',()=>{root.dataset.scrolled=String(scrollY>12);if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;syncNative();});},{passive:true});
  function resize(){if(!ready)return;const index=pendingResizeIndex??state.targetSectionIndex??state.currentSectionIndex;pendingResizeIndex=index;const old=registry[index],offset=old?.overflow?Math.max(0,scrollY-old.start):0;cancel();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{pendingResizeIndex=null;measure();go(index,{source:'resize',instant:true,historyMode:'none',top:registry[index].overflow?Math.min(registry[index].end,registry[index].start+offset):null});});}
  addEventListener('resize',resize);reduce.addEventListener('change',()=>{if(busy())go(state.targetSectionIndex??state.currentSectionIndex,{source:'reduced-motion',instant:true});});
  function snapshot(){return {...state,options:{...options},position:scrollY,registry:serialRegistry(),deck:deck.snapshot()};}
  window.SectionScroll=Object.freeze({snapshot,go,step,route,project:index=>route('#project-'+deck.snapshot().keys[index],{source:'project',historyMode:'none'}),configure:values=>{for(const key of ['motion','sensitivity','portfolio']){const allow=key==='motion'?Object.keys(curves):key==='sensitivity'?Object.keys(SectionIntent.profiles):['story','section'];if(allow.includes(values[key]))options[key]=values[key];}intent.mode=options.sensitivity;publish();},remeasure:resize});
  async function start(){await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));measure();ready=true;root.dataset.scrollEngine='ready';history.scrollRestoration='manual';const initial=location.hash||'#'+(q.get('section')||'about');route(initial,{instant:true,source:'initial',historyMode:'none'});root.dataset.scrollReady='true';
    const observer=new ResizeObserver(()=>{if(ready&&!busy()){const before=registry.map(s=>s.height);measure();if(registry.some((s,i)=>Math.abs(s.height-before[i])>2))resize();}});elements.forEach(el=>observer.observe(el));
  }
  if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();
