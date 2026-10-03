import {RunTease} from './dev-run-tease.mjs?v=43c22f254e5d';
import {Behavior,profiles} from './dev-behavior.mjs?v=6ee1b9d2c8fb';
import {SceneClock,scenes} from './dev-scenes.mjs?v=4d1e80a23e09';
import {Stage,obstacles,available,compactViewport} from './dev-stage.mjs?v=9ea7f164f68a';
import {bank} from './dev-prompts.mjs?v=5113586eac2e';
import * as Targets from './dev-targets.mjs?v=25d36af9a17d';
import * as Motion from './dev-motion.mjs?v=3ca54d15331d';
'use strict';
(() => {
 const runTease=new RunTease({getItem:k=>sessionStorage.getItem(k),setItem:(k,v)=>sessionStorage.setItem(k,v)});let runInteractions=0,runHover=false;
 const root=document.documentElement,launcher=document.getElementById('guide-launcher');if(!launcher)return;
 const mark=launcher.querySelector('.dev-character'),cue=launcher.querySelector('.guide-launch-label'),quietButton=document.getElementById('dev-quiet'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const behavior=new Behavior(performance.now()),clock=new SceneClock(),stage=new Stage(launcher);
 const prompt=document.createElement('div');prompt.className='dev-prompt';prompt.hidden=true;prompt.setAttribute('role','group');prompt.setAttribute('aria-label','A small shortcut');document.body.append(prompt);
 let timer=0,raf=0,keyboard=false,held=false,quiet=false,lastInput=performance.now(),paused=false,lastContext='',nextTarget=0,target=null,nextLayout=0,shortAction=null,promptUntil=0,count=0,clickCount=0,lastClick=0,reaction=null,lastReaction=0,lastMicroAt=0,readingNextSpeech=performance.now()+30000;
 try{quiet=localStorage.getItem('mandalaw-companion-quiet')==='1';count=Math.max(0,Number(sessionStorage.getItem('mandalaw-live-cues'))||0);behavior.speechRecent=JSON.parse(sessionStorage.getItem('mandalaw-live-lines')||'[]').filter(x=>typeof x==='string').slice(-48)}catch{}
 const reading=()=>/^\/(resume|case-studies)\//.test(location.pathname);
 const calm=()=>quiet||reduced.matches||root.dataset.motion==='reduce';
 const transition=()=>root.dataset.entryTransition==='true'||root.dataset.entranceState==='running'||['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState);
 const modal=()=>root.dataset.guideOpen==='true'||root.dataset.sceneOpen==='true'||!!document.querySelector('.menu-icon[aria-expanded=true]');
 const protectedInput=()=>held||document.activeElement?.matches('input,select,textarea')||keyboard&&document.activeElement===launcher;
 function context(){const p=location.pathname,id=root.dataset.scrollCurrent||'about';if(root.dataset.page==='not-found'||p.includes('404'))return'LOST';if(p.includes('/visuals'))return'VISUALS';if(p.includes('/resume'))return'RESUME';if(p.includes('trustai'))return'TRUSTAI';if(p.includes('garden'))return'GIS';if(p.includes('/case-studies/'))return'PORTFOLIO';if(id==='portfolio')return root.dataset.activeProject==='trustai'?'TRUSTAI':root.dataset.activeProject==='gdsc'?'GDSC':['garden','routeability'].includes(root.dataset.activeProject)?'GIS':'PORTFOLIO';return({about:'ENTRY',experience:'ABOUT',services:'WORKBENCH',playground:'SIDE_QUESTS',contact:'CONTACT','site-footer':'FOOTER'})[id]||'ENTRY'}
 const sceneContext=()=>context()==='ENTRY'?'ENTRY_'+(root.dataset.entryMode||'a').toUpperCase():context();
 function state(value){root.dataset.devState=value}
 function hidePrompt(){prompt.hidden=true;promptUntil=0;launcher.dataset.cueVisible='false';launcher.dataset.cueTopic=''}
 function cancel(){clock.cancel();stage.cancel(true);Motion.pose(mark,'stand');root.dataset.devPose='stand';shortAction=null;behavior.interrupted(performance.now());root.dataset.devScene='';root.dataset.devBeat='';hidePrompt()}
 function panelPose(){const panel=document.querySelector('#pocket-guide .dev-character');if(!panel)return;let name=root.dataset.guideGreetingPose||window.PortfolioData?.guide.find(x=>x.id===root.dataset.guideTopic)?.pose||'sit';if(name.startsWith('chair-'))name=name==='chair-think'?'sit-think':'sit';Motion.pose(panel,name)}
 function layout(){raf=0;const ctx=context();root.dataset.devContext=ctx;if(ctx!==lastContext){cancel();lastContext=ctx;Motion.pose(mark,'stand');nextTarget=0}
  if(root.dataset.guideOpen==='true'){stage.hide();panelPose();state('OPEN');return}
  if(root.dataset.guideHidden==='true'||document.hidden||modal()||transition()){stage.hide();hidePrompt();state('HIDDEN');return}
  const previous=stage.plan;if(!stage.layout()){state('HIDDEN');return}if(previous&&previous!==stage.plan){clock.cancel();behavior.interrupted(performance.now())}
  stage.show();state(calm()?'QUIET':clock.name?'SCENE':'LIVING');nextLayout=performance.now()+3500;
 }
 function schedule(){if(!document.hidden&&!raf)raf=requestAnimationFrame(layout)}
 function face(direction){stage.face(direction);behavior.faced(direction,performance.now())}
 function chooseTarget(id){const items=Targets.candidates(context()),fresh=items.filter(x=>!behavior.targetRecent.slice(-3).includes(x.id));if(id)return items.find(x=>x.id===id)||null;return (fresh.length?fresh:items)[0]||null}
 function rememberTarget(item){if(item){root.dataset.devTarget=item.id;behavior.rememberList(behavior.targetRecent,item.id,5)}}
 function startScene(name){if(compactViewport()&&scenes[name]?.steps.some(s=>s.chair))return false;if(!scenes[name]||scenes[name].requires?.some(id=>!Targets.candidates(context()).some(t=>t.id===id))||(scenes[name].steps.some(s=>s.move)&&!stage.canWalk())||calm()||modal()||transition()||reading())return false;clock.cancel();stage.cancel(false);shortAction=null;const now=performance.now();clock.start(name,now);behavior.started(name,now);root.dataset.devScene=name;state('SCENE');return true}
 async function point(item){if(!item||!Targets.visible(item.el))return;const version=stage.version,aim=Motion.toward(mark,item.el);face(aim.facing);await Motion.pose(mark,aim.pose);if(version!==stage.version)return;rememberTarget(item);behavior.remember(aim.pose);root.dataset.devPose=aim.pose;root.dataset.devBeat='point-target'}
 function small(now,action){if(action==='point'&&target){Motion.pose(mark,'look-up');face(Motion.toward(mark,target.el).facing);shortAction={item:target,at:now+350,end:now+1600,pointed:false};root.dataset.devBeat='notice-target'}else{const pose=({wave:'wave',look:'look-up',peek:behavior.facing==='FACING_LEFT'?'peek-left':'peek-right',turn:'curious',think:'think',stretch:'stretch',inspect:'tablet'})[action]||'stand';if(action==='turn')face(behavior.facing==='FACING_LEFT'?'FACING_RIGHT':'FACING_LEFT');Motion.pose(mark,pose);behavior.remember(pose);root.dataset.devPose=pose;root.dataset.devBeat=pose;shortAction={at:now,end:now+1500,pointed:true};if(action==='wave')Motion.liveMicro(mark,'wave')}}
 function glyph(name){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),use=document.createElementNS(ns,'use');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('ui-icon');use.setAttribute('href','#icon-'+name);svg.append(use);return svg}
 function bubble(item){const line=document.createElement('button');line.type='button';line.className='dev-prompt-line';line.textContent=item.text;line.dataset.topic=item.topic;prompt.replaceChildren(line);
  if(item.chips?.length){const chips=document.createElement('div');chips.className='dev-prompt-chips';for(const [text,topic,icon] of item.chips.slice(0,2)){const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.topic=topic;b.prepend(glyph(icon));chips.append(b)}prompt.append(chips)}
  prompt.hidden=false;prompt.style.visibility='hidden';const r=stage.plan||launcher.getBoundingClientRect(),b=prompt.getBoundingClientRect(),items=obstacles(),positions=[{left:r.left-b.width-10,top:r.bottom-b.height},{left:r.right+10,top:r.bottom-b.height},{left:Math.max(12,Math.min(innerWidth-b.width-12,r.left+(r.width-b.width)/2)),top:r.top-b.height-12},{left:Math.max(12,Math.min(innerWidth-b.width-12,r.left+(r.width-b.width)/2)),top:r.bottom+12}];
  const lane=stage.plan;if(lane)items.push(lane);const place=positions.find(p=>available({...p,right:p.left+b.width,bottom:p.top+b.height,width:b.width,height:b.height},items,5));if(!place){prompt.hidden=true;prompt.style.visibility='';return false}
  prompt.style.left=place.left+'px';prompt.style.top=place.top+'px';prompt.style.visibility='';cue.textContent=item.text;launcher.dataset.cueTopic=item.topic;promptUntil=performance.now()+(item.chips?.length?6500:4400);return true;
 }
 function speak(now){if(root.dataset.devVisible!=='true'||promptUntil||(reading()&&(now-lastInput<20000||now<readingNextSpeech)))return;const promoted=runTease.next({context:context(),idle:now-lastInput,interactions:runInteractions,hover:runHover,quiet:calm()});const item=promoted?{...promoted,chips:[['Play Dev Run','play-devrun','arrow'],['About the game','devrun','question']]}:compactViewport()?null:behavior.speech(now,now-lastInput,bank(context()));if(!item)return;
  if(bubble(item)){if(promoted){runTease.shown(promoted);runHover=false;const gameTarget=chooseTarget('devrun');if(gameTarget){clock.cancel();stage.cancel(false);shortAction={item:gameTarget,at:now,end:now+2200,pointed:false};point(gameTarget)}}if(reading())readingNextSpeech=now+60000;count++;behavior.spoken(item,now);try{sessionStorage.setItem('mandalaw-live-cues',String(count));sessionStorage.setItem('mandalaw-live-lines',JSON.stringify(behavior.speechRecent))}catch{}}
 }
 prompt.addEventListener('click',e=>{const b=e.target.closest('button[data-topic]');if(!b)return;const topic=b.dataset.topic;hidePrompt();if(topic==='play-devrun'){location.assign('/play/dev-run/');return}if(topic==='dismiss'){launcher.focus({preventScroll:true});return}window.PocketGuide?.open(topic,launcher)});
 prompt.addEventListener('keydown',e=>{if(e.key==='Escape'){hidePrompt();launcher.focus({preventScroll:true})}});
 function activity(event){if(event?.type==='pointermove')return;lastInput=performance.now();if(!event?.target?.closest?.('.dev-prompt'))hidePrompt();if(['resize','section-settled','deck-commit'].includes(event?.type)){cancel();schedule()}}
 function queueReaction(event){if(event.target?.closest('.dev-prompt,#pocket-guide'))return;const item=Targets.match(event.target,context());if(item){reaction={item,at:performance.now()+300};if(item.id==='devrun')runHover=true}}
 function preference(value){if(quiet===!!value)return;quiet=!!value;root.dataset.devQuiet=String(quiet);quietButton?.setAttribute('aria-pressed',String(quiet));try{localStorage.setItem('mandalaw-companion-quiet',quiet?'1':'0')}catch{}cancel();if(quiet)Motion.stopAll();schedule()}
 function engage(){runInteractions++;cancel();const now=performance.now();clickCount=now-lastClick<20000?clickCount+1:1;lastClick=now;const i=Math.min(clickCount-1,4);if(runInteractions===2&&!runTease.played)return{line:'There’s a game in here. Want to run it?',pose:'point-right',topic:'devrun'};return {line:['Hey.','Yep?','Still here.','The projects are good too.','All right. One secret.'][i],pose:['wave','curious','shrug','present','peek-right'][i],topic:i===4?'secrets':'help'}}
 function pause(now){if(!paused){clock.pause(now);stage.pause();paused=true}}
 function resume(now){if(paused){clock.resume(now);stage.resume();paused=false}}
 function visibleMicro(){return [...document.querySelectorAll('main .dev-micro,footer .dev-micro')].find(el=>{const r=el.getBoundingClientRect();return r.width&&r.top>64&&r.bottom<innerHeight})}
 function tick(){timer=0;const now=performance.now(),hard=calm()||document.hidden||modal()||transition()||root.dataset.guideHidden==='true',input=protectedInput()||now-lastInput<750,read=reading();
  if(now>=nextLayout&&!stage.moving&&!clock.name)layout();
  if(promptUntil&&now>=promptUntil&&!prompt.contains(document.activeElement))hidePrompt();
  if(hard||input){pause(now);if(hard)hidePrompt();if(calm())Motion.stopAll();
   else if(!document.hidden&&!input&&!transition()&&root.dataset.sceneOpen==='true'){
    const figure=document.querySelector('.scene-guide'),action=behavior.micro(now,{soft:true});
    if(figure&&action){Motion.liveMicro(figure,action,true);root.dataset.devAction='panel-'+action;lastMicroAt=now}
   }
  }
  else {
   resume(now);const mini=root.dataset.devVisible==='true'?mark:visibleMicro();
   if(now>=nextTarget){target=chooseTarget();nextTarget=now+3800+Math.random()*2200}
   if(reaction&&now>=reaction.at&&now-lastReaction>1800&&!clock.name){const r=reaction;reaction=null;if(Targets.visible(r.item.el)&&mini){target=r.item;small(now,'point');lastReaction=now}}
   if(read){if(clock.name)cancel();const action=behavior.micro(now,{soft:true});if(action&&mini){Motion.liveMicro(mini,action,true);root.dataset.devAction=action;lastMicroAt=now}if(mini)speak(now)}
   else if(mini){
    clock.resume(now);
    if(!clock.name&&!shortAction){const name=behavior.scene(now,sceneContext(),stage.canWalk(),Targets.candidates(context()).map(t=>t.id));if(name)startScene(name)}
    const beat=clock.step(now);if(beat?.done){stage.finish();behavior.completed(now);root.dataset.devScene='';root.dataset.devBeat='scene-finished';state('LIVING')}
    else if(beat){const item=chooseTarget(beat.targetId);rememberTarget(beat.target?item:null);stage.perform(beat,item);behavior.remember(beat.pose);root.dataset.devAction=beat.pose}
    if(!clock.name){if(shortAction){if(!shortAction.pointed&&now>=shortAction.at){point(shortAction.item);shortAction.pointed=true}if(now>=shortAction.end){Motion.pose(mark,'stand');shortAction=null;root.dataset.devBeat='relax'}}else{const action=behavior.small(now);if(action)small(now,action)}}
    const action=behavior.micro(now);if(action&&!stage.moving&&!['jump','plane'].includes(clock.current?.effect)){const safe=clock.current?.pose==='chair-type'?'type':action;Motion.liveMicro(mini,safe);root.dataset.devAction=safe;lastMicroAt=now}
    speak(now);
   }
  }
  if(!document.hidden)timer=setTimeout(tick,100);
 }
 for(const name of ['pointermove','wheel'])document.addEventListener(name,activity,{passive:true});
 document.addEventListener('pointerdown',e=>{keyboard=false;held=true;activity(e)},{passive:true});
 for(const name of ['pointerup','pointercancel'])document.addEventListener(name,e=>{held=false;activity(e)},{passive:true});
 document.addEventListener('keydown',e=>{keyboard=true;activity(e)},true);document.addEventListener('focusin',activity);document.addEventListener('focusout',()=>{lastInput=performance.now()});
 document.addEventListener('pointerover',queueReaction,{passive:true});document.addEventListener('focusin',queueReaction);document.addEventListener('click',queueReaction);
 addEventListener('scroll',()=>{hidePrompt();schedule()},{passive:true});addEventListener('resize',activity);visualViewport?.addEventListener('resize',activity);document.addEventListener('section-settled',activity);document.addEventListener('deck-commit',activity);
 quietButton?.addEventListener('click',()=>preference(!quiet));quietButton?.setAttribute('aria-pressed',String(quiet));
 new MutationObserver(records=>{if(records.some(r=>['data-guide-open','data-scene-open','data-guide-hidden','data-motion'].includes(r.attributeName))){cancel();if(modal()||calm())Motion.stopAll();if(root.dataset.sceneOpen==='true'){const figure=document.querySelector('.scene-guide'),kind=document.getElementById('scene-panel')?.dataset.scene;const pose=kind==='game'?'game-piece':({trustai:'tablet',gdsc:'terminal',garden:'map',routeability:'map',original:'archive',othello:'game-piece'})[root.dataset.activeProject]||'wave';Motion.pose(figure,pose)}}if(records.some(r=>r.attributeName==='data-theme')){reaction={item:chooseTarget('theme'),at:performance.now()+350};if(!reaction.item)reaction=null}schedule()}).observe(root,{attributes:true,attributeFilter:['data-theme','data-guide-open','data-guide-topic','data-scene-open','data-guide-hidden','data-scroll-state','data-scroll-current','data-active-project','data-motion','data-entrance-state','data-entry-mode','data-entry-transition']});
 const menu=document.querySelector('.menu-icon');if(menu)new MutationObserver(()=>{cancel();schedule()}).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 const game=document.getElementById('scene-content');if(game)new MutationObserver(()=>{const board=game.querySelector('.reversi'),figure=document.querySelector('.scene-guide');if(board&&figure)Motion.pose(figure,board.dataset.over==='true'?'pleased':'game-piece')}).observe(game,{subtree:true,childList:true,attributes:true,attributeFilter:['data-over']});
 reduced.addEventListener('change',()=>{cancel();Motion.stopAll();schedule()});
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);timer=0;held=false;const now=performance.now();if(document.hidden){pause(now);hidePrompt();stage.hide()}else{lastInput=now;resume(now);schedule();tick()}});
 root.dataset.devQuiet=String(quiet);root.dataset.devReady='true';root.dataset.devIntensity='LIVE';root.dataset.devFacing='FACING_RIGHT';root.dataset.devChair='stowed';Motion.pose(mark,'stand');
 window.DevGuide=Object.freeze({layout,preference,engage,greet:value=>Motion.pose(document.querySelector('#pocket-guide .dev-character'),value),targets:()=>Targets.candidates(context()).map(x=>({id:x.id,pose:x.pose,prompt:x.prompt})),intensity:mode=>{cancel();behavior.configure(mode,performance.now());root.dataset.devIntensity=behavior.mode},cadence:name=>{hidePrompt();behavior.configureCadence(name,performance.now())},scene:startScene,sceneNames:Object.keys(scenes),react:pose=>{if(!calm()&&!modal())Motion.pose(mark,pose)},snapshot:()=>({state:root.dataset.devState,context:context(),pose:mark.dataset.pose,facing:mark.dataset.facing,quiet,hints:count,mode:behavior.mode,scene:clock.snapshot(),stage:stage.snapshot(),behavior:behavior.snapshot(),timerCount:timer?1:0,lastMicroAt,promptVisible:!prompt.hidden})});
 schedule();tick();
})();
