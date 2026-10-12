export const evaluationSamples=[
 {name:'Output A',body:'{"price":40,"supplier_verified":false,"limitations":["Supplier verification missing"]}',schema:true,grounded:true,limits:true,why:'Matches the required types and leaves the missing verification visible.'},
 {name:'Output B',body:'{"price":40,"supplier_verified":true,"limitations":[]}',schema:true,grounded:false,limits:false,why:'Well-formed JSON can still make an unsupported claim.'},
 {name:'Output C',body:'Looks like an excellent supplier at $40. Recommended!',schema:false,grounded:false,limits:false,why:'Fluent prose does not satisfy the contract or supply the missing evidence.'}
];
export function evaluateSamples(criteria){return evaluationSamples.map(s=>({...s,pass:criteria.every(k=>s[k]===true)}));}
export const sites=[{id:'A',access:9,shade:3,water:6},{id:'B',access:4,shade:9,water:8},{id:'C',access:7,shade:6,water:3},{id:'D',access:5,shade:7,water:9}];
export function rankSites(weights){if(!Array.isArray(weights)||weights.length!==3||!weights.every(x=>Number.isFinite(x)&&x>=0&&x<=10))throw Error('Weights must be 0–10.');const sum=weights.reduce((a,b)=>a+b,0);return sites.map(s=>({...s,score:sum?(s.access*weights[0]+s.shade*weights[1]+s.water*weights[2])/sum:0})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));}
export function integrate(kind,{retry=true,dedup=true}={}){
 const source={event_id:'sample-17',item:'Notebook',quantity:2,unit_price:12.5};if(kind==='malformed')delete source.quantity;if(kind==='hostile')source.item='<img src=x onerror=alert(1)>';
 const result={source,steps:[],delivered:0};
 if(!Number.isInteger(source.quantity)||source.quantity<=0){result.steps.push('422: quantity must be a positive integer. Stopped before delivery.');return result;}
 const mapped={eventId:source.event_id,name:source.item,quantity:source.quantity,total:source.quantity*source.unit_price};result.destination=mapped;result.steps.push('Contract valid; quantity × unit price mapped to total.');
 if(kind==='temporary'){result.steps.push('503: temporary destination failure.');if(!retry){result.steps.push('Stopped without retry.');return result;}result.steps.push('Retry policy: maximum 3 attempts, bounded backoff. Sample recovers on attempt 2.');}
 result.delivered=kind==='duplicate'&&!dedup?2:1;result.steps.push(kind==='duplicate'?(dedup?'Repeated event ID ignored; one delivery.':'No deduplication: two deliveries.'):'One delivery recorded in this illustration.');if(kind==='hostile')result.steps.push('Untrusted text displayed literally; never interpreted as HTML.');return result;
}
export const scenarios={tiny:{requests:4000,cpu:40,reads:120000,writes:8000,gb:.02},low:{requests:50000,cpu:40,reads:1500000,writes:100000,gb:.1},moderate:{requests:1000000,cpu:50,reads:30000000,writes:2000000,gb:1},abuse:{requests:100000000,cpu:100,reads:3000000000,writes:100000000,gb:10}};
export function costModel(v){for(const x of Object.values(v))if(!Number.isFinite(x)||x<0)throw Error('Invalid usage');const requests=Math.max(0,v.requests-1e7)/1e6*.3,cpu=Math.max(0,v.requests*v.cpu-3e7)/1e6*.02,reads=Math.max(0,v.reads-25e9)/1e6*.001,writes=Math.max(0,v.writes-5e7)/1e6,storage=Math.max(0,v.gb-5)*.75;return{base:5,requests,cpu,reads,writes,storage,total:5+requests+cpu+reads+writes+storage};}
