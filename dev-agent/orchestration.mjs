import {actions} from './catalog.mjs';
const scenes=Object.freeze({graph:'inspect',career:'shelf',arena:'output',maps:'inspect',api:'cable',design:'notebook',notes:'drawer',missions:'walk',packet:'carry',interview:'shelf'});
export function authoredAction(id){
  if(typeof id!=='string'||!Object.hasOwn(actions,id))return null;
  const action=actions[id];
  return Object.freeze({id,href:action.href,station:action.station||null,scene:scenes[id]||null,label:action.label});
}
// Navigation always follows an authored destination. A model cannot supply a URL,
// selector, animation program or arbitrary script. Existing stations own their UI.
export function bindActions(root,{beforeNavigate=()=>{}}={}){
  let observer=null,timer=null;
  const clean=()=>{observer?.disconnect();observer=null;clearTimeout(timer);timer=null;};
  const clicked=async event=>{
    const link=event.target.closest('a[data-action]');
    if(!link||!root.contains(link)||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const action=authoredAction(link.dataset.action);
    if(!action||link.getAttribute('href')!==action.href)return;
    beforeNavigate(action);
    if(location.pathname!=='/workshop/'||!action.station)return;
    event.preventDefault();clean();
    const station=document.getElementById('station');if(!station)return;
    const destination=new URL(action.href,location.origin);
    const show=async()=>{
      if(station.dataset.station!==action.station||!station.querySelector('.station-character'))return false;
      clean();station.focus({preventScroll:true});station.scrollIntoView({block:'start',behavior:'instant'});
      const {scene}=await import('../workshop/ui.mjs');scene(action.scene);return true;
    };
    if(location.hash===destination.hash){await show();return;}
    observer=new MutationObserver(()=>{void show();});observer.observe(station,{childList:true,subtree:true});
    timer=setTimeout(clean,1500);location.hash=destination.hash;
  };
  root.addEventListener('click',clicked);
  return ()=>{clean();root.removeEventListener('click',clicked);};
}
