// Session-local discovery; no identifiers, network calls or cross-session history.
export const RUN_LINES=Object.freeze([
 {text:'There’s a game in here. Want to run it?',topic:'devrun'},
 {text:'Toronto snow. Bay trains. A few unhelpful robots.',topic:'devrun-worlds'},
 {text:'The résumé can wait two minutes.',topic:'devrun-time'},
 {text:'Yes, the cat has a shortcut.',topic:'devrun'},
 {text:'Seven route choices. I trust your judgment. Mostly.',topic:'devrun-routes'}
]);
export class RunTease {
 constructor(storage,now=Date.now){this.storage=storage;this.now=now;this.born=now();this.memory={};try{this.memory=JSON.parse(storage.getItem('dev-run-tease')||'{}')}catch{} }
 get played(){try{return this.storage.getItem('dev-run-played')==='1'}catch{return false}}
 save(){try{this.storage.setItem('dev-run-tease',JSON.stringify(this.memory))}catch{}}
 next({context,idle,interactions=0,hover=false,quiet=false}){
  const m=this.memory,t=this.now();if(quiet||!['ENTRY','PORTFOLIO','SIDE_QUESTS','TRUSTAI','GIS','GDSC'].includes(context)||idle<2200||t-(m.last||0)<90000)return null;
  if(!hover&&interactions<2&&t-this.born<18000)return null;
  if(this.played)return m.returned?null:{text:'Back already? There’s a longer route.',topic:'devrun-long',returning:true};
  if((m.count||0)>=3)return null;
  return {...RUN_LINES[(m.index||0)%RUN_LINES.length]};
 }
 shown(item){const m=this.memory;m.last=this.now();if(item.returning)m.returned=true;else{m.count=(m.count||0)+1;m.index=(m.index||0)+1}this.save()}
}
