// A dedicated HUD cell is safer than choosing free-floating positions over a playfield.
export const GUIDE_FIT=Object.freeze({baseline:{width:60,height:100},scale:.5,visual:{width:30,height:50},target:{width:44,height:50}});
export function intersects(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
export function safeDock(rect,exclusions,viewport){return rect.x>=viewport.left&&rect.y>=viewport.top&&rect.x+rect.width<=viewport.right&&rect.y+rect.height<=viewport.bottom&&!exclusions.some(r=>intersects(rect,r));}
export function createCompanion({button,panel,canvas,game,assets,pause,resume,signal}){
 const c=canvas.getContext('2d');let pausedByGuide=false,lastPose='',lastState='',lastCheckpoint=-1,expressUntil=0;
 function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});if(pausedByGuide){pausedByGuide=false;resume();}}
 button.addEventListener('click',()=>{if(!panel.hidden)return close();pausedByGuide=game().status==='running';if(pausedByGuide)pause();panel.hidden=false;button.setAttribute('aria-expanded','true');panel.querySelector('button').focus({preventScroll:true});},{signal});
 panel.querySelector('button').addEventListener('click',close,{signal});
 panel.querySelector('[data-fullscreen-action]').addEventListener('click',close,{signal});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();}},{signal});
 return {update(){const g=game(),now=performance.now();if(g.checkpoint!==lastCheckpoint){lastCheckpoint=g.checkpoint;expressUntil=now+1200;}
  const quiet=matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.motion==='reduce';
  const invited=!document.getElementById('fullscreen-invite')?.hidden;
  const pose=invited&&!quiet?'point':g.status==='won'?'wave':g.status==='paused'||g.encounter?'check-map':!quiet&&now<expressUntil?'wave':'idle';
  if(pose!==lastPose&&assets()){lastPose=pose;c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(assets().character[pose],80,0,210,390,0,0,canvas.width,canvas.height);}
  const state=g.status+'-'+(g.encounter?.id??'');if(state!==lastState){lastState=state;button.dataset.state=g.status;panel.querySelector('[data-fullscreen-action]').textContent=document.getElementById('game').classList.contains('is-immersive')?'⛶ Exit fullscreen':'⛶ Want the whole screen?';panel.querySelector('p').textContent=g.encounter?.cue||'Move with ← and →. Jump with ↑; hold ↓ to duck, or press it after a run-up to slide. The two marked ramps let your laptop take the load. Pause whenever you like.';}
  if(g.status==='over'){panel.hidden=true;pausedByGuide=false;button.setAttribute('aria-expanded','false');}
 },dispose(){pausedByGuide=false;}};
}
