// One clock chooses authored actions. Navigation and rendering keep their own jobs.
export const vocabularies=Object.freeze({
 ENTRY_A:['stand','sit','pockets','curious','hands-on-hips','look-up','lean'],
 ENTRY_B:['workbench','sit-laptop','cable','terminal','database','sit-think','laptop-closed'],
 ENTRY_C:['tablet','present','laptop','think','document','arms-crossed'],
 PORTFOLIO:['tablet','present','laptop','curious','think','notebook','peek-right'],
 TRUSTAI:['tablet','terminal','think','laptop','present','document-tuck'],
 GIS:['map-fold','map','notebook','think','tablet','look-up'],
 WORKBENCH:['workbench','terminal','cable','database','sit-laptop','sit-think'],
 ABOUT:['pockets','coffee','sit-read','lean','reading','hands-on-hips'],
 RESUME:['document','handoff','reading','notebook','present','think'],
 CONTACT:['envelope','sit-laptop','plane','coffee','wave','document-tuck'],
 SIDE_QUESTS:['game-piece','game','sit-read','curious','pleased','shrug'],
 VISUALS:['camera','camera-up','camera-review','think','notebook','curious'],
 LOST:['curious','think','look-up','map-fold','pockets','shrug'],
 FOOTER:['sit','sit-read','peek-left','wave','pockets','lean']
});
export const profiles=Object.freeze({
 ALIVE:{micro:[1350,2100],small:[4800,7800],travel:62000,turn:[6500,11000],jump:90000,first:45000,speech:[110000,110000],cap:3},
 'ALIVE+':{micro:[1250,2100],small:[5000,8200],travel:68000,turn:[3500,8000],jump:65000,first:16000,speech:[35000,55000],cap:6},
 MAX:{micro:[1100,1650],small:[3800,5800],travel:50000,turn:[3000,6500],jump:50000,first:12000,speech:[30000,45000],cap:7}
});
const propFamily=pose=>/laptop/.test(pose)?'laptop':/map/.test(pose)?'map':/document|handoff/.test(pose)?'document':/reading|book|sit-read/.test(pose)?'book':/camera/.test(pose)?'camera':/game/.test(pose)?'game':/terminal|workbench/.test(pose)?'code':/plane|envelope/.test(pose)?'mail':['coffee','tablet','cable','database','archive','notebook'].includes(pose)?pose:null;
export class Behavior {
 constructor(now=0,random=Math.random){this.random=random;this.born=now;this.mode='ALIVE+';this.context='ENTRY_A';this.recent=[];this.uses=new Map();this.microRecent=[];this.propRecent=[];this.speechRecent=[];this.facingRecent=[];this.targetRecent=[];this.anchorRecent=[];this.comboRecent=[];this.facing='FACING_RIGHT';this.paused=true;this.reset(now);this.nextTurn=now+this.between(profiles[this.mode].turn);this.lastTravel=now;this.lastJump=now;this.nextSpeech=now+profiles[this.mode].first;this.speeches=0;this.current='stand';}
 between([a,b]){return a+this.random()*(b-a)}
 reset(now){this.nextMicro=now+this.between(profiles[this.mode].micro);this.nextSmall=now+this.between(profiles[this.mode].small)}
 configure(mode,now){if(!profiles[mode])return;this.mode=mode;this.reset(now);this.nextTurn=now+this.between(profiles[mode].turn);this.nextSpeech=Math.max(this.nextSpeech,now+profiles[mode].first)}
 rememberList(list,value,max=7){list.push(value);if(list.length>max)list.shift()}
 choose(pool,history=this.recent){let options=pool.filter(x=>x!==this.current&&!history.slice(-Math.min(3,pool.length-2)).includes(x));if(!options.length)options=pool.filter(x=>x!==this.current);if(!options.length)return pool[0];if(history===this.recent){const fresh=options.filter(x=>!propFamily(x)||!this.propRecent.slice(-2).includes(propFamily(x)));if(fresh.length)options=fresh}const weights=options.map(x=>1/(1+(this.uses.get(x)||0)*.3));let roll=this.random()*weights.reduce((a,b)=>a+b,0);let selected=options.at(-1);for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<=0){selected=options[i];break}}return selected}
 remember(pose){if(pose===this.current)return;this.current=pose;this.rememberList(this.recent,pose);const prop=propFamily(pose);if(prop)this.rememberList(this.propRecent,prop,4);this.rememberList(this.comboRecent,pose+':'+this.facing,8);this.uses.set(pose,(this.uses.get(pose)||0)+1)}
 react(pose,now){this.remember(pose);this.reset(now);this.nextTurn=now+this.between(profiles[this.mode].turn)}
 orient(now,targetFacing=null){if(now<this.nextTurn)return null;this.nextTurn=now+this.between(profiles[this.mode].turn);const next=targetFacing&&this.random()<.7?targetFacing:this.random()<.5?'FACING_LEFT':'FACING_RIGHT';if(next===this.facing)return null;this.faced(next,now);return next}
 faced(direction,now){this.facing=direction;this.rememberList(this.facingRecent,{direction,at:now},12);this.nextTurn=now+this.between(profiles[this.mode].turn)}
 step(now,{context=this.context,locked=false,idle=0,visible=true,reading=false}={}){
  if(locked||!visible||reading){this.paused=true;return null}
  if(this.paused){this.paused=false;this.reset(now);return null}
  if(context!==this.context){this.context=context;this.reset(now);const pose=this.choose(vocabularies[context]||vocabularies.PORTFOLIO);this.remember(pose);return{type:'pose',pose,reason:'context'}}
  if(idle<900)return null;
  if(now>=this.nextSmall&&idle>3000){const pool=vocabularies[context]||vocabularies.PORTFOLIO;let pose=this.choose(pool);if(this.comboRecent.slice(-3).includes(pose+':'+this.facing))pose=this.choose(pool);this.remember(pose);this.nextSmall=now+this.between(profiles[this.mode].small);this.nextMicro=now+1200;return{type:'pose',pose,reason:'idle'}}
  if(now>=this.nextMicro){const action=this.choose(['glance','breathe','settle','prop-check','hand-adjust','toe-tap','weight','look-up'],this.microRecent);this.rememberList(this.microRecent,action,4);this.nextMicro=now+this.between(profiles[this.mode].micro);return{type:'micro',action}}
  return null;
 }
 canTravel(now,idle){return idle>18000&&now-this.lastTravel>profiles[this.mode].travel}
 travelled(now,anchor){this.lastTravel=now;this.reset(now);if(anchor)this.rememberList(this.anchorRecent,anchor,4)}
 canJump(now,idle,context){return this.mode!=='ALIVE'&&idle>22000&&['ENTRY_A','SIDE_QUESTS'].includes(context)&&now-this.lastJump>profiles[this.mode].jump}
 jumped(now){this.lastJump=now;this.reset(now)}
 speech(now,idle,lines){const p=profiles[this.mode];if(now<this.nextSpeech||idle<(this.mode==='ALIVE'?22000:14000)||this.speeches>=p.cap)return null;const available=lines.filter(x=>!this.speechRecent.includes(x));if(!available.length)return null;return available[Math.floor(this.random()*available.length)]}
 spoken(text,now){this.nextSpeech=now+this.between(profiles[this.mode].speech);this.speeches++;this.rememberList(this.speechRecent,text,20)}
 snapshot(){return{mode:this.mode,context:this.context,pose:this.current,facing:this.facing,facingRecent:[...this.facingRecent],recent:[...this.recent],props:[...this.propRecent],targets:[...this.targetRecent],anchors:[...this.anchorRecent],nextMicro:this.nextMicro,nextSmall:this.nextSmall,speeches:this.speeches,paused:this.paused}}
}
