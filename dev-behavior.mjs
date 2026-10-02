import {scenes,sceneNames} from './dev-scenes.mjs?v=62c6a5a4cb32';
export const profiles=Object.freeze({
 CALM:{micro:[2800,4600],small:[12000,18000],scene:[60000,90000],firstScene:30000,chair:100000,first:20000,speech:[55000,80000],cap:4},
 ALIVE:{micro:[1250,2100],small:[5000,8200],scene:[35000,50000],firstScene:16000,chair:75000,first:16000,speech:[35000,55000],cap:6},
 LIVE:{micro:[800,1200],small:[1800,3200],scene:[4500,8500],firstScene:2500,chair:34000,first:5500,speech:[14000,26000],cap:16},
 MAX:{micro:[700,1000],small:[1600,2700],scene:[2500,5500],firstScene:1500,chair:27000,first:6500,speech:[18000,26000],cap:14}
});
export const cadences=Object.freeze({PASS20:{first:7500,speech:[18000,32000],cap:12,idle:6500},FASTER:{first:5500,speech:[14000,26000],cap:16,idle:4500},VERY_ACTIVE:{first:4500,speech:[12000,22000],cap:18,idle:4000}});
const microBank=['glance','nod','hand-adjust','toe-tap','weight','prop-check'];
export class Behavior {
 constructor(now=0,random=Math.random){this.random=random;this.mode='LIVE';this.cadence='FASTER';this.born=now;this.recent=[];this.sceneRecent=[];this.microRecent=[];this.propRecent=[];this.speechRecent=[];this.facingRecent=[];this.targetRecent=[];this.anchorRecent=[];this.comboRecent=[];this.lastScenes=new Map();this.speeches=0;this.facing='FACING_RIGHT';this.lastChair=-Infinity;this.reset(now);this.nextScene=now+profiles.LIVE.firstScene;this.nextSpeech=now+profiles.LIVE.first}
 speechProfile(){return this.mode==='LIVE'?cadences[this.cadence]:{...profiles[this.mode],idle:6500}}
 configureCadence(name,now){if(!cadences[name])return;this.cadence=name;this.nextSpeech=now+this.speechProfile().first}
 between([a,b]){return a+this.random()*(b-a)}
 rememberList(list,value,max=7){list.push(value);if(list.length>max)list.splice(0,list.length-max)}
 choose(items,recent=[]){const fresh=items.filter(x=>!recent.slice(-Math.min(3,items.length-1)).includes(x));const list=fresh.length?fresh:items;return list[Math.floor(this.random()*list.length)]}
 reset(now){const p=profiles[this.mode];this.nextMicro=now+this.between(p.micro);this.nextSmall=now+this.between(p.small)}
 configure(mode,now){if(!profiles[mode])return;this.mode=mode;this.reset(now);this.nextScene=now+profiles[mode].firstScene;this.nextSpeech=now+profiles[mode].first}
 micro(now,{soft=false}={}){if(now<this.nextMicro)return null;const action=this.choose(soft?['glance','breathe','nod']:microBank,this.microRecent);this.rememberList(this.microRecent,action,4);this.nextMicro=now+this.between(soft?[1800,2600]:profiles[this.mode].micro);return action}
 small(now){if(now<this.nextSmall)return null;this.nextSmall=now+this.between(profiles[this.mode].small);return this.choose(['point','wave','look','turn','peek'],this.recent)}
 scene(now,context,canWalk,visibleTargets=[]){if(now<this.nextScene||!canWalk)return null;const p=profiles[this.mode],eligible=sceneNames.filter(n=>scenes[n].contexts.includes(context)&&(!scenes[n].requires||scenes[n].requires.every(id=>visibleTargets.includes(id)))&&now-(this.lastScenes.get(n)??-Infinity)>=scenes[n].cooldown);
  if(!eligible.length)return null;
  if(eligible.includes('CHAIR_BREAK')&&this.sceneRecent.at(-1)!=='CHAIR_BREAK'&&now-this.lastChair>=p.chair)return 'CHAIR_BREAK';
  return this.choose(eligible.filter(n=>n!=='CHAIR_BREAK'),this.sceneRecent)||'WALK_AND_WAVE';
 }
 started(name,now){this.lastScenes.set(name,now);if(name==='CHAIR_BREAK')this.lastChair=now;this.rememberList(this.sceneRecent,name,5);this.nextScene=Infinity}
 completed(now){this.nextScene=now+this.between(profiles[this.mode].scene);this.nextSmall=now+2200}
 interrupted(now){this.nextScene=Math.min(this.nextScene,now+2400)}
 remember(pose){this.rememberList(this.recent,pose,8);const prop=/chair/.test(pose)?'chair':/map|document|laptop|camera|coffee|terminal|tablet|game|archive|envelope|cable|database/.exec(pose)?.[0];if(prop)this.rememberList(this.propRecent,prop,5);this.rememberList(this.comboRecent,pose+':'+this.facing,8)}
 faced(direction,now){this.facing=direction;this.rememberList(this.facingRecent,{direction,at:now},12)}
 speech(now,idle,bank){const p=this.speechProfile();if(now<this.nextSpeech||idle<p.idle||this.speeches>=p.cap)return null;const fresh=bank.filter(x=>!this.speechRecent.includes(x.text));return fresh.length?this.choose(fresh):null}
 spoken(item,now){this.speeches++;this.nextSpeech=now+this.between(this.speechProfile().speech);this.rememberList(this.speechRecent,item.text,24)}
 snapshot(){return {mode:this.mode,cadence:this.cadence,speechCap:this.speechProfile().cap,recent:this.recent,scenes:this.sceneRecent,props:this.propRecent,facing:this.facing,facingRecent:this.facingRecent,targets:this.targetRecent,anchors:this.anchorRecent,speeches:this.speeches,nextScene:this.nextScene,nextMicro:this.nextMicro}}
}
