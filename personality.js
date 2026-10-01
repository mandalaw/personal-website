'use strict';
(() => {
 const objects=[...document.querySelectorAll('[data-cap]')],idle=document.querySelector('.bench-idle');let selected=null;
 function select(id,focus=false){if(id!==null&&!objects.some(t=>t.dataset.cap===id))return;selected=id;objects.forEach(t=>{const on=t.dataset.cap===id;t.setAttribute('aria-expanded',String(on));document.getElementById('cap-'+t.dataset.cap).hidden=!on;if(on&&focus)t.focus({preventScroll:true})});if(idle)idle.hidden=!!id;document.documentElement.dataset.capability=id||'none';window.SectionScroll?.remeasure()}
 objects.forEach((t,i)=>{t.addEventListener('click',()=>select(selected===t.dataset.cap?null:t.dataset.cap));t.addEventListener('keydown',e=>{let n=null;if(e.key==='ArrowRight')n=(i+1)%objects.length;if(e.key==='ArrowLeft')n=(i+objects.length-1)%objects.length;if(e.key==='Home')n=0;if(e.key==='End')n=objects.length-1;if(n!==null){e.preventDefault();e.stopPropagation();objects[n].focus({preventScroll:true})}})});
 document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>window.SectionScroll?.remeasure()));
 window.CapabilityWorkbench=Object.freeze({select,snapshot:()=>({selected})});
})();
