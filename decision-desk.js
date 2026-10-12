// Educational, local-only state. Never used to authorize or send a request.
const examples={
 record:{
 valid:['Ready for the next check',{reference:'DEMO-42',amount:125,currency:'CAD'},['Read the source fields.','Validate the reference and numeric amount.','Prepare the destination mapping.'],'A valid shape is a starting point; reconciliation still matters.'],
 missing:['Stop before writing',{reference:null,amount:125,currency:'CAD'},['Read the source fields.','Reject the missing reference.','Keep the record available for correction.'],'A missing identity should not become an accidental new record.'],
 invalid:['Stop before writing',{reference:'DEMO-42',amount:'unknown',currency:'CAD'},['Read the source fields.','Reject a non-numeric amount.','Do not turn an unknown value into zero.'],'A silent default can hide a data-quality problem.'],
 duplicate:['Do not create a second record',{reference:'DEMO-42',amount:125,currency:'CAD'},['Validate the source.','Find the previously written reference.','Reconcile the existing destination before deciding what to do.'],'Retry behavior needs an explicit rule; a second insert is not always safe.']},
 output:{
 valid:['Contract passes; facts still need checking',{risk:'review',reasons:['Seller history is unavailable'],limitations:'Listing text alone is insufficient.'},['Parse structured output.','Check required fields and allowed values.','Keep uncertainty visible to the reader.'],'A schema check cannot establish factual accuracy.'],
 missing:['Contract fails',{risk:'review',reasons:['Seller history is unavailable']},['Parse structured output.','Find a required field missing.','Do not quietly display a complete-looking answer.'],'The application must have an explicit fallback or retry policy.'],
 probability:['Reject the unsupported number',{fraud_probability:'97%'},['Check the allowed result shape.','No calibrated probability is defined here.','Do not present this number as a measured likelihood.'],'A confident number is not evidence of calibration.'],
 prose:['Wrong shape for this application','This listing looks perfectly safe to me.', ['Try to parse the expected structure.','The response does not meet the contract.','Return an understandable failure instead of trusting the prose.'],'These responses are fictional, not live model outputs.']},
 access:{
 anonymous:['Access denied',{session:'absent'},['Require a valid session.','Stop before role lookup.','Return no protected resource.'],'Public work and contact routes remain open.'],
 member:['Access denied',{session:'valid',server_role:'MEMBER'},['Validate the session.','Read the role from the server.','MEMBER does not authorize a sensitive OWNER action.'],'A valid login is not permission for everything.'],
 tampered:['Access denied',{session:'valid',frontend_label:'OWNER',server_role:'MEMBER'},['Validate the session.','Ignore the frontend role label.','The stored MEMBER role still denies access.'],'The client does not assign roles.'],
 expired:['Access denied',{session:'expired'},['Check the session lifetime.','Reject the expired session.','Return no protected resource.'],'A previously valid session is not permanently valid.'],
 'owner-old':['Recent verification required',{session:'valid',server_role:'OWNER',device_proof:'stale'},['Validate the session and stored OWNER role.','Check recent device verification.','Withhold the sensitive action.'],'Being OWNER does not remove the recent-verification requirement.'],
 'owner-fresh':['Authorization checks pass',{session:'valid',server_role:'OWNER',device_proof:'recent'},['Validate the session.','Confirm the stored OWNER role.','Verify recent device proof before the action.'],'This illustration grants nothing. Real authorization happens on the server.']}
};
for(const group of Object.keys(examples)){
 const input=document.getElementById(group+'-case'),out=document.getElementById(group+'-result');
 const render=()=>{const [title,data,steps,note]=examples[group][input.value];out.replaceChildren();const h=document.createElement('h3');h.textContent=title;const pre=document.createElement('pre');pre.textContent=JSON.stringify(data,null,2);pre.setAttribute('aria-label','Fictional example');const ol=document.createElement('ol');for(const step of steps){const li=document.createElement('li');li.textContent=step;ol.append(li);}const p=document.createElement('p');p.className='desk-caption';p.textContent=note;out.append(h,pre,ol,p);};
 input.addEventListener('change',render);render();
}
