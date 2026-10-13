'use strict';
(() => {
  const host=document.querySelector('.side-quests');
  if(!host)return;
  const cards=[...host.querySelectorAll('.quest-card')];
  const compact=matchMedia('(max-width:700px) and (max-height:760px)');
  let index=0;
  const controls=document.createElement('div');controls.className='quest-controls';
  controls.innerHTML='<button type="button" aria-label="Previous side quest">←</button><span aria-live="polite" aria-atomic="true"></span><button type="button" aria-label="Next side quest">→</button>';
  host.after(controls);
  const [previous,next]=controls.querySelectorAll('button');
  function paint(){
    document.documentElement.dataset.questDeck=String(compact.matches);
    cards.forEach((card,i)=>{card.hidden=compact.matches&&i!==index;card.inert=card.hidden;});
    controls.querySelector('span').textContent=`${index+1} of ${cards.length} side quests`;
  }
  function move(delta){if(cards[index].contains(document.activeElement))(delta<0?previous:next).focus({preventScroll:true});index=(index+delta+cards.length)%cards.length;paint();}
  previous.onclick=()=>move(-1);next.onclick=()=>move(1);
  host.addEventListener('keydown',event=>{if(!compact.matches||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();move(event.key==='ArrowLeft'?-1:1);});
  compact.addEventListener('change',paint);paint();
})();
