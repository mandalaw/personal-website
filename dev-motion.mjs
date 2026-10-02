import {definitions,poses as core} from './images/characters/motion/poses.mjs?v=755e8af1f27e';
const ns='http://www.w3.org/2000/svg',library={...core},rendered=new WeakMap(),playing=new Set(),pivots=new WeakMap();
const parse=text=>new DOMParser().parseFromString('<svg xmlns="'+ns+'">'+text+'</svg>','image/svg+xml').documentElement;
function preserveGeometry(svg){for(const el of svg.querySelectorAll('[transform]')){const m=el.transform?.baseVal?.consolidate()?.matrix;if(m)el.style.setProperty('--dev-base-transform',`matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`)}}
const bank=document.createElementNS(ns,'svg');bank.setAttribute('aria-hidden','true');bank.setAttribute('focusable','false');bank.classList.add('dev-definitions');bank.append(...parse('<defs>'+definitions+'</defs>').childNodes);document.body.append(bank);preserveGeometry(bank);
const suppressed=()=>document.hidden||document.documentElement.dataset.devQuiet==='true'||document.documentElement.dataset.motion==='reduce'||document.documentElement.dataset.guideOpen==='true'||document.documentElement.dataset.sceneOpen==='true'||matchMedia('(prefers-reduced-motion:reduce)').matches;
let rare;
function loadRare(){return rare||(rare=import('./images/characters/motion/props.mjs?v=fd08d94bf051').then(m=>Object.assign(library,m.poses)))}
export async function pose(el,name){if(!el)return;el.dataset.pose=name;let item=library[name];if(!item){await loadRare();if(el.dataset.pose!==name)return;item=library[name]}if(!item)return;const svg=el.querySelector('svg');if(!svg)return;if(rendered.get(el)===name)return;stop(el);svg.setAttribute('viewBox','70 15 220 370');svg.replaceChildren(...parse(item.art).childNodes);preserveGeometry(svg);rendered.set(el,name);el.dataset.poseKind=item.kind;}
function animate(el,frames,options){if(!el||!el.isConnected)return null;el.getAnimations().forEach(a=>a.cancel());if(el.matches?.('[data-part]')){let point=pivots.get(el);if(!point){const own=el.style.transformOrigin.match(/(-?[\d.]+)px\s+(-?[\d.]+)px/),box=el.getBBox();point=own?[Number(own[1]),Number(own[2])]:[box.x+box.width/2,box.y+(el.dataset.part==='body'?box.height:box.height/2)];pivots.set(el,point)}el.style.transformOrigin='0px 0px';el.style.transformBox='view-box';frames=frames.map(frame=>{if(!frame.transform)return frame;const m=new DOMMatrix().translate(...point).multiply(new DOMMatrix(frame.transform)).translate(-point[0],-point[1]);return {...frame,transform:`matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`}})}const a=el.animate(frames,{fill:'none',easing:'ease-in-out',...options});playing.add(a);a.finished.catch(()=>{}).finally(()=>playing.delete(a));return a}
export function stop(el){el?.getAnimations({subtree:true}).forEach(a=>a.cancel())}
export function stopAll(){for(const a of playing)a.cancel();playing.clear()}
export function micro(el,action,small=false){if(!el)return;const head=el.querySelector('[data-part=head]'),body=el.querySelector('[data-part=body]'),hand=el.querySelector('[data-part=hand]'),prop=el.querySelector('[data-part=prop]'),amp=small?.55:1;
 const turn=(target,deg,duration=700)=>animate(target,[{transform:'rotate(0deg)'},{transform:`rotate(${deg*amp}deg)`,offset:.38},{transform:'rotate(0deg)'}],{duration});
 if(action==='breathe')animate(body,[{transform:'scaleY(1)'},{transform:`scaleY(${1+.012*amp})`,offset:.45},{transform:'scaleY(1)'}],{duration:1050});
 else if(action==='settle')turn(head,-3,850);
 else if(action==='hand-adjust')turn(hand||head,4,750);
 else if(action==='prop-check'){turn(head,4,950);turn(prop||hand,-3,900)}
 else if(action==='sip'){const frames=[{transform:'translate(0,0)'},{transform:'translate(-5px,-27px)',offset:.4},{transform:'translate(-5px,-27px)',offset:.65},{transform:'translate(0,0)'}];animate(prop,frames,{duration:1650});animate(hand,frames,{duration:1650});turn(head,-3,1550)}
 else if(action==='page')animate(prop,[{transform:'scaleX(1)'},{transform:'scaleX(.9)',offset:.4},{transform:'scaleX(1)'}],{duration:950});
 else if(action==='type')animate(hand||head,[{transform:'translateY(0)'},{transform:`translateY(${2*amp}px)`},{transform:'translateY(0)'},{transform:`translateY(${2*amp}px)`},{transform:'translateY(0)'}],{duration:700});
 else if(action==='wave')turn(hand,9,1000);
 else turn(head,3.5,700);
 el.dataset.gesture=action;
}
export async function change(el,name){const previous=el.dataset.pose;await pose(el,name);if(el.dataset.pose!==name||suppressed())return;animate(el.querySelector('svg'),[{opacity:.65},{opacity:1}],{duration:180});if(previous?.startsWith('sit')&&!name.startsWith('sit'))animate(el.querySelector('[data-part=body]'),[{transform:'translateY(5px) rotate(2deg)'},{transform:'translateY(0) rotate(0deg)'}],{duration:320});}
export async function walk(el,dx,dy){const distance=Math.hypot(dx,dy),duration=Math.min(1800,Math.max(850,distance*17));await pose(el,dx>0?'walk-left':'walk-right');if(!el.isConnected||suppressed())return;
 const body=el.querySelector('[data-part=body]'),left=el.querySelector('[data-part=leg-left]'),right=el.querySelector('[data-part=leg-right]'),arm=el.querySelector('[data-part=arm]'),hand=el.querySelector('[data-part=hand]');
 const stride=duration/Math.max(2,Math.round(duration/360)),iterations=Math.round(duration/stride);
 for(const [part,sign] of [[left,1],[right,-1],[arm,-.6],[hand,.6]])animate(part,[{transform:'rotate(0deg)'},{transform:`rotate(${12*sign}deg)`,offset:.25},{transform:'rotate(0deg)',offset:.5},{transform:`rotate(${-12*sign}deg)`,offset:.75},{transform:'rotate(0deg)'}],{duration:stride,iterations,easing:'linear'});
 animate(body,[{transform:'translateY(0)'},{transform:'translateY(-1.5px)',offset:.5},{transform:'translateY(0)'}],{duration:stride/2,iterations:iterations*2});
 const travel=animate(el,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration,easing:'cubic-bezier(.25,.1,.65,1)'});await travel?.finished.catch(()=>{});
}
const modules={hero:()=>import('./images/characters/motion/scene-hero.mjs?v=926718fabead'),work:()=>import('./images/characters/motion/scene-work.mjs?v=2ea7813efc1a'),workbench:()=>import('./images/characters/motion/scene-workbench.mjs?v=7277ba31afd4'),about:()=>import('./images/characters/motion/scene-about.mjs?v=48da048b6d63'),resume:()=>import('./images/characters/motion/scene-resume.mjs?v=bd8d377c16e0'),contact:()=>import('./images/characters/motion/scene-contact.mjs?v=05ff0fac9a15'),sidequest:()=>import('./images/characters/motion/scene-sidequest.mjs?v=ae80a8597431'),visuals:()=>import('./images/characters/motion/scene-visuals.mjs?v=3ac45bd20ff7')};
const visible=new Set(),loaded=new WeakSet();
async function scene(el){if(loaded.has(el))return;loaded.add(el);let key=el.dataset.homeCharacter?({a:'hero',b:'workbench',c:'work'})[el.dataset.homeCharacter]:['workbench','work','about','contact','resume','sidequest','future'].find(k=>el.classList.contains('character-'+k));if(key==='future')key='visuals';if(!modules[key])return;
 try{const m=await modules[key](),svg=new DOMParser().parseFromString(m.default.replace('<svg','<svg xmlns="'+ns+'"'),'image/svg+xml').documentElement;svg.classList.add('motion-art');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.removeAttribute('width');svg.removeAttribute('height');el.append(svg);preserveGeometry(svg);el.classList.add('motion-scene');el.dataset.motionScene=key}catch{loaded.delete(el)}
}
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){visible.add(target);scene(target)}else visible.delete(target)}),{threshold:.12});
document.querySelectorAll('.site-character,[data-home-character]').forEach(el=>observer.observe(el));
export function visibleScenes(){return [...visible].filter(el=>!el.hidden&&!el.closest('[hidden]')&&el.getClientRects().length)}
export const stateCount=43;
