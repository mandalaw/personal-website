import { shoe } from './footwear.mjs?v=5c81a98406d8';
import { material } from './palette.mjs?v=dd92ec3032ad';
// Original joint choreography. Rigid torso/head; articulated limbs, never silhouette scaling.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
export const SLIDE_VARIANTS=Object.freeze({A:{drop:96,lean:55,lead:270,trail:143}});
export function slideBody(progress,variant='A'){
 const p=clamp(progress),v=SLIDE_VARIANTS[variant]||SLIDE_VARIANTS.A;
 const down=ease(p/.2),up=ease((p-.69)/.31),weight=down*(1-up);
 const plant=ease((p-.6)/.19)*(1-ease((p-.88)/.12));
 return {progress:p,weight,hipX:170-22*weight+plant*13,hipY:195+v.drop*weight,
 lean:6+(v.lean-6)*weight-plant*8,leadX:mix(182,v.lead,weight)-plant*18,
 trailX:mix(148,v.trail,weight),kneeLeadX:mix(179,224,weight),kneeLeadY:mix(277,332,weight),
 kneeTrailX:mix(151,109,weight),kneeTrailY:mix(277,337,weight),footY:369,plant,
 bagLag:Math.sin(p*Math.PI)*5,head:-9*weight};
}
export function slideContact(player){return{active:!!player.slidePhase&&player.grounded&&player.slideAge>.1&&player.slidePhase!=='recover',offset:(slideBody((player.slideAge||0)/(player.slideDuration||.9)).trailX-171)*145/390,ground:player.y,snow:player.surface==='snow',strength:clamp(Math.abs(player.vx||0)/260)}};
export function slideArtwork(progress,variant,{part,bag,armTo}){
 const b=slideBody(progress,variant),limb=(h,k,a,color)=>`<path d="M${h[0]} ${h[1]} L${k[0]} ${k[1]} L${a[0]} ${a[1]}" fill="none" stroke="${color}" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>`;
 return `<g data-leg="rear">`+limb([b.hipX-13,b.hipY],[b.kneeTrailX,b.kneeTrailY],[b.trailX,359],material('pants'))+shoe('rear',b.trailX+3,371,0,.86)+`</g><g data-leg="front">`+limb([b.hipX+13,b.hipY],[b.kneeLeadX,b.kneeLeadY],[b.leadX,359],material('pants'))+shoe('front',b.leadX+3,371,0,.86)+`</g><g transform="translate(${b.hipX-170} ${b.hipY-195}) rotate(${b.lean} 170 195)">${bag(-b.bagLag,-b.bagLag,-b.bagLag)}${part('torso')}${part('head',`rotate(${b.head} 170 65)`)}${armTo(132-25*b.weight,177-18*b.weight)}${armTo(207+25*b.weight,177-33*b.weight,'right')}</g>`;
}
