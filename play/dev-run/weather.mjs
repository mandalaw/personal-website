import { STAGES, FINISH } from './course.mjs?v=1b77db058418';
const clamp=x=>Math.max(0,Math.min(1,x)), ease=x=>{x=clamp(x);return x*x*(3-2*x)}, lerp=(a,b,t)=>a+(b-a)*t;
export const tint=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(lerp(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),clamp(t))).toString(16).padStart(2,'0')).join('');
const base={sun:0,moon:0,night:0,cloud:.2,rain:0,snow:0,fog:0,wet:0,wind:.2,indoor:0,warm:0};
const cue=(stage,part,name,state)=>Object.freeze({x:STAGES[stage].start+(STAGES[stage].end-STAGES[stage].start)*part,name,...base,...state});
// Distance-authored beats: weather advances during the existing trip, never on a waiting timer.
export const WEATHER_CUES=Object.freeze([
 cue(0,0,'Winter morning',{sun:.9,cloud:.2,wind:.16}),
 cue(1,.35,'Cloud over the rooftops',{sun:.25,cloud:.8,snow:.16,wind:.35}),
 cue(2,.30,'Toronto snowfall',{cloud:1,snow:1,wet:.5,wind:.45,fog:.16}),
 cue(3,.05,'Covered transit',{cloud:.8,snow:.2,wet:.5,indoor:1,wind:.3}),
 cue(4,.4,'Inside the map',{night:.25,cloud:.5,indoor:1,wet:.12}),
 cue(5,.5,'Westbound light',{sun:.5,night:.12,cloud:.4,warm:.85,wind:.3}),
 cue(6,.22,'Bay fog at sundown',{sun:.5,cloud:.7,fog:.65,warm:.9,wind:.38,wet:.2}),
 cue(7,.30,'Coastal rain',{moon:.22,night:.65,cloud:1,rain:1,wet:1,wind:.75,warm:.2}),
 cue(8,.25,'Moon over the bridge',{moon:1,night:1,cloud:.4,rain:.12,wet:.85,wind:.4,fog:.16}),
 cue(9,.3,'Night deployment',{moon:1,night:1,cloud:.3,wet:.5,wind:.24}),
 cue(10,.2,'Welcome light',{sun:.8,moon:.12,night:.2,cloud:.25,wet:.3,warm:1,wind:.12}),
 Object.freeze({x:FINISH,name:'A clear arrival',...base,sun:.95,warm:.85,wet:.2,wind:.12})
]);
export function weatherState(distance, reduced=false){
 let a=WEATHER_CUES[0],b=a;
 for(let i=1;i<WEATHER_CUES.length;i++){b=WEATHER_CUES[i];if(distance<=b.x)break;a=b;}
 const t=ease((distance-a.x)/Math.max(1,b.x-a.x)),out={name:t<.5?a.name:b.name,reduced};
 for(const k of Object.keys(base))out[k]=lerp(a[k],b[k],t);
 out.accumulation=out.snow*6;out.shadow=.13+.09*out.sun-.025*out.cloud;return out;
}
export function weatherBudget(mobile=false,reduced=false){return Object.freeze({rain:reduced?0:mobile?36:82,snow:reduced?0:mobile?24:58,clouds:mobile?5:8,grass:reduced?0:mobile?12:24});}
const mod=(x,n)=>((x%n)+n)%n;
export class Atmosphere {
 constructor(){this.lastCounts={rain:0,snow:0,clouds:0};}
 sky(c,w,state,time,camera,mobile){
  const s=state,b=weatherBudget(mobile,s.reduced),t=s.reduced?0:time;
  const upper=tint(tint('#829fab','#b67f79',s.warm*.65),'#15243e',s.night),lower=tint(tint('#d2d9c9','#edbf91',s.warm),'#63738c',s.night*.85);
  const sky=c.createLinearGradient(0,0,0,400);sky.addColorStop(0,upper);sky.addColorStop(1,lower);c.fillStyle=sky;c.fillRect(0,0,w,540);
  const celestial=(x,y,r,alpha,moon)=>{if(alpha<.01)return;c.save();c.globalAlpha=alpha*(1-s.indoor);const glow=c.createRadialGradient(x,y,r*.3,x,y,r*3.5);glow.addColorStop(0,moon?'#dce9fb66':'#ffcf9566');glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(x-r*4,y-r*4,r*8,r*8);c.fillStyle=moon?'#e0e8e8':'#ffe0a3';c.beginPath();c.arc(x,y,r,0,7);c.fill();if(moon){c.fillStyle='#8096ad55';for(let i=0;i<5;i++){c.beginPath();c.arc(x-10+i*4,y-8+(i%2)*13,2+i%3,0,7);c.fill();}}c.restore()};
  celestial(w*.24,90+s.warm*44,30,s.sun*(1-s.cloud*.45),false);celestial(w*.74,78,23,s.moon,true);
  if(s.night>.4){c.fillStyle=`rgba(224,236,243,${(s.night-.4)*.55*(1-s.cloud*.6)*(1-s.indoor)})`;for(let i=0;i<(mobile?14:28);i++)c.fillRect(mod(i*137.73,w),22+mod(i*47,157),1.3,1.3);}
  c.save();c.globalAlpha=(.13+s.cloud*.3)*(1-s.indoor);
  for(let i=0;i<b.clouds;i++){const depth=i%3, x=mod(i*231.7-camera*(.018+depth*.015)+t*s.wind*(2+depth),w+440)-220,y=38+depth*36+(i%2)*11;c.fillStyle=tint('#e6e8dc','#6c8096',s.night*.7+s.rain*.15);c.beginPath();c.ellipse(x,y,80+(i%4)*23,10+depth*4,0,0,7);c.ellipse(x+36,y-9,60,17+depth*2,0,0,7);c.ellipse(x-31,y-3,45,16,0,0,7);c.fill();}c.restore();this.lastCounts.clouds=b.clouds;
 }
 veil(c,w,s){if(s.indoor>.85)return;const g=c.createLinearGradient(0,100,0,390);g.addColorStop(0,'#adbec900');g.addColorStop(1,`rgba(172,193,202,${s.fog*.24})`);c.fillStyle=g;c.fillRect(0,100,w,290);}
 precipitation(c,w,s,time,camera,ground,mobile){
  const b=weatherBudget(mobile,s.reduced),clock=s.reduced?0:time, exposure=1-s.indoor;
  this.lastCounts.rain=Math.floor(b.rain*s.rain*exposure);this.lastCounts.snow=Math.floor(b.snow*s.snow*exposure);
  c.save();c.beginPath();c.moveTo(0,-120);c.lineTo(w,-120);for(let x=w;x>=0;x-=20)c.lineTo(x,ground(x)+2);c.closePath();c.clip();
  for(let i=0;i<this.lastCounts.rain;i++){const depth=i%3,x=mod(i*97.13+clock*(26+s.wind*40)-camera*.04,w+60)-30,y=mod(i*73.7+clock*(150+depth*63),570)-60;c.strokeStyle=`rgba(187,211,225,${.15+depth*.06})`;c.lineWidth=.7+depth*.25;c.beginPath();c.moveTo(x,y);c.lineTo(x+s.wind*5,y+8+depth*3);c.stroke();}
  for(let i=0;i<this.lastCounts.snow;i++){const depth=i%3,x=mod(i*113.71+clock*s.wind*21+Math.sin(clock*.5+i)*7-camera*.035,w+30)-15,y=mod(i*61.7+clock*(16+depth*11),540)-30;c.fillStyle=`rgba(235,242,240,${.34+depth*.1})`;c.beginPath();c.arc(x,y,.7+depth*.6,0,7);c.fill();}c.restore();
 }
}
