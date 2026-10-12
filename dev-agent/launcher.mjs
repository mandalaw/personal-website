// Tiny entry point. Evidence and UI are loaded only after an intentional click.
const host=document.querySelector('.ws-tools')||document.querySelector('header nav');
if(host){
  const b=document.createElement('button');b.type='button';b.className='agent-launcher';b.textContent='Ask Dev dude';b.setAttribute('aria-haspopup','dialog');host.append(b);
  let dialog,view,loading=false,navigating=false;
  b.onclick=async()=>{
    if(loading)return;if(dialog){dialog.showModal();view.focus();return;}loading=true;b.disabled=true;
    try{
      const css=document.createElement('link');css.rel='stylesheet';css.href='/dev-agent/agent.css';document.head.append(css);
      const {mount}=await import('./ui.mjs');dialog=document.createElement('dialog');dialog.className='agent-dialog';dialog.setAttribute('aria-label','Ask Dev dude');
      const header=document.createElement('div');header.className='agent-dialog-heading';const h=document.createElement('h2');h.textContent='Ask Dev dude';const close=document.createElement('button');close.type='button';close.textContent='Close';header.append(h,close);const root=document.createElement('div');dialog.append(header,root);document.body.append(dialog);view=mount(root,{compact:true,beforeNavigate:()=>{navigating=true;dialog.close();}});
      close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{view.clear();if(!navigating)b.focus();navigating=false;});dialog.showModal();view.focus();
    }catch{b.textContent='Open evidence guide';b.onclick=()=>location.assign('/dev-agent/');}
    finally{loading=false;b.disabled=false;}
  };
}
