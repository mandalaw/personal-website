import {setVisitor,visitorName,clearVisitor} from './visitor.mjs';
let shown='',timer,restores=[];
export function personalize(session){
 const next=session?.authenticated?session.displayName:'';if(next&&visitorName()&&shown===visitorName())return;
 clearTimeout(timer);for(const[n,text]of restores)if(n.isConnected)n.textContent=text;restores=[];setVisitor(session);
 const name=visitorName();if(!name)return;
 if(shown===name)return;shown=name;
 const line=document.querySelector('#entry-line')||document.querySelector('.bench-caption');if(!line)return;
 const old=line.textContent;restores.push([line,old]);line.dataset.privateUi='';line.textContent='Good to see you, '+name+'.';line.setAttribute('role','status');line.setAttribute('aria-live','polite');line.removeAttribute('aria-hidden');
 timer=setTimeout(()=>{if(line.isConnected&&line.textContent==='Good to see you, '+name+'.')line.textContent=old;restores=[];},6500);
}
export function clearPersonalization(){clearVisitor();personalize({authenticated:false});}
