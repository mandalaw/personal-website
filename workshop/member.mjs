import {head,link} from './ui.mjs';
import {accountLink,safeContext} from '/account-ui/context.mjs';
let member=false;document.addEventListener('dev-account-state',e=>{member=e.detail.authenticated;if(document.querySelector('#station')?.dataset.accountPane)render(document.querySelector('#station').dataset.accountPane,document.querySelector('#station'));});
document.dispatchEvent(new Event('dev-account-state-request'));
export async function remember(){location.assign(accountLink('/account/#member',safeContext(location.pathname+location.hash)));}
export async function render(id,section){
 section.dataset.accountPane=id;const contact=id==='inquiry',resources=id==='resources';
 section.innerHTML=head(contact?'LET’S TALK':resources?'ENGINEERING NOTES':'YOUR WORKSHOP TRAIL',contact?'Have a role in mind?':resources?'Explore the decisions behind the work.':member?'Pick up where you left off.':'A few things worth keeping.',contact?'Email is always open. Your account also gives you a private inquiry form.':resources?'The projects, labs and public reading packet are open to everyone.':'Save projects, remember a station and keep your packet preferences with your account.');
 const p=document.createElement('p'),a=document.createElement('a');a.className='primary';a.href=accountLink(contact?'/account/#inquiry':resources?'/access/':'/account/#member',safeContext(location.pathname+location.hash));a.textContent=contact?'Open private inquiry':resources?'Open résumé access':member?'Your saved trail':'Sign in to keep your place';p.append(a);section.append(p);
 const publicLinks=document.createElement('p');publicLinks.innerHTML=link('Build a public reading packet','#packet')+' · '+link('Email Ahmed','mailto:dev@mandalawi.ca');section.append(publicLinks);
}
