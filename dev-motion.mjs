import {definitions,poses as core} from './images/characters/motion/poses.mjs?v=755e8af1f27e';
const ns='http://www.w3.org/2000/svg',library={...core},rendered=new WeakMap(),playing=new Set(),pivots=new WeakMap(),versions=new WeakMap();
const parse=text=>new DOMParser().parseFromString('<svg xmlns="'+ns+'">'+text+'</svg>','image/svg+xml').documentElement;
function preserveGeometry(svg){for(const el of svg.querySelectorAll('[transform]')){const m=el.transform?.baseVal?.consolidate()?.matrix;if(m)el.style.setProperty('--dev-base-transform',`matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`)}}
const bank=document.createElementNS(ns,'svg');bank.setAttribute('aria-hidden','true');bank.setAttribute('focusable','false');bank.classList.add('dev-definitions');bank.append(...parse('<defs>'+definitions+'</defs>').childNodes);document.body.append(bank);preserveGeometry(bank);
const suppressed=()=>document.hidden||document.documentElement.dataset.devQuiet==='true'||document.documentElement.dataset.motion==='reduce'||document.documentElement.dataset.guideOpen==='true'||document.documentElement.dataset.sceneOpen==='true'||matchMedia('(prefers-reduced-motion:reduce)').matches;
const opposite={'look-left':'look-right','point-left':'point-right','walk-left':'walk-right','point-up-left':'point-up-right','point-down-left':'point-down-right'};
const fixedDirection=name=>name.startsWith('point-')||name.startsWith('walk-')||['look-left','look-right'].includes(name)?name.endsWith('left')?'FACING_LEFT':'FACING_RIGHT':null;
function frame(el,direction){const g=el.querySelector('[data-facing-body]');if(!g)return;const left=direction==='FACING_LEFT';g.setAttribute('transform',left?'translate(360 0) scale(-1 1)':'translate(0 0)');
 for(const prop of g.querySelectorAll('[data-upright-prop]')){const cx=Number(prop.dataset.center);prop.setAttribute('transform',left?`translate(${cx*2} 0) scale(-1 1)`:'translate(0 0)')}
 preserveGeometry(el.querySelector('svg'));el.dataset.facing=direction;
}
export function face(el,direction,animated=true){if(!el||!['FACING_LEFT','FACING_RIGHT'].includes(direction)||el.dataset.facing===direction)return false;
 frame(el,direction);if(animated&&!suppressed())animate(el.querySelector('svg'),[{opacity:.72},{opacity:1}],{duration:150});return true;
}
export function toward(el,target){const a=el.getBoundingClientRect(),b=target.getBoundingClientRect(),dx=b.left+b.width/2-a.left-a.width/2,dy=b.top+b.height/2-a.top-a.height*.45;return {facing:dx<0?'FACING_LEFT':'FACING_RIGHT',pose:'point-'+(Math.abs(dy)>Math.abs(dx)*.65?(dy<0?'up-':'down-'):'')+(dx<0?'left':'right'),above:dy<-30};}
let rare;
function loadRare(){return rare||(rare=import('./images/characters/motion/props.mjs?v=6bcdc14062bd').then(m=>Object.assign(library,m.poses)))}
export async function pose(el,name,ticket){if(!el)return;if(ticket===undefined){stop(el);ticket=versions.get(el)}el.dataset.pose=name;const canonical=opposite[name]||name;let item=library[canonical];if(!item){await loadRare();if(el.dataset.pose!==name||versions.get(el)!==ticket)return;item=library[canonical]}if(!item)return;const svg=el.querySelector('svg');if(!svg)return;if(rendered.get(el)===name)return;
 el.getAnimations({subtree:true}).forEach(a=>a.cancel());svg.setAttribute('viewBox','70 15 220 370');const g=document.createElementNS(ns,'g');g.dataset.facingBody='';g.append(...parse(item.art).childNodes);svg.replaceChildren(g);
 // Counter-mirror props inside the body rig: code, page marks and camera controls stay readable.
 for(const prop of g.querySelectorAll('[data-part=prop]')){if(['plane','plane-release'].includes(canonical))continue;const box=prop.getBBox(),upright=document.createElementNS(ns,'g');upright.dataset.uprightProp='';upright.dataset.center=String(box.x+box.width/2);upright.append(...prop.childNodes);prop.append(upright)}
 rendered.set(el,name);el.dataset.poseKind=item.kind;frame(el,fixedDirection(name)||el.dataset.facing||'FACING_RIGHT');
}
function animate(el,frames,options){if(!el||!el.isConnected)return null;el.getAnimations().forEach(a=>a.cancel());if(el.matches?.('[data-part]')){let point=pivots.get(el);if(!point){const own=el.style.transformOrigin.match(/(-?[\d.]+)px\s+(-?[\d.]+)px/),box=el.getBBox();point=own?[Number(own[1]),Number(own[2])]:[box.x+box.width/2,box.y+(el.dataset.part==='body'?box.height:box.height/2)];pivots.set(el,point)}el.style.transformOrigin='0px 0px';el.style.transformBox='view-box';frames=frames.map(frame=>{if(!frame.transform)return frame;const m=new DOMMatrix().translate(...point).multiply(new DOMMatrix(frame.transform)).translate(-point[0],-point[1]);return {...frame,transform:`matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`}})}const a=el.animate(frames,{fill:'none',easing:'ease-in-out',...options});playing.add(a);a.finished.catch(()=>{}).finally(()=>playing.delete(a));return a}
export function stop(el){if(!el)return;versions.set(el,(versions.get(el)||0)+1);el.dataset.motionBusy='false';el.style.transform='';el.getAnimations({subtree:true}).forEach(a=>a.cancel())}
export function stopAll(){for(const a of playing)a.cancel();playing.clear();document.querySelectorAll('.dev-character[data-motion-busy=true]').forEach(stop)}
export function micro(el,action,small=false){if(!el)return;const head=el.querySelector('[data-part=head]'),body=el.querySelector('[data-part=body]'),hand=el.querySelector('[data-part=hand]'),prop=el.querySelector('[data-part=prop]'),amp=small?.55:1;
 const turn=(target,deg,duration=700)=>animate(target,[{transform:'rotate(0deg)'},{transform:`rotate(${deg*amp}deg)`,offset:.38},{transform:'rotate(0deg)'}],{duration});
 if(action==='breathe')animate(body,[{transform:'scaleY(1)'},{transform:`scaleY(${1+.012*amp})`,offset:.45},{transform:'scaleY(1)'}],{duration:1050});
 else if(action==='settle')turn(head,-3,850);
 else if(action==='hand-adjust')turn(hand||head,4,750);
 else if(action==='prop-check'){turn(head,4,950);turn(prop||hand,-3,900)}
 else if(action==='sip'){const frames=[{transform:'translate(0,0)'},{transform:'translate(-5px,-27px)',offset:.4},{transform:'translate(-5px,-27px)',offset:.65},{transform:'translate(0,0)'}];animate(prop,frames,{duration:1650});animate(hand,frames,{duration:1650});turn(head,-3,1550)}
 else if(action==='page')animate(prop,[{transform:'scaleX(1)'},{transform:'scaleX(.9)',offset:.4},{transform:'scaleX(1)'}],{duration:950});
 else if(action==='type')animate(hand||head,[{transform:'translateY(0)'},{transform:`translateY(${2*amp}px)`},{transform:'translateY(0)'},{transform:`translateY(${2*amp}px)`},{transform:'translateY(0)'}],{duration:700});
 else if(action==='toe-tap')turn(el.querySelector('[data-part=leg-right]'),2.2,550);
 else if(action==='weight')turn(body,1.2,1000);
 else if(action==='look-up')turn(head,-5,700);
 else if(action==='wave')turn(hand,9,1000);
 else turn(head,3.5,700);
 el.dataset.gesture=action;
}
function sequence(el,run){stop(el);const ticket=versions.get(el);el.dataset.motionBusy='true';const valid=()=>versions.get(el)===ticket&&!suppressed();return run(ticket,valid).finally(()=>{if(versions.get(el)===ticket)el.dataset.motionBusy='false'})}
const finish=animation=>animation?.finished.catch(()=>{});
export async function change(el,name){if(!el)return;return sequence(el,async(ticket,valid)=>{const previous=el.dataset.pose,wasSeated=previous?.startsWith('sit'),seated=name.startsWith('sit');
 if(valid()&&wasSeated!==seated){await pose(el,seated?'stand-to-sit':'sit-to-stand',ticket);if(!valid())return;await finish(animate(el.querySelector('svg'),[{opacity:.75,transform:'translateY(0)'},{opacity:1,transform:seated?'translateY(2px)':'translateY(-2px)'}],{duration:210}))}
 const prepare={laptop:'laptop-closed',map:'map-fold',reading:'book-closed',document:'document-tuck',handoff:'document-tuck',coffee:'reach','game-piece':'reach','camera-up':'camera',cable:'reach'}[name];
 if(prepare&&previous!==prepare&&valid()){await pose(el,prepare,ticket);if(!valid())return;await finish(animate(el.querySelector('[data-part=hand]'),[{transform:'rotate(0deg)'},{transform:'rotate(-4deg)'},{transform:'rotate(0deg)'}],{duration:220}))}
 if(versions.get(el)!==ticket)return;await pose(el,name,ticket);if(!valid())return;await finish(animate(el.querySelector('svg'),[{opacity:.75},{opacity:1}],{duration:170}));
 })}
export async function jump(el){if(!el||suppressed())return;const previous=el.dataset.pose||'stand';return sequence(el,async(ticket,valid)=>{
 await pose(el,'jump-anticipation',ticket);if(!valid())return;await finish(animate(el,[{transform:'translateY(0)'},{transform:'translateY(2px)'}],{duration:140}));if(!valid())return;
 await pose(el,'jump-air',ticket);if(!valid())return;await finish(animate(el,[{transform:'translateY(0)'},{transform:'translateY(-10px)',offset:.45},{transform:'translateY(0)'}],{duration:360}));if(!valid())return;
 await pose(el,'jump-land',ticket);if(!valid())return;await finish(animate(el,[{transform:'translateY(1px)'},{transform:'translateY(0)'}],{duration:160}));if(valid())await pose(el,previous,ticket);
 })}
export async function plane(el){if(!el||suppressed())return;return sequence(el,async(ticket,valid)=>{await pose(el,'plane-release',ticket);if(!valid())return;await finish(animate(el.querySelector('[data-part=prop]'),[{transform:'translate(0,0)',opacity:1},{transform:'translate(12px,-8px)',opacity:0}],{duration:550}));if(valid())await pose(el,'envelope',ticket)})}
export async function walk(el,dx,dy){if(!el||suppressed())return;return sequence(el,async(ticket,valid)=>{
 el.style.transform=`translate(${dx}px,${dy}px)`;
 if(el.dataset.pose?.startsWith('sit')){await pose(el,'sit-to-stand',ticket);if(!valid())return;await finish(animate(el.querySelector('svg'),[{opacity:.8},{opacity:1}],{duration:200}))}
 const distance=Math.hypot(dx,dy),duration=Math.min(1800,Math.max(850,distance*17));await pose(el,dx>0?'walk-left':'walk-right',ticket);if(!el.isConnected||!valid())return;
 const body=el.querySelector('[data-part=body]'),left=el.querySelector('[data-part=leg-left]'),right=el.querySelector('[data-part=leg-right]'),arm=el.querySelector('[data-part=arm]'),hand=el.querySelector('[data-part=hand]');
 const stride=duration/Math.max(2,Math.round(duration/360)),iterations=Math.round(duration/stride);
 for(const [part,sign] of [[left,1],[right,-1],[arm,-.6],[hand,.6]])animate(part,[{transform:'rotate(0deg)'},{transform:`rotate(${12*sign}deg)`,offset:.25},{transform:'rotate(0deg)',offset:.5},{transform:`rotate(${-12*sign}deg)`,offset:.75},{transform:'rotate(0deg)'}],{duration:stride,iterations,easing:'linear'});
 animate(body,[{transform:'translateY(0)'},{transform:'translateY(-1.5px)',offset:.5},{transform:'translateY(0)'}],{duration:stride/2,iterations:iterations*2});
 await finish(animate(el,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration,easing:'cubic-bezier(.25,.1,.65,1)'}));
 if(versions.get(el)===ticket)el.style.transform='';
 })}
const modules={hero:()=>import('./images/characters/motion/scene-hero.mjs?v=926718fabead'),work:()=>import('./images/characters/motion/scene-work.mjs?v=2ea7813efc1a'),workbench:()=>import('./images/characters/motion/scene-workbench.mjs?v=7277ba31afd4'),about:()=>import('./images/characters/motion/scene-about.mjs?v=48da048b6d63'),resume:()=>import('./images/characters/motion/scene-resume.mjs?v=bd8d377c16e0'),contact:()=>import('./images/characters/motion/scene-contact.mjs?v=05ff0fac9a15'),sidequest:()=>import('./images/characters/motion/scene-sidequest.mjs?v=ae80a8597431'),visuals:()=>import('./images/characters/motion/scene-visuals.mjs?v=3ac45bd20ff7')};
const visible=new Set(),loaded=new WeakSet();
async function scene(el){if(loaded.has(el))return;loaded.add(el);let key=el.dataset.homeCharacter?({a:'hero',b:'workbench',c:'work'})[el.dataset.homeCharacter]:['workbench','work','about','contact','resume','sidequest','future'].find(k=>el.classList.contains('character-'+k));if(key==='future')key='visuals';if(!modules[key])return;
 try{const m=await modules[key](),svg=new DOMParser().parseFromString(m.default.replace('<svg','<svg xmlns="'+ns+'"'),'image/svg+xml').documentElement;svg.classList.add('motion-art');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.removeAttribute('width');svg.removeAttribute('height');el.append(svg);preserveGeometry(svg);el.classList.add('motion-scene');el.dataset.motionScene=key}catch{loaded.delete(el)}
}
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){visible.add(target);scene(target)}else visible.delete(target)}),{threshold:.12});
document.querySelectorAll('.site-character,[data-home-character]').forEach(el=>observer.observe(el));
export function visibleScenes(){return [...visible].filter(el=>!el.hidden&&!el.closest('[hidden]')&&el.getClientRects().length)}
export const stateCount=75;

// Short, articulated locomotion is shared by walks and chair handling.
export function stride(el,duration=1000,backward=false){
 const count=Math.max(2,Math.round(duration/280)),beat=duration/count;
 for(const [name,sign] of [['leg-left',1],['leg-right',-1],['arm',-.6],['hand',.45]]){
  if(el.dataset.pose?.startsWith('chair-')&&['arm','hand'].includes(name))continue;
  const direction=backward?-sign:sign;
  animate(el.querySelector(`[data-part="${name}"]`),[{transform:'rotate(0deg)'},{transform:`rotate(${16*direction}deg)`,offset:.25},{transform:'rotate(0deg)',offset:.5},{transform:`rotate(${-16*direction}deg)`,offset:.75},{transform:'rotate(0deg)'}],{duration:beat,iterations:count,easing:'linear'});
 }
 animate(el.querySelector('[data-part=body]'),[{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:beat/2,iterations:count*2});
}
export function liveMicro(el,action,soft=false){
 if(!el)return;const amp=soft?.45:1,part=name=>el.querySelector(`[data-part="${name}"]`);
 const swing=(node,deg,dx=0,dy=0)=>animate(node,[{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${dx*amp}px,${dy*amp}px) rotate(${deg*amp}deg)`,offset:.42},{transform:'translate(0,0) rotate(0deg)'}],{duration:720});
 if(action==='shoulder-roll'){swing(part('body'),-2.5,0,-2);swing(part('arm'),-7,0,-2)}
 else if(action==='wrist-check'){swing(part('head'),9,1,1);swing(part('hand'),-12,-2,-4)}
 else if(action==='double-take')animate(part('head'),[{transform:'rotate(0deg)'},{transform:'rotate(-8deg)',offset:.3},{transform:'rotate(9deg)',offset:.7},{transform:'rotate(0deg)'}],{duration:1000});
 else if(action==='glance')swing(part('head'),9,3,-1);
 else if(action==='nod')swing(part('head'),-8,0,2);
 else if(action==='hand-adjust')swing(part('hand')||part('arm'),10,0,-4);
 else if(action==='toe-tap')swing(part('leg-right')||part('head'),6,0,-3);
 else if(action==='weight')swing(part('body'),2.5,2,0);
 else if(action==='prop-check'){swing(part('head'),6,1,0);swing(part('prop')||part('hand'),-6,0,-3)}
 else if(action==='wave')swing(part('hand'),13,0,-2);
 else if(action==='type')animate(part('hand'),[{transform:'translateY(0)'},{transform:'translateY(5px)'},{transform:'translateY(0)'},{transform:'translateY(4px)'},{transform:'translateY(0)'}],{duration:680});
 else if(action==='breathe')animate(part('body'),[{transform:'scaleY(1)'},{transform:`scaleY(${1+.018*amp})`},{transform:'scaleY(1)'}],{duration:900});
 else micro(el,action,soft);
 el.dataset.gesture=action;
}
export const animatePart=animate;
export function pauseAll(){for(const a of playing)if(a.playState==='running')a.pause()}
export function resumeAll(){for(const a of playing)if(a.playState==='paused')a.play()}
