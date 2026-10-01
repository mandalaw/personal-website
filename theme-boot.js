'use strict';
// Visual preferences only. No identity, credentials, analytics or network calls.
(() => {
 const root=document.documentElement,q=new URLSearchParams(location.search);let saved;
 try{saved=localStorage.getItem('mandalaw-theme')}catch{}
 root.dataset.theme=['day','night'].includes(q.get('theme'))?q.get('theme'):['day','night'].includes(saved)?saved:matchMedia('(prefers-color-scheme:dark)').matches?'night':'day';
 if(q.get('motion')==='reduce')root.dataset.motion='reduce';
 Object.assign(root.dataset,{deckScale:'64',heading:'modern',ambient:'balanced',entrance:'layered',navStyle:'raised',nightHover:'indigo',portrait:'dissolve',nightAmbient:'balanced',palette:'mineral',glass:'balanced',edge:'fine',header:'mineral',cta:'deep',secondary:'clear',card:'layered',chips:'clear',relief:'mineral'});
})();
