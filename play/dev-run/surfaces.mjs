import { STAGES } from './course.mjs?v=1b77db058418';
import { tint, weatherBudget } from './weather.mjs?v=c2b8070f8516';
export const MATERIALS=Object.freeze({
 concrete:{top:'#84918d',side:'#4f6267',grain:'#c4ccc0'},asphalt:{top:'#59676e',side:'#334953',grain:'#909a97'},rooftop:{top:'#69767c',side:'#3a515d',grain:'#adbbb8'},station:{top:'#89928e',side:'#465861',grain:'#d4cbb2'},pavers:{top:'#937a6e',side:'#5d5957',grain:'#c0ad98'},snow:{top:'#d8e1dc',side:'#6b8089',grain:'#f0f2e7'},soil:{top:'#927e5f',side:'#63594a',grain:'#b9a47d'},gravel:{top:'#7e847a',side:'#515f5a',grain:'#b6b5a1'},bridge:{top:'#7c888e',side:'#435c6c',grain:'#c3c4b3'}
});
export const SURFACE_MAP=Object.freeze({first:'concrete',roofs:'rooftop',snow:'snow',rush:'station',grid:'pavers',cross:'gravel',fog:'asphalt',hills:'soil',bridge:'bridge',deploy:'concrete',finish:'pavers'});
export const surfaceAt=x=>{const stage=STAGES.find(s=>x<s.end)||STAGES.at(-1);return {stage:stage.index,region:stage.index<5?'Toronto':stage.index<6?'Travel':'Bay',material:SURFACE_MAP[stage.id]||'concrete'};};
export function random(seed){let n=(seed^0x9e3779b9)>>>0;return()=>{n=Math.imul(n^n>>>16,0x21f0aaad);n=Math.imul(n^n>>>15,0x735a2d97);return((n^n>>>15)>>>0)/4294967296;};}
export class SurfaceRenderer{
 constructor(){this.cache=new Map();this.tracks=[];this.lastStep=-1;this.metrics={tiles:0,grass:0,tracks:0};}
 tile(material,id,mobile){const key=material+':'+id+':'+mobile;if(this.cache.has(key))return this.cache.get(key);const a=document.createElement('canvas');a.width=192;a.height=156;const c=a.getContext('2d'),m=MATERIALS[material],rng=random(id*97+material.length*631);const g=c.createLinearGradient(0,0,0,156);g.addColorStop(0,m.top);g.addColorStop(.18,m.side);g.addColorStop(1,tint(m.side,'#1a2934',.36));c.fillStyle=g;c.fillRect(0,0,192,156);
 const earthy=['soil','gravel'].includes(material);c.fillStyle=m.grain;for(let i=0;i<(mobile?27:58);i++){const x=rng()*192,y=3+rng()*135;c.globalAlpha=.12+rng()*.18;const size=material==='gravel'?1+rng()*3:.6+rng()*1.6;c.fillRect(x,y,size*(earthy?2:1),size);}c.globalAlpha=1;
 if(!earthy&&material!=='snow'){c.strokeStyle='#243b4866';c.lineWidth=1;const seam=35+rng()*120;c.beginPath();c.moveTo(seam,0);c.lineTo(seam+5,13);c.lineTo(seam+3,48);c.stroke();if(material==='pavers'){for(let i=0;i<4;i++){c.strokeStyle='#403d3d55';c.strokeRect(i*53+(id%2)*10,4,48,15);}}if(['station','bridge'].includes(material)){c.fillStyle=material==='station'?'#c9b384':'#ced1bf';c.fillRect(6,3,180,2);for(let k=0;k<4;k++){c.fillStyle='#263d49';c.beginPath();c.arc(18+k*47,23,1.5,0,7);c.fill();}}if(rng()>.62){c.strokeStyle='#354a5066';c.beginPath();c.moveTo(130,18);c.lineTo(121,32);c.lineTo(127,47);c.lineTo(114,59);c.moveTo(124,40);c.lineTo(143,45);c.stroke();}}
 if(material==='soil'){c.fillStyle='#b29b7544';c.beginPath();c.ellipse(70,17,72,10,.03,0,7);c.fill();}c.fillStyle='#162d3e55';c.fillRect(0,15,192,3);c.fillStyle=m.grain;c.globalAlpha=.38;c.fillRect(0,0,192,2);c.globalAlpha=1;
 // Blend the side-face texture at a material boundary once, inside the cached tile.
 // The top curb remains legible, while the deep face does not become a vertical color wall.
 const previous=surfaceAt(id*192-1).material;
 if(previous!==material){const prior=this.tile(previous,id-1,mobile);for(let k=0;k<64;k++){c.globalAlpha=1-k/64;c.drawImage(prior,128+k,0,1,156,k,0,1,156);}c.globalAlpha=1;}
 if(this.cache.size>=32)this.cache.delete(this.cache.keys().next().value);this.cache.set(key,a);return a;}
 draw(c,w,dist,heroX,ground,state,time,mobile=false){
  const start=dist-heroX,first=Math.floor(start/192),last=Math.ceil((start+w)/192);this.metrics.tiles=0;this.metrics.grass=0;
  c.save();c.beginPath();c.moveTo(0,ground(0));for(let x=0;x<=w+20;x+=20)c.lineTo(x,ground(x));c.lineTo(w,800);c.lineTo(0,800);c.closePath();c.clip();
  c.fillStyle=tint('#425d66','#273a51',state.night*.5);c.fillRect(0,300,w,500);
  for(let i=first;i<=last;i++){const x=i*192-start,y=ground(x),s=surfaceAt(i*192+96),m=MATERIALS[s.material],slope=Math.atan2(ground(x+192)-y,192),rng=random(i*71);c.save();c.translate(x,y);c.rotate(slope);c.drawImage(this.tile(s.material,i,mobile),0,0,195,156);this.metrics.tiles++;
   c.fillStyle=`rgba(20,38,60,${state.night*.23+state.wet*.19})`;c.fillRect(0,0,195,155);
   if(state.sun>.2){c.fillStyle=`rgba(241,207,156,${state.sun*.09})`;c.fillRect(0,0,195,9);}
   if(state.wet>.2&&!['soil','gravel','snow'].includes(s.material)){const px=22+rng()*82,py=18+rng()*19;c.fillStyle=`rgba(153,181,193,${state.wet*.19})`;c.beginPath();c.ellipse(px,py,21+rng()*32,2.6,0,0,7);c.fill();c.strokeStyle=`rgba(212,225,223,${state.wet*.22})`;c.lineWidth=.7;c.beginPath();c.moveTo(px-16,py);c.lineTo(px+12,py);c.stroke();if(state.rain>.15&&!state.reduced){const phase=(time*1.3+(i%13)/13)%1;c.globalAlpha=(1-phase)*state.rain*.28;c.beginPath();c.ellipse(px+7,py,phase*12,phase*2.5,0,0,7);c.stroke();c.globalAlpha=1;}}
   if(s.material==='snow'){c.fillStyle=tint('#e9eee4','#aabfd4',state.night*.5);c.beginPath();c.moveTo(0,0);for(let xx=0;xx<=195;xx+=13)c.lineTo(xx,3+rng()*4);c.lineTo(195,0);c.fill();c.fillStyle='#92a5a677';for(let k=0;k<8;k++){const xx=rng()*192;c.beginPath();c.ellipse(xx,7+rng()*6,4+rng()*7,1.4,0,0,7);c.fill();}}
   // Recessed soil verge, not blades scattered across the walking lane.
   if(x>-180&&x<w&&this.metrics.grass<weatherBudget(mobile,false).grass&&(['soil','gravel'].includes(s.material)||(s.material==='concrete'&&i%4===0))){const vx=22+rng()*100,root=22+rng()*15;c.fillStyle=tint('#6d7050','#354759',state.night*.4);c.beginPath();c.moveTo(vx-6,root+2);c.quadraticCurveTo(vx+13,root-4,vx+32,root+1);c.lineTo(vx+40,root+5);c.quadraticCurveTo(vx+14,root+10,vx-6,root+2);c.fill();const n=mobile?5:8;for(let k=0;k<n&&this.metrics.grass<weatherBudget(mobile,false).grass;k++){const gx=vx+k*(3+rng()*2),height=5+rng()*10,wind=state.reduced?0:Math.sin(time*1.8+i*.7+k*.15)*state.wind*3;c.strokeStyle=tint(k%3?'#9ea87c':'#b8b087','#8495a0',state.night*.4);c.lineWidth=1.2;c.beginPath();c.moveTo(gx,root);c.quadraticCurveTo(gx+wind,root-height*.5,gx-3+wind,root-height);c.stroke();this.metrics.grass++;}}
   if(surfaceAt(i*192-1).material!==s.material){c.fillStyle='#b7b6a077';c.beginPath();c.moveTo(0,1);c.lineTo(12,3);c.lineTo(8,15);c.lineTo(0,20);c.fill();c.fillStyle='#273e4855';c.fillRect(8,16,3,34);}
   c.restore();
  }c.restore();this.metrics.tracks=this.tracks.length;
 }
 platform(c,p,x,state){c.save();c.fillStyle=tint('#49616a','#293d53',state.night*.45);c.fillRect(x,p.y+3,p.w,12);c.fillStyle=state.snow>.4?'#dee7e4':tint('#a0b1ad','#7993ad',state.night*.4);c.fillRect(x,p.y,p.w,3);c.fillStyle='#203b4855';c.fillRect(x+2,p.y+12,p.w-4,3);c.strokeStyle='#c0c8bc66';c.lineWidth=1;for(let xx=x+24;xx<x+p.w-8;xx+=43){c.beginPath();c.moveTo(xx,p.y+3);c.lineTo(xx,p.y+11);c.stroke();}c.restore();}
 contact(c,game,heroX,ground,state,time,contact,reduced){
  const material=surfaceAt(game.distance).material,snow=material==='snow',wet=state.wet>.45&&!['soil','gravel'].includes(material);const step=Math.floor(game.player.runDistance/33);
  if(game.player.grounded&&Math.abs(game.player.vx)>45&&step!==this.lastStep&&!contact.active){this.lastStep=step;if(snow||wet)this.tracks.push({x:game.distance,y:game.player.y,age:time,wet});}
  this.tracks=this.tracks.filter(p=>time-p.age<5&&Math.abs(p.x-game.distance)<1800).slice(-32);
  for(const p of this.tracks){const x=heroX+p.x-game.distance;c.fillStyle=p.wet?'#b5cccf20':'#69879666';c.globalAlpha=Math.max(0,1-(time-p.age)/5);c.beginPath();c.ellipse(x,p.y+3,4,1.3,0,0,7);c.fill();}c.globalAlpha=1;
  if(!contact.active)return;const x=heroX+contact.offset*game.player.facing;const col=snow?'#e3ece2':wet?'#a3c5d1':'#bda484';c.strokeStyle=col+'88';c.lineWidth=1.5;c.beginPath();c.moveTo(x-game.player.facing*36*contact.strength,game.player.y+2);c.lineTo(x,game.player.y+2);c.stroke();if(reduced)return;
  for(let i=0;i<(wet?3:5);i++){const age=(game.player.slideAge*2+i/5)%1;c.fillStyle=col+'88';c.fillRect(x-game.player.facing*age*30*contact.strength,game.player.y-Math.sin(age*3)* (snow?8:wet?4:6),wet?1:2,wet?3:2);}
 }
}
