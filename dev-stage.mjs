import * as Motion from './dev-motion.mjs?v=c08c4b474ebb';
const root=document.documentElement;
export const overlaps=(a,b,g=8)=>a.left<b.right+g&&a.right>b.left-g&&a.top<b.bottom+g&&a.bottom>b.top-g;
const box=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});
export function obstacles(){
 return [...document.querySelectorAll('header,main a,main button,main summary,main h1,main h2,main h3,main p,main img,main .site-character,main .project-card,main .bench-panel,main .work-card,footer a,footer button,footer summary,footer p')]
 .filter(e=>!e.closest('[hidden],[inert],template')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight);
}
export function available(r,items,g=8){const header=document.querySelector('header')?.getBoundingClientRect().bottom||64,s=getComputedStyle(root),bottom=parseFloat(s.getPropertyValue('--safe-bottom'))||0;return r.left>=10&&r.right<=innerWidth-10&&r.top>=header+10&&r.bottom<=innerHeight-bottom-12&&!items.some(o=>overlaps(r,o,g))}
export class Stage {
 constructor(launcher){this.launcher=launcher;this.mark=launcher.querySelector('.dev-character');this.x=0;this.y=0;this.chairX=0;this.plan=null;this.animations=new Set();this.version=0;this.chair=document.createElement('span');this.chair.className='dev-chair';this.chair.setAttribute('aria-hidden','true');this.chair.hidden=true;document.body.append(this.chair);this.chairReady=null;this.chairVisible=false;this.moving=false}
 async prepareChair(){if(!this.chairReady)this.chairReady=import('./images/characters/motion/chair.mjs?v=42ed6c75bc48').then(m=>{this.chair.append(new DOMParser().parseFromString(m.default,'image/svg+xml').documentElement)});return this.chairReady}
 layout(){const compact=innerWidth<800,w=compact?60:76,h=compact?100:124,items=obstacles(),header=document.querySelector('header')?.getBoundingClientRect().bottom||64;
  // Keep a whole motion corridor clear, including the separate chair. No text is crossed.
  if(this.plan&&this.plan.w===w&&this.plan.h===h&&available(box(this.plan.left,this.plan.top,this.plan.width,h),items)){if(!this.chairVisible&&this.chairReady){this.chairPosition(this.waypoint('stow'));this.chairVisible=true;this.chair.style.opacity='1'}return true}
  const bottom=innerHeight-h-20,ys=[bottom,header+26,Math.round((header+bottom)/2),bottom-h-20];
  const widths=[w+(compact?76:130),w+(compact?40:78),w+24,w];let chosen=null;
  for(const width of widths){for(const y of ys){for(const x of [innerWidth-width-18,18,Math.max(18,innerWidth/2-width/2)]){const r=box(x,y,width,h);if(available(r,items)){chosen={...r,w,h};break}}if(chosen)break}if(chosen)break}
  if(!chosen){this.hide();this.plan=null;return false}
  this.cancel(true);this.plan=chosen;this.y=chosen.top;const span=chosen.width-w;this.x=chosen.left+(span*.18);this.position(this.x);this.chairPosition(chosen.left+span);this.launcher.style.setProperty('--dev-w',w+'px');this.launcher.style.setProperty('--dev-h',h+'px');this.chair.style.width=w+'px';this.chair.style.height=h+'px';this.chair.style.top=this.y+'px';this.prepareChair().then(()=>{if(this.plan===chosen){this.chairVisible=true;this.chair.hidden=root.dataset.devVisible!=='true';this.chair.style.opacity='1'}});root.dataset.devAnchor=chosen.left<innerWidth/2?'left-lane':'right-lane';return true;
 }
 show(){root.dataset.devVisible='true';this.chair.hidden=!this.chairVisible}
 hide(){root.dataset.devVisible='false';this.chair.hidden=true}
 position(x){this.x=x;this.launcher.style.setProperty('--dev-x',x+'px');this.launcher.style.setProperty('--dev-y',this.y+'px')}
 chairPosition(x){this.chairX=x;this.chair.style.left=x+'px'}
 waypoint(name){const p=this.plan;if(!p)return this.x;const space=p.width-p.w;return p.left+space*({stow:1,seat:.4,away:0,other:this.x>p.left+space/2?.05:.95}[name]??.5)}
 canWalk(){return !!this.plan&&this.plan.width-this.plan.w>=24}
 face(direction){Motion.face(this.mark,direction);root.dataset.devFacing=direction}
 animation(el,frames,duration){const a=el.animate(frames,{duration,easing:'ease-in-out',fill:'none'});this.animations.add(a);a.finished.catch(()=>{}).finally(()=>this.animations.delete(a));return a}
 move(to,duration,chair=false){const from=this.x,cfrom=this.chairX;this.position(to);const delta=from-to;this.moving=true;const v=this.version;
  if(chair){this.chairPosition(to);this.animation(this.chair,[{transform:`translateX(${cfrom-to}px)`},{transform:'translateX(0)'}],duration)}
  Motion.stride(this.mark,duration,this.mark.dataset.pose==='chair-pull');
  this.animation(this.launcher,[{transform:`translateX(${delta}px)`},{transform:'translateX(0)'}],duration).finished.catch(()=>{}).finally(()=>{if(this.version===v)this.moving=false});
 }
 async perform(step,item){const v=this.version,p=this.plan;if(!p)return;const valid=()=>this.version===v;root.dataset.devBeat=step.pose;let name=step.pose;
  if(step.chair){root.dataset.devChair=step.chair;if(step.chair==='available'){await this.prepareChair();if(!valid())return;this.chairPosition(this.waypoint('stow'));this.chairVisible=true;this.chair.hidden=false;this.chair.style.opacity='1'}
   if(step.chair==='turn')this.animation(this.chair.querySelector('svg'),[{transform:'scaleX(.85)'},{transform:'scaleX(1)'}],step.ms);
   if(step.chair==='leave'){this.chairVisible=true;this.chair.style.opacity='1'}
  }
  if(step.target&&item){const aim=Motion.toward(this.mark,item.el);name=aim.pose;this.face(aim.facing);root.dataset.devTarget=item.id}
  else if(name==='point')name='look-up';
  if(step.face==='opposite')this.face(this.mark.dataset.facing==='FACING_LEFT'?'FACING_RIGHT':'FACING_LEFT');
  else if(step.face==='target'&&item)this.face(Motion.toward(this.mark,item.el).facing);
  else if(step.face==='stow'||step.face==='other')this.face(this.waypoint(step.face)>this.x?'FACING_RIGHT':'FACING_LEFT');
  if(step.move){const to=this.waypoint(step.move);const direction=to>=this.x?'FACING_RIGHT':'FACING_LEFT';if(name.startsWith('walk'))name=direction==='FACING_LEFT'?'walk-left':'walk-right';this.face(name==='chair-pull'?(direction==='FACING_LEFT'?'FACING_RIGHT':'FACING_LEFT'):direction)}
  await Motion.pose(this.mark,name);if(!valid())return;root.dataset.devPose=name;
  if(step.move)this.move(this.waypoint(step.move),step.ms,step.chair==='pull'||step.chair==='push-back');
  if(step.micro)Motion.liveMicro(this.mark,step.micro);
  if(step.effect==='jump')Motion.jump(this.mark);
  if(step.effect==='plane')Motion.plane(this.mark);
  if(step.chair==='sit-down')this.animation(this.mark.querySelector('svg'),[{transform:'translateY(-3px)'},{transform:'translateY(3px)'}],step.ms);
  if(step.chair==='stand-up')this.animation(this.mark.querySelector('svg'),[{transform:'translateY(3px)'},{transform:'translateY(-3px)'}],step.ms);
 }
 pause(){for(const a of this.animations)if(a.playState==='running')a.pause();Motion.pauseAll()}
 resume(){for(const a of this.animations)if(a.playState==='paused')a.play();Motion.resumeAll()}
 cancel(resetChair=false){this.version++;const r=this.launcher.getBoundingClientRect();if(root.dataset.devVisible==='true'&&this.plan)this.position(Math.max(this.plan.left,Math.min(r.left,this.plan.right-this.plan.w)));for(const a of this.animations)a.cancel();this.animations.clear();this.launcher.style.transform='';Motion.stop(this.mark);this.moving=false;
  if(resetChair){this.chairVisible=false;this.chair.hidden=true;this.chair.style.opacity='1';root.dataset.devChair='stowed'}
 }
 finish(){root.dataset.devChair='stowed';Motion.pose(this.mark,'stand')}
 snapshot(){return {lane:this.plan,x:this.x,chairX:this.chairX,chairVisible:this.chairVisible,moving:this.moving,animations:this.animations.size}}
}
