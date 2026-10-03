'use strict';
(() => {
 const assets='/assets/brands/';
 // Marks identify tools in the work; they are not proficiency scores or endorsements.
 const tools={
  canvas:{label:'Canvas 2D',icon:'code',category:'DRAW',note:'Dev Run renders its world, original scenery, hazards and cached character frames with the browser Canvas 2D API.'},
  webaudio:{label:'Web Audio',word:'Audio',category:'SOUND',note:'Optional original oscillator sounds in Dev Run. Muted until the player explicitly enables them.'},
  bootstrap:{label:'Bootstrap',asset:'technologies/bootstrap.svg',category:'INTERFACE',note:'Bootstrap 5 styles and components in the GDSC team source.'},
  mui:{label:'Material UI',word:'MUI',category:'INTERFACE',note:'Material UI components imported by the GDSC application.'},
  axios:{label:'Axios',word:'axios',category:'CONNECT',note:'HTTP requests in the GDSC frontend, including login and registration flows.'},
  router:{label:'React Router',icon:'branch',category:'BUILD',note:'Client-side routing in the GDSC React application.'},
  mongoose:{label:'Mongoose',word:'mongoose',category:'DATA',note:'MongoDB models in the GDSC backend.'},
  nginx:{label:'nginx',word:'nginx',category:'DEPLOY',note:'Web-serving layer in the documented TrustAI team deployment.'},
  caddy:{label:'Caddy',word:'Caddy',category:'DEPLOY',note:'Reverse proxy in the documented TrustAI team deployment.'},
  ec2:{label:'AWS EC2',asset:'platforms/aws-ec2.svg',category:'CLOUD',note:'Compute service in the TrustAI team deployment. This describes the team architecture.'},
  ecr:{label:'AWS ECR',asset:'platforms/aws-ecr.svg',category:'CLOUD',note:'Container registry in the TrustAI team deployment.'},
  ssm:{label:'AWS Systems Manager',asset:'platforms/aws-systems-manager.svg',category:'CLOUD',note:'Deployment management in the TrustAI team architecture.'},
  qgis:{label:'QGIS',asset:'technologies/qgis.svg',wide:true,href:'https://qgis.org/',category:'MAP',note:'Part of Ahmed’s broader GIS toolkit; not assigned to every mapping project.'},
  arcgisjs:{label:'ArcGIS API for JavaScript',icon:'map',category:'MAP / API',note:'Esri Canada’s 2019 description of RouteAbility identifies this API and a routing widget. Application context, not a claim of sole authorship.'},
  arcgispro:{label:'ArcGIS Pro',icon:'map',category:'MAP',note:'Tutorials created during the 2018 UofT student-assistant role.'},
  junit:{label:'JUnit',word:'JUnit',category:'TEST',note:'Tests in the shared Java coursework repository; not a claim of sole authorship.'},
  javadoc:{label:'JavaDoc',word:'JavaDoc',category:'DOCUMENT',note:'Ahmed’s explicitly credited contribution in the Othello coursework source.'},
  workspace:{label:'Google Workspace APIs',icon:'plug',category:'CONNECT',note:'API connections in Ahmed’s freelance web work.'},
  github:{label:'GitHub',asset:'platforms/github-black.svg',href:'https://github.com/mandalaw',category:'SOURCE',note:'Ahmed’s public repositories and this portfolio’s source.'},
  pages:{label:'GitHub Pages',asset:'platforms/github-black.svg',href:'https://github.com/mandalaw/personal-website',category:'HOST',note:'Hosting for the current portfolio; opens its source repository.'},
  svg:{label:'SVG',icon:'code',category:'DRAW',note:'Local vector artwork and interactive character geometry in this site.'},
  python:{label:'Python™',asset:'technologies/icon-python.svg',category:'DATA',note:'Data checks and integration at Vigilant; also part of the TrustAI team stack.'},
  react:{label:'React',asset:'technologies/icon-react.svg',category:'BUILD',note:'Web interfaces, including the GDSC team application.'},
  node:{label:'Node.js®',asset:'technologies/icon-nodejs.svg',category:'BUILD',note:'The GDSC team’s server runtime. Opens the Node.js project.',href:'https://nodejs.org/'},
  mongo:{label:'MongoDB®',asset:'technologies/logo-mongodb.svg',wide:true,category:'DATA',note:'Database in the GDSC team application.'},
  fastapi:{label:'FastAPI',asset:'technologies/logo-fastapi.svg',wide:true,category:'BUILD',note:'Python API framework in the TrustAI team application.'},
  postgres:{label:'PostgreSQL',icon:'data',category:'DATA',note:'Database in the TrustAI team application.'},
  html:{label:'HTML5',asset:'technologies/icon-html5.svg',category:'BUILD',note:'Markup for this site and earlier portfolio work.'},
  css:{label:'CSS',asset:'technologies/css.svg',category:'BUILD',note:'Layout, themes and styling for web interfaces.'},
  js:{label:'JavaScript',asset:'technologies/javascript.svg',category:'BUILD',note:'Browser interactions and web application work.'},
  git:{label:'Git',asset:'technologies/icon-git.svg',category:'TOOLS',note:'Version control, including this portfolio’s history.'},
  express:{label:'Express',icon:'plug',category:'CONNECT',note:'API routes in the GDSC team application.'},
  jwt:{label:'JWT',icon:'test',category:'CONNECT',note:'Token-based authentication in GDSC; a technique, not a credential.'},
  sql:{label:'SQL',icon:'data',category:'DATA',note:'Application queries and investigating data inconsistencies at Vigilant.'},
  api:{label:'APIs',icon:'plug',category:'CONNECT',note:'Connections between applications and data services.'},
  azure:{label:'Azure Functions',asset:'platforms/azure-functions.svg',category:'CONNECT',note:'Functions used to send data through APIs and schedule synchronization at Vigilant.'},
  oracle:{label:'Oracle Cloud',icon:'data',category:'CONNECT',note:'Financial-planning application involved in the Vigilant integration work.'},
  arcgis:{label:'Esri / ArcGIS',icon:'map',category:'MAP',note:'GIS software in Ahmed’s mapping background; tools vary by project.'},
  arcmap:{label:'ArcMap',icon:'map',category:'MAP',note:'Historical desktop GIS work. This label deliberately retains ArcMap.'},
  earth:{label:'Google Earth',icon:'location',category:'MAP',note:'Site information, mapping and interpreting imagery in GIS work.'},
  spatial:{label:'Spatial analysis',icon:'map',category:'MAP',note:'Comparing locations and explaining geographic findings.'},
  open:{label:'Open data',icon:'data',category:'DATA',note:'Public geographic information used in the garden site analysis.'},
  checks:{label:'Output validation',icon:'test',category:'AI / CHECK',note:'Reviewing structured responses and testing TrustAI’s analysis flows.'},
  java:{label:'Java · Duke',asset:'technologies/java-duke.svg',category:'BUILD',note:'Othello coursework includes department code; Ahmed is credited for JavaDoc.'}
 };
 const trays={
  devrun:{title:'Dev Run · the actual stack',ids:['js','html','css','canvas'],more:['svg','webaudio','git','pages'],note:'Plain ES modules, Canvas 2D and the site’s existing Dev artwork. Node’s built-in test runner checks the deterministic game logic. No game framework or backend.'},
  routeability:{title:'RouteAbility · documented application',ids:['js','arcgisjs','spatial'],note:'Esri Canada’s 2019 feature describes the routing API and custom road data. These are application details, not a claim that I built every part.'},
  webwork:{title:'Web work · across projects',ids:['react','html','css','js'],more:['workspace','api'],note:'The stack varies by project. Interfaces, authentication, testing and service connections.'},
  current:{title:'This site · under the surface',ids:['html','css','js','svg'],more:['git','pages'],note:'Static pages, local vector artwork and small browser modules. The games here are separate from the Java archive.'},
  terraprobe:{title:'Terraprobe · mapping work',ids:['arcmap','earth'],note:'Tools associated with the 2019 GIS internship. Historical product names retained.'},
  uoftwork:{title:'UofT · student-assistant work',ids:['arcgispro'],note:'Mapping support and ArcGIS Pro tutorials in 2018.'},
  stack:{title:'A few things I use',ids:['react','python','node','mongo','html','sql'],more:['fastapi','postgres','css','js','git','api'],note:'Different work, different tools. Project pages explain what I contributed.'},
  trustai:{title:'TrustAI · team stack',ids:['python','fastapi','react','postgres'],more:['nginx','caddy','ec2','ecr','ssm'],note:'My focus: requirements, model comparison and output validation.'},
  gdsc:{title:'GDSC · team stack',ids:['react','node','mongo','bootstrap'],more:['express','jwt','axios','mui','router','mongoose'],note:'Six people. My contributions included login, registration connections and superuser access.'},
  gis:{title:'GIS background',ids:['arcgis','arcmap','earth'],more:['qgis','spatial','open'],note:'Tools across my GIS work, not a claim that every project used every product.'},
  garden:{title:'The garden analysis',ids:['spatial','open'],note:'Site comparisons explained through maps and reports.'},
  site:{title:'Built for the browser',ids:['html','css','js'],more:['git','github','svg'],note:'This portfolio uses HTML, CSS, JavaScript and SVG.'},
  othello:{title:'Coursework & documentation',ids:['java','javadoc','junit'],note:'Shared source and attribution; see the case study for the boundaries.'},
  data:{title:'Data, in context',ids:['python','sql','mongo','postgres'],note:'Python and SQL at Vigilant; MongoDB in GDSC and PostgreSQL in TrustAI.'},
  check:{title:'A response still needs checking',ids:['python','checks'],note:'TrustAI is a team application. Model evaluation and validation were part of my role.'},
  cloud:{title:'Integration work at Vigilant',ids:['azure','api','oracle'],more:['python','sql'],note:'Tools involved in moving and checking financial-planning data. Not a complete system architecture.'}
 };
 function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e}
 function glyph(name){const s=document.createElementNS('http://www.w3.org/2000/svg','svg'),u=document.createElementNS(s.namespaceURI,'use');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.classList.add('ui-icon');u.setAttribute('href','#icon-'+name);s.append(u);return s}
 function chip(id){const t=tools[id],d=element('details','brand-chip');d.dataset.brand=id;const s=element('summary'),plate=element('span','brand-plate'+(t.wide?' brand-wide':''));
  if(t.asset){const i=element('img');i.src=assets+t.asset;i.alt='';i.width=t.wide?100:30;i.height=30;i.loading='lazy';i.decoding='async';plate.append(i)}else if(t.word){plate.classList.add('brand-word');plate.append(element('span','',t.word))}else plate.append(glyph(t.icon));
  s.append(plate,element('span','brand-label',t.label));if(t.href){const a=element('a','brand-chip brand-link');a.dataset.brand=id;a.href=t.href;a.title=t.note;a.setAttribute('aria-label',t.label+' — '+t.note);a.append(plate,element('span','brand-label',t.label+' ↗'));return a}const body=element('div','brand-detail');body.append(element('small','brand-category',t.category),element('p','',t.note));
  if(t.href){const a=element('a','','Visit '+t.label.replace(/[®™]/g,''));a.href=t.href;body.append(a)}
  d.append(s,body);return d;
 }
 function education(){const wrap=element('div','credential-grid');wrap.dataset.brandTray='education';
  for(const [id,school,degree,line] of [['quantic','Quantic School of Business and Technology','Master of Science in Software Engineering',''],['uoft','University of Toronto','Honours Bachelor of Science','Geographical Information Systems & Computer Science | 2022']]){
   const e=element('article','credential-tile credential-'+id),text=element('div');e.dataset.brand=id;
   text.append(element('small','credential-field',id==='quantic'?'SOFTWARE ENGINEERING':'TORONTO · GEOGRAPHY & COMPUTING'),element('strong','credential-school',school),element('span','credential-degree',degree));if(line)text.append(element('small','credential-subject',line));e.append(text);wrap.append(e)
  }return wrap;
 }
 function affiliation(){const e=element('div','program-identity'),img=element('img');img.src=assets+'organizations/gdsc-2022.png';img.width=64;img.height=30;img.alt='';img.loading='lazy';const t=element('div');t.append(element('strong','','Google Developer Student Clubs'),element('small','','University of Toronto Mississauga · Winter 2022 team project'));e.append(img,t);return e}
 function tray(id){if(id==='education')return education();const t=trays[id];if(!t)return document.createDocumentFragment();const wrap=element('div','brand-tray');wrap.setAttribute('role','region');wrap.dataset.brandTray=id;wrap.setAttribute('aria-label',t.title);if(id==='gdsc')wrap.append(affiliation());wrap.append(element('p','brand-tray-title',t.title));const rail=element('div','brand-rail');rail.append(...t.ids.map(chip));wrap.append(rail);
  if(t.more?.length){const d=element('details','brand-more'),s=element('summary','','A few more tools'),r=element('div','brand-rail');r.append(...t.more.map(chip));d.append(s,r);wrap.append(d)}wrap.append(element('p','brand-context',t.note));return wrap;
 }
 function hydrate(scope=document){scope.querySelectorAll('.credential-grid:not([data-distinct])').forEach(e=>{const n=education();n.dataset.distinct='true';e.replaceWith(n)});scope.querySelectorAll('[data-brand-mount]').forEach(e=>{if(e.dataset.brandReady)return;e.append(tray(e.dataset.brandMount));e.dataset.brandReady='true'})}
 window.BrandSystem=Object.freeze({tray,hydrate});hydrate();
 // Templates stay inert; each project expansion hydrates only its own tools.
 const content=document.getElementById('scene-content');if(content)new MutationObserver(()=>hydrate(content)).observe(content,{childList:true,subtree:true});
})();
