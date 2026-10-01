'use strict';
// Event-pattern classifier, not an accumulated-distance gate. Hardware labels are estimates.
class SectionIntent {
  static profiles = {
    light: {noise:.65, impulse:5, pair:1.3, velocity:.055, release:125},
    balanced: {noise:.9, impulse:9, pair:2, velocity:.08, release:145},
    firm: {noise:1.2, impulse:15, pair:3.5, velocity:.12, release:165}
  };
  constructor(mode='balanced') {this.mode=mode;this.reset();}
  reset() {this.last=-Infinity;this.samples=[];this.used=false;this.direction=0;this.peak=0;this.type='unknown';}
  feed(delta, time, {locked=false, unit=0}={}) {
    const p=SectionIntent.profiles[this.mode],mag=Math.abs(delta),dir=Math.sign(delta),gap=time-this.last,prev=this.samples.at(-1);
    if (!mag) return {direction:0,reason:'zero',type:this.type};
    this.type=unit?'mouse notch':Number.isInteger(mag)&&mag>=80?'wheel / strong impulse':mag<18?'trackpad / high-resolution wheel':'trackpad / wheel';
    const reversed=this.direction&&dir!==this.direction;
    const silent=gap>p.release;
    const recent=this.samples.slice(-2);
    const valley=recent.length>=2&&recent.every(s=>s.mag<Math.max(3,this.peak*.22));
    const renewed=valley&&prev&&mag>=Math.max(p.impulse,prev.mag*3)&&mag>prev.mag+3;
    if(!locked&&(silent||reversed||renewed)) {this.used=false;if(silent||reversed){this.samples=[];this.peak=0;}}
    const last=this.samples.at(-1),dt=last?time-last.time:Infinity;
    this.last=time;this.samples.push({mag,dir,time});this.samples=this.samples.slice(-6);this.peak=Math.max(this.peak,mag);
    if(locked){this.used=true;return {direction:0,reason:'travel lock',type:this.type};}
    if(mag<p.noise)return {direction:0,reason:'noise',type:this.type};
    if(this.used)return {direction:0,reason:'momentum tail',type:this.type};
    const impulse=unit!==0||mag>=p.impulse;
    const pair=last&&last.dir===dir&&dt>0&&dt<=70&&last.mag>=p.noise&&mag>=p.pair&&mag/dt>=p.velocity&&mag>=last.mag*.78;
    if(!impulse&&!pair)return {direction:0,reason:'observing onset',type:this.type};
    this.used=true;this.direction=dir;
    return {direction:dir,reason:reversed?'reversal':renewed?'renewed impulse':impulse?'clear impulse':'coherent pair',type:this.type};
  }
}
if(typeof module!=='undefined')module.exports=SectionIntent;
