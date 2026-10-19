'use strict';
// Wheel intent is separate from animation ownership. Wheel events have no physical gesture ID.
class SectionIntent {
 constructor({threshold=18,quiet=180}={}){this.threshold=threshold;this.quiet=quiet;this.phase='IDLE_LOCKED';this.lastInput=-Infinity;this.lastMeaningful=-Infinity;this.arrived=-Infinity;this.touchActive=false;this.nativeGesture=false;this.gesture=0;this.burst=null;this.probe=null;}
 reset(){this.phase='IDLE_LOCKED';this.burst=null;this.probe=null;this.nativeGesture=false;this.lastMeaningful=-Infinity;}
 advance(at){if(this.phase!=='TRANSITIONING'&&at-this.lastMeaningful>=this.quiet){this.phase='IDLE_LOCKED';this.nativeGesture=false;}}
 feed(delta,at,{unit=0,native=false}={}){
  const sign=Math.sign(delta),mag=Math.abs(delta),gap=at-this.lastMeaningful;this.lastInput=at;
  if(mag<.5)return {commit:false,reason:'noise'}; // Noise cannot prolong ownership.
  this.lastMeaningful=at;this.advance(at);
  let b=this.burst;
  const onset=!b||gap>=this.quiet;
  const discrete=unit!==0||(b&&mag>=40&&Number.isInteger(mag)&&mag===b.last&&gap>=90);
  let reason=onset?'new-onset':null;
  if(!onset&&discrete&&at-b.acceptedAt>=90)reason='discrete-wheel';
  if(!onset&&!reason&&sign!==b.direction)reason='reversal';
  if(!onset&&!reason&&b.committed&&at-b.acceptedAt>=80&&
    ((b.falls>=3&&b.trough<=b.peak*.35)||gap>=90)&&mag>=Math.max(12,b.trough*1.7+2))reason='renewed-impulse';
  if(onset){b=this.burst={direction:sign,sum:0,last:mag,peak:mag,trough:mag,falls:0,committed:false,acceptedAt:-Infinity};this.probe=null;}
  if(reason&&reason!=='new-onset'){
   if(!this.probe||this.probe.direction!==sign||at-this.probe.lastAt>70||this.probe.reason!==reason)this.probe={direction:sign,sum:0,count:0,lastAt:at,reason,floor:b.trough};
   const p=this.probe;p.sum+=mag;p.count++;p.lastAt=at;
   const confirmed=reason==='discrete-wheel'||(reason==='reversal'?(p.sum>=24&&(p.count>=2||mag>=32)):(p.sum>=28&&p.count>=2));
   if(confirmed){b=this.burst={direction:sign,sum:mag,last:mag,peak:mag,trough:mag,falls:0,committed:false,acceptedAt:-Infinity};this.probe=null;return this.accept(b,at,native,reason);}
   b.last=mag;return {commit:false,reason:'confirm-'+reason};
  }
  // Continue a rising candidate on its second sample, even if the first rise updated last.
  if(this.probe&&at-this.probe.lastAt<=70&&sign===this.probe.direction&&mag>=Math.max(8,this.probe.floor*1.5)){
   const p=this.probe;p.sum+=mag;p.count++;p.lastAt=at;
   if(p.sum>=28&&p.count>=2){b=this.burst={direction:sign,sum:mag,last:mag,peak:mag,trough:mag,falls:0,committed:false,acceptedAt:-Infinity};this.probe=null;return this.accept(b,at,native,p.reason);}
  }else this.probe=null;
  // Once native reading owns a meaningful event, its boundary tail stays consumed.
  if(native&&!b.committed)return this.accept(b,at,true,'native-reading');
  if(!b.committed){if(sign!==b.direction){b.direction=sign;b.sum=0;}b.sum+=mag;if(unit!==0||b.sum>=this.threshold)return this.accept(b,at,native,'deliberate-onset');}
  if(mag>b.peak){const valley=b.falls>=3&&b.trough<=b.peak*.35;b.peak=mag;if(!valley){b.trough=mag;b.falls=0;}}else{if(mag<b.last-.5)b.falls++;b.trough=Math.min(b.trough,mag);}
  b.last=mag;return {commit:false,reason:b.committed?(native?'native-reading':'momentum-tail'):'threshold'};
 }
 accept(b,at,native,reason){b.committed=true;b.acceptedAt=at;b.sum=0;this.gesture++;this.nativeGesture=native;return {commit:!native,native,direction:b.direction,gesture:this.gesture,reason:native?'native-reading':reason};}
 begin(direction,at){this.phase='TRANSITIONING';this.direction=direction;this.lastInput=at;}
 arrive(at){this.phase='MOMENTUM_GUARD';this.arrived=at;}
 observeNative(at){this.nativeGesture=true;this.lastInput=at;}
 release(at){this.touchActive=false;}
 remaining(at){return Math.max(0,this.quiet-(at-this.lastMeaningful));}
 static touchDirection(dx,dy,elapsed){if(Math.abs(dx)>Math.abs(dy)*1.15)return 0;const distance=Math.abs(dy),velocity=distance/Math.max(1,elapsed);return distance>=32||(distance>=18&&velocity>=.45)?Math.sign(dy):0;}
}
if(typeof module!=='undefined')module.exports=SectionIntent;

class TouchIntent {
 constructor(x,y,at){this.x=x;this.y=y;this.at=at;this.axis=null;this.committed=false;this.reading=false;this.canceled=false;}
 cancel(){this.canceled=true;}
 move(x,y,at){
  const dx=x-this.x,dy=this.y-y;
  if(this.canceled||this.axis==='horizontal')return {native:true,reason:'delegated'};
  if(!this.axis&&Math.abs(dx)>Math.abs(dy)*1.15&&Math.abs(dx)>6){this.axis='horizontal';return {native:true,reason:'horizontal'};}
  if(!dy||Math.abs(dx)>Math.abs(dy))return {native:true,reason:'undecided'};
  this.axis='vertical';if(this.committed)return {commit:false,reason:'same-contact'};
  const direction=SectionIntent.touchDirection(dx,dy,at-this.at);
  if(!direction)return {commit:false,reason:'below-threshold'};
  this.committed=true;return {commit:true,direction,reason:'intentional-contact'};
 }
}
if(typeof module!=='undefined')module.exports.TouchIntent=TouchIntent;
