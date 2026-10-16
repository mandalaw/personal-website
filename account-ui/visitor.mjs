// Ephemeral presentation state from the validated session bridge. Never persisted or sent to analytics.
let first='',spoken=false;
export function verifiedFirst(value){return typeof value==='string'&&!value.includes('@')?value.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().split(/\s+/)[0].slice(0,30):'';}
export function setVisitor(session){const next=session?.authenticated?verifiedFirst(session.displayName):'';if(next!==first)spoken=false;first=next;}
export function personalGreeting(){if(!first||spoken)return '';spoken=true;return 'Good to see you, '+first+'.';}
export function clearVisitor(){first='';spoken=false;}
export function visitorName(){return first;}
