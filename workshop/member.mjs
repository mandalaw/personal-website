import { head, link } from './ui.mjs';
export async function remember(){ throw Error('Account saving is not available yet. You can bookmark this page or print a public reading packet.'); }
export async function render(id, section){
 const contact=id==='inquiry';
 section.innerHTML=head(contact?'LET’S TALK':id==='resources'?'ENGINEERING NOTES':'YOUR NEXT DISCOVERY',contact?'Have a role in mind?':id==='resources'?'Explore the decisions behind the work.':'Keep exploring, without an account.',contact?'Email is the best way to start a professional conversation.':'The public projects, labs and reading packet are open to everyone.')+`<p>${link(contact?'Email Ahmed':'Explore engineering notes',contact?'mailto:dev@mandalawi.ca':'#notes')}</p><p>${link('Build a public reading packet','#packet')} · ${link('Professional overview','/professional-access/')}</p>`;
}
