// The complete 23.8 journey remains playable. The default edit changes distance, not running speed.
import * as library from './course-library.mjs?v=3d15474f11f1';
export const {HAZARDS, TOOLS, KITS, SECRETS, seeded} = library;
export const LONG_WAY = new URLSearchParams(globalThis.location?.search || '').get('journey') === 'long-way';
export const JOURNEY = LONG_WAY ? 'long-way' : 'cinematic';
const seconds = [11,16,13,13,15,4,13,12,12,16,5];
const patterns = [['syntax','loop'],['merge','server','null'],['firewall','phishing'],['packet','leak'],['projection','tile'],[],['container','json'],['bug','latency','dns'],['timeout','cloud'],['build','drift','baddeploy'],[]];
// Authored primary patterns; each addition replaces a longer existing sequence.
export const BEATS = Object.freeze([
 {id:'morning-fork',primary:'choose',intensity:1,replaces:'first backward switch and third opening block'},
 {id:'roof-return',primary:'climb-return',intensity:2,replaces:'four evenly spaced rooftop obstacles'},
 {id:'winter-window',primary:'observe-clearance',intensity:3,replaces:'four winter obstacles'},
 {id:'transit-carve',primary:'ride-gap',intensity:3,replaces:'four tunnel obstacles'},
 {id:'map-thread',primary:'precision-platform',intensity:2,replaces:'second identical lift-return routine'},
 {id:'westbound',primary:'travel-reveal',intensity:1,replaces:'ten-second cross-country corridor'},
 {id:'fog-window',primary:'timed-route',intensity:3,replaces:'four fog obstacles and backward switch'},
 {id:'hill-scan',primary:'momentum-scan',intensity:4,replaces:'four downhill obstacles'},
 {id:'cloud-ascent',primary:'moving-lift',intensity:3,replaces:'third identical lift-return routine'},
 {id:'deployment-thread',primary:'fall-slide-swarm',intensity:5,replaces:'seven-obstacle deployment corridor'},
 {id:'welcome-home',primary:'ceremony',intensity:1,replaces:'six-second arrival approach'},
]);
let start=0;
export const STAGES=LONG_WAY?library.STAGES:library.STAGES.map((s,i)=>{const n=Object.freeze({...s,seconds:seconds[i],pattern:patterns[i],start,end:start+seconds[i]*s.speed});start=n.end;return n;});
export const FINISH=STAGES.at(-1).end;
const routes=[
 {kind:'fork',title:'Catwalk or pavement',exit:110,cue:'Jump onto the catwalk, or keep walking along the pavement.'},
 {kind:'lift',title:'The rooftop return',cue:'Climb, then go left to the upper switch. Or duck at the lower switch.'},
 {kind:'ride',title:'TTC slipstream',cue:'Duck to ride beside the train, or jump to take the footpath.'},
 {kind:'precision',title:'Thread the map',exit:230,cue:'Land on the narrow map ledge, or duck through the lower layer.'},
 {kind:'window',title:'A break in the fog',exit:145,cue:'Duck at the green window, or jump onto the lookout.'},
 {kind:'ride',title:'Downhill momentum',cue:'Duck to coast on the laptop, or jump to stay on foot.'},
 {kind:'ascent',title:'Ride the cloud lift',exit:175,cue:'Stand on the lift until the upper light. Or duck through the lower passage.'},
];
export const JUNCTIONS=LONG_WAY?library.JUNCTIONS:library.JUNCTIONS.map((j,i)=>Object.freeze({...j,...routes[i],at:i===0?1.3:j.at}));
export function routeWindow(j,time){return j.kind!=='window'||((time+(j.id??j.stage)*.7)%3.2)<1.65;}
export function makeCourse(seed=23023){
 if(LONG_WAY)return library.makeCourse(seed);
 const random=seeded(seed),hazards=[],pickups=[];let id=0;
 for(const s of STAGES){const j=JUNCTIONS.find(j=>j.stage===s.index),first=j?(j.kind==='lift'?5.3:j.kind==='ride'?3.7:5.3):3.4;
  for(let i=0;i<s.pattern.length;i++){const type=s.pattern[i],kind=HAZARDS[type].kind;
   const time=first+i*(s.seconds-(s.index===0?3.1:s.index===6?2.5:1.65)-first)/Math.max(1,s.pattern.length-1),x=s.start+(time+(random()-.5)*.08)*s.speed;
   const choreography=({merge:'paired-opening',firewall:'barrier-window',packet:'pulse-clearance',container:'modular-step',scanner:'sweep-under',baddeploy:'swarm-vault',drift:'climax-thread'})[type]||BEATS[s.index].primary;
   hazards.push({id:id++,type,x,stage:s.index,width:kind==='gap'?105:52,height:kind==='slide'?50:50,route:null,beat:BEATS[s.index].id+'-'+type,choreography});
   // A mix of low slide rewards, jump arcs and magnetic approach rewards.
   pickups.push({id:pickups.length,x:x+s.speed*(i%2?.55:.85),tool:pickups.length%TOOLS.length,height:kind==='slide'?28:kind==='gap'?130:68,secret:null});
  }
 }
 const junctions=JUNCTIONS.map((j,i)=>({...j,id:i,x:STAGES[j.stage].start+j.at*STAGES[j.stage].speed}));
 for(const j of junctions.filter(j=>j.kind!=='ride'))pickups.push({id:pickups.length,x:j.x+(j.exit||-125),tool:pickups.length%TOOLS.length,height:j.kind==='ascent'?150:125,secret:j.secret});
 pickups.sort((a,b)=>a.x-b.x);return{seed,hazards,pickups,junctions};
}
export function stageAt(distance) {
  return STAGES.find((s) => distance < s.end) || STAGES.at(-1);
}
export function groundAt(distance) {
  const s = stageAt(distance),
    t = Math.max(0, Math.min(1, (distance - s.start) / (s.end - s.start)));
  // Every zone joins at the same height; internal slopes have zero endpoint offset.
  const edge = Math.sin(Math.PI * t);
  if (s.movement === "board")
    return 421 - 36 * Math.sin(Math.PI * 2 * t) * edge;
  if (s.movement === "roof") return 421 - 27 * edge * edge;
  if (s.style === "bridge") return 421 - 16 * edge * edge;
  return 421;
}
export function stageProgress(game) {
  const s = STAGES[game.stage];
  return Math.max(
    0,
    Math.min(1, (game.distance - s.start) / (s.end - s.start)),
  );
}
export function sceneFor(game) {
  const s = STAGES[game.stage],
    p = stageProgress(game);
  return s.id === "snow" && p > 0.52
    ? "transit"
    : s.id === "bridge" && p > 0.55
      ? "cloud"
      : s.id === "grid" && p > 0.55
        ? "layers"
        : s.id === "fog" && p > 0.55
          ? "golden"
          : s.style;
}
export function weatherFor(game) {
  const scene = sceneFor(game),
    p = stageProgress(game);
  if (scene === "snow") return p < 0.22 ? "flurry" : "snow";
  if (scene === "fog") return "fog";
  if (scene === "golden") return "clearing";
  if (scene === "bridge") return "wind";
  if (scene === "hills") return "rain";
  return "clear";
}
export function speedFor(game) {
  const s = STAGES[game.stage],
    p = stageProgress(game);
  if (s.movement === "board") return s.speed * (0.78 + 0.44 * p);
  if (s.movement === "sprint") return s.speed * (0.88 + 0.24 * p);
  if (s.movement === "travel")
    return s.speed * (0.7 + 0.6 * Math.sin(p * Math.PI));
  if (s.movement === "arrival") return s.speed * (1.2 - 0.7 * p);
  return s.speed;
}
