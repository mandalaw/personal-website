'use strict';
// Deterministic gesture ownership. DOM/animation are handled by section-scroll.js.
class SectionIntent {
  constructor({threshold=18,quiet=220,afterArrival=80}={}) {
    this.threshold=threshold;this.quiet=quiet;this.afterArrival=afterArrival;
    this.phase='IDLE_LOCKED';this.lastInput=-Infinity;this.arrived=-Infinity;
    this.accum=0;this.direction=0;this.touchActive=false;this.nativeGesture=false;
  }
  advance(now) {
    if(this.touchActive)return;
    if(this.phase==='MOMENTUM_GUARD'&&now-this.lastInput>=this.quiet&&now-this.arrived>=this.afterArrival)this.reset();
    else if(this.phase!=='TRANSITIONING'&&now-this.lastInput>=this.quiet){this.nativeGesture=false;if(this.phase==='GESTURE_DETECTED')this.reset();}
  }
  reset(){this.phase='IDLE_LOCKED';this.accum=0;this.direction=0;this.nativeGesture=false;}
  feed(delta,now,{unit=0}={}) {
    this.advance(now);const direction=Math.sign(delta);if(!direction)return {commit:false,reason:'zero'};
    this.lastInput=now;
    if(this.phase==='TRANSITIONING'||this.phase==='MOMENTUM_GUARD')return {commit:false,reason:'owned-gesture'};
    if(this.nativeGesture)return {commit:false,reason:'native-boundary-tail'};
    if(Math.abs(delta)<.5)return {commit:false,reason:'noise'};
    if(this.direction&&direction!==this.direction)this.accum=0;
    this.direction=direction;this.accum+=delta;this.phase='GESTURE_DETECTED';
    if(unit===0&&Math.abs(this.accum)<this.threshold)return {commit:false,reason:'threshold'};
    this.begin(direction,now);return {commit:true,direction,reason:'deliberate-onset'};
  }
  begin(direction,now){this.phase='TRANSITIONING';this.direction=direction;this.lastInput=now;this.accum=0;this.nativeGesture=false;}
  arrive(now){this.phase='MOMENTUM_GUARD';this.arrived=now;}
  observeNative(now){this.advance(now);this.nativeGesture=true;this.lastInput=now;}
  release(now){this.touchActive=false;this.lastInput=now;}
  remaining(now){return Math.max(0,this.quiet-(now-this.lastInput),this.phase==='MOMENTUM_GUARD'?this.afterArrival-(now-this.arrived):0);}
  static touchDirection(dx,dy,elapsed){
    if(Math.abs(dx)>Math.abs(dy)*1.15)return 0;
    const distance=Math.abs(dy),velocity=distance/Math.max(1,elapsed);
    return distance>=32||(distance>=18&&velocity>=.45)?Math.sign(dy):0;
  }
}
if(typeof module!=='undefined')module.exports=SectionIntent;
