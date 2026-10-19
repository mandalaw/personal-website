'use strict';
// Keep the shared shell visible while a validated deep link takes its initial position.
// No identity, storage or network access. Without JavaScript, native anchors still work.
(() => {
 const root=document.documentElement;
 if(!['/','/index.html'].includes(location.pathname)||!/^#(portfolio|services|experience|playground|contact|site-footer|project-(trustai|gdsc|dev-run|devrun|garden|routeability|original-portfolio|original|othello))$/.test(location.hash))return;
 root.dataset.sectionLanding='pending';
 const release=()=>delete root.dataset.sectionLanding;
 // Fail open if a controller is missing or fails. Never leave public content hidden.
 addEventListener('DOMContentLoaded',()=>requestAnimationFrame(release),{once:true});
 addEventListener('pageshow',release,{once:true});
})();
