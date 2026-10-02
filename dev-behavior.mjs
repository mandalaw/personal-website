// A single clock chooses gestures; rendering and the site's navigation keep their own jobs.
export const vocabularies = Object.freeze({
 ENTRY_A:['stand','sit','pockets','curious','point-right','arms-crossed','lean'],
 ENTRY_B:['workbench','sit-laptop','cable','terminal','database','sit-think','map-fold'],
 ENTRY_C:['tablet','present','laptop','think','document','arms-crossed'],
 PORTFOLIO:['tablet','present','laptop','curious','think','notebook','peek-right'],
 TRUSTAI:['tablet','terminal','think','laptop','present','document'],
 GIS:['map-fold','map','notebook','think','tablet','present'],
 WORKBENCH:['workbench','terminal','cable','database','sit-laptop','sit-think'],
 ABOUT:['pockets','coffee','sit-read','lean','reading','arms-crossed'],
 RESUME:['document','handoff','reading','notebook','present','think'],
 CONTACT:['envelope','sit-laptop','plane','coffee','wave','think'],
 SIDE_QUESTS:['game-piece','game','sit-read','curious','pleased','notebook'],
 VISUALS:['camera','camera-up','camera-review','think','notebook','curious'],
 LOST:['curious','think','point-left','point-right','map-fold','pockets'],
 FOOTER:['sit','sit-read','peek-left','wave','pockets','lean']
});
export const profiles=Object.freeze({CALM:{micro:[2800,4300],small:[9000,13000],travel:85000},ALIVE:{micro:[1350,2100],small:[4800,7800],travel:62000},MAX:{micro:[1050,1550],small:[3500,5500],travel:45000}});
export class Behavior {
 constructor(now=0,random=Math.random){this.random=random;this.mode='ALIVE';this.context='ENTRY_A';this.recent=[];this.uses=new Map();this.microRecent=[];this.speechRecent=[];this.paused=true;this.reset(now);this.lastTravel=now;this.lastSpeech=-Infinity;this.speeches=0;this.current='stand';}
 between([a,b]){return a+this.random()*(b-a)}
 reset(now){this.nextMicro=now+this.between(profiles[this.mode].micro);this.nextSmall=now+this.between(profiles[this.mode].small)}
 configure(mode,now){if(!profiles[mode])return;this.mode=mode;this.reset(now)}
 choose(pool,history=this.recent){let options=pool.filter(x=>x!==this.current&&!history.slice(-Math.min(3,pool.length-2)).includes(x));if(!options.length)options=pool.filter(x=>x!==this.current);if(!options.length)return pool[0];const weights=options.map(x=>1/(1+(this.uses.get(x)||0)*.3));let roll=this.random()*weights.reduce((a,b)=>a+b,0);let selected=options.at(-1);for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<=0){selected=options[i];break}}return selected}
 remember(pose){if(pose===this.current)return;this.current=pose;this.recent.push(pose);if(this.recent.length>7)this.recent.shift();this.uses.set(pose,(this.uses.get(pose)||0)+1)}
 react(pose,now){this.remember(pose);this.reset(now)}
 step(now,{context=this.context,locked=false,idle=0,visible=true}={}){
  if(locked||!visible){this.paused=true;return null}
  if(this.paused){this.paused=false;this.reset(now);return null}
  if(context!==this.context){this.context=context;this.reset(now);const pose=this.choose(vocabularies[context]||vocabularies.PORTFOLIO);this.remember(pose);return{type:'pose',pose,reason:'context'}}
  if(idle<700)return null;
  if(now>=this.nextSmall&&idle>2500){const pose=this.choose(vocabularies[context]||vocabularies.PORTFOLIO);this.remember(pose);this.nextSmall=now+this.between(profiles[this.mode].small);this.nextMicro=now+1200;return{type:'pose',pose,reason:'idle'}}
  if(now>=this.nextMicro){const action=this.choose(['glance','breathe','settle','prop-check','hand-adjust'],this.microRecent);this.microRecent.push(action);if(this.microRecent.length>3)this.microRecent.shift();this.nextMicro=now+this.between(profiles[this.mode].micro);return{type:'micro',action}}
  return null;
 }
 canTravel(now,idle){return idle>18000&&now-this.lastTravel>profiles[this.mode].travel}
 travelled(now){this.lastTravel=now;this.reset(now)}
 speech(now,idle,lines){if(now<45000||idle<22000||now-this.lastSpeech<110000||this.speeches>=3)return null;const available=lines.filter(x=>!this.speechRecent.includes(x));if(!available.length)return null;return available[Math.floor(this.random()*available.length)]}
 spoken(text,now){this.lastSpeech=now;this.speeches++;this.speechRecent.push(text)}
 snapshot(){return{mode:this.mode,context:this.context,pose:this.current,recent:[...this.recent],nextMicro:this.nextMicro,nextSmall:this.nextSmall,speeches:this.speeches,paused:this.paused}}
}
