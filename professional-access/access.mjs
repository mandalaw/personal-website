import{theme}from'/hiring/ui.mjs';
import{privatePlatform}from'./platform-config.mjs';
theme();
// This is a link to the private origin, never a cross-origin identity request.
const expected=['google','github','linkedin'];
try{
 const u=new URL(privatePlatform.origin);
 const ready=privatePlatform.enabled===true&&u.protocol==='https:'&&u.origin===privatePlatform.origin&&u.origin==='https://accounts.mandalawi.ca'&&privatePlatform.providers.length===3&&expected.every(p=>privatePlatform.providers.includes(p));
 if(ready){
  for(const[id,path]of[['private-resume','/access/'],['private-account','/account/'],['private-invitation','/access/']])document.getElementById(id).href=u.origin+path;
  document.getElementById('private-access').hidden=false;
  document.getElementById('access-unavailable').hidden=true;
 }
}catch{/* Keep the working email option when private access is not released. */}
