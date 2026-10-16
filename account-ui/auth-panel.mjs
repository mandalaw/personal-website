import {icon} from './icons.mjs';
import {accountLink,safeContext} from './context.mjs';
let dialog,opener,mode='signin',providerAction=null,returnTo='/',ready=false;
const modes={signin:{title:'Welcome back.',description:'Pick the account you use here. If it’s your first visit, the same step creates your account.'},create:{title:'Make yourself at home.',description:'Save discoveries with LinkedIn, Google or GitHub. No new password. Already joined? You’ll return to the same account.'}};
function element(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function build(){
 dialog=element('dialog','auth-panel');dialog.id='account-auth';dialog.setAttribute('aria-labelledby','auth-title');dialog.dataset.privateUi='';
 const top=element('div','auth-heading'),titleGroup=element('div'),kicker=element('p','','DEV MANDALAW');kicker.id='auth-kicker';const title=element('h2');title.id='auth-title';titleGroup.append(kicker,title);const close=element('button','auth-close');close.type='button';close.setAttribute('aria-label','Close sign-in');close.append(icon('close'));close.onclick=()=>dialog.close();top.append(titleGroup,close);
 const tabs=element('div','auth-modes');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Account entry');for(const [id,label,mark]of [['signin','Sign in','person'],['create','Create account','plus']]){const b=element('button','project-action secondary',label);b.type='button';b.dataset.authMode=id;b.prepend(icon(mark));b.onclick=()=>showMode(id);tabs.append(b);}
 const desc=element('p');desc.id='auth-description';const providers=element('div','auth-providers');providers.id='providers';
 for(const [id,label]of [['linkedin','LinkedIn'],['google','Google'],['github','GitHub']]){const b=element('button','auth-provider');b.type='button';b.dataset.provider=id;const img=document.createElement('img');img.alt='';img.width=21;img.height=21;img.src='/account-ui/'+(id==='google'?'google-mark.png':id+'.svg');if(id==='google'){b.classList.add('google-provider');b.setAttribute('aria-label','Sign in with Google');img.src='/account-ui/google-signin-light.png';img.alt='';img.className='google-signin google-light';const dark=img.cloneNode();dark.src='/account-ui/google-signin-dark.png';dark.className='google-signin google-dark';b.append(img,dark);}else b.append(img,document.createTextNode('Sign in with '+label));b.onclick=()=>{if(providerAction){providerAction(id,b);return;}const u=new URL(accountLink(mode==='create'?'/create-account/':'/sign-in/',returnTo));u.searchParams.set('provider',id);location.assign(u.href);};providers.append(b);}
 const status=element('p','auth-status');status.id='auth-status';status.setAttribute('role','status');
 const note=element('p','auth-note','Projects, professional evidence and contact stay open to everyone.');const back=element('button','project-action secondary','Back to exploring');back.type='button';back.prepend(icon('arrow'));back.onclick=()=>dialog.close();
 dialog.append(top,tabs,desc,providers,status,note,back);document.body.append(dialog);
 dialog.addEventListener('close',()=>{document.documentElement.dataset.accountPanel='false';opener?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 ready=true;
}
function showMode(value){mode=value==='create'?'create':'signin';dialog.querySelector('#auth-title').textContent=modes[mode].title;dialog.querySelector('#auth-description').textContent=modes[mode].description;dialog.querySelectorAll('[data-auth-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.authMode===mode)));}
export function openAuth(value='signin',context=location.pathname+location.hash,source=document.activeElement){if(!ready)build();opener=source;returnTo=safeContext(context);showMode(value);document.documentElement.dataset.accountPanel='true';if(!dialog.open)dialog.showModal();dialog.querySelector('[data-auth-mode="'+mode+'"]').focus();}
export function configureAuth(action,providers){if(!ready)build();providerAction=action;dialog.querySelectorAll('[data-provider]').forEach(b=>{b.hidden=!providers.some(p=>p.id===b.dataset.provider&&p.available);});}
export function authMessage(text){if(!ready)build();dialog.querySelector('#auth-status').textContent=text;}
export function currentMode(){return mode;}
export function closeAuth(){if(dialog?.open)dialog.close();}
