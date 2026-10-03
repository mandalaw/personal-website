// Curated public controls only. Presence, visibility and context are checked before use.
export const targets=Object.freeze([
 {id:'devrun',selector:'#project-devrun .project-action.primary,.dev-run-feature',contexts:['ENTRY','PORTFOLIO','SIDE_QUESTS'],pose:'point-right',prompt:'Run it?',priority:6},
 {id:'school-quantic',selector:'[data-brand="quantic"]',contexts:['ABOUT'],pose:'document',prompt:'The master’s was here.',priority:4},
 {id:'school-uoft',selector:'[data-brand="uoft"]',contexts:['ABOUT'],pose:'document',prompt:'Code and maps.',priority:4},
 {id:'gis-tool',selector:'[data-brand="arcgis"],[data-brand="arcmap"]',contexts:['WORKBENCH','GIS'],pose:'map',prompt:'Maps? Right there.',priority:5},
 {id:'stack',selector:'button[data-guide-open="stack"],[data-brand="python"],[data-brand="react"]',contexts:['WORKBENCH'],pose:'terminal',prompt:'Want the stack?',priority:4},
 {id:'azure-tool',selector:'[data-brand="azure"]',contexts:['WORKBENCH'],pose:'cable',prompt:'Follow the connection.',priority:4},
 {id:'oracle-tool',selector:'[data-brand="oracle"]',contexts:['WORKBENCH'],pose:'database',prompt:'The other end.',priority:4},
 {id:'theme',selector:'#toggle-dark-mode',contexts:['ENTRY','WORKBENCH','CONTACT','ABOUT','FOOTER'],pose:'look-up',prompt:'A different light.',priority:1},
 {id:'live',selector:'a[href="https://trustai.mandalawi.ca/"]',contexts:['ENTRY','TRUSTAI'],pose:'tablet',prompt:'That one’s live.',priority:5},
 {id:'map',selector:'[data-cap="map"],[data-entry-tool="map"],a[href="#project-garden"],a[href="/case-studies/garden/"]',contexts:['ENTRY','GIS','WORKBENCH','PORTFOLIO','TRUSTAI'],pose:'map',prompt:'Maps? Of course.',priority:4},
 {id:'game',selector:'[data-game-open="reversi"]',contexts:['ENTRY','SIDE_QUESTS'],pose:'game-piece',prompt:'One game?',priority:4},
 {id:'archive',selector:'a[href="/case-studies/original-portfolio/"]',contexts:['SIDE_QUESTS','FOOTER','PORTFOLIO'],pose:'archive',prompt:'Old me lives there.',priority:3},
 {id:'email',selector:'a[href="mailto:dev@mandalawi.ca"]',contexts:['CONTACT','FOOTER','RESUME'],pose:'envelope',prompt:'Say hi.',priority:5,effect:'plane'},
 {id:'resume-email',selector:'a[href="mailto:dev@mandalawi.ca?subject=Resume%20request"]',contexts:['RESUME'],pose:'handoff',prompt:'Ask for the PDF.',priority:4},
 {id:'resume',selector:'a[href="/resume/"]',contexts:['ENTRY','ABOUT','CONTACT','FOOTER','LOST'],pose:'handoff',prompt:'Straight to business?',priority:3},
 {id:'build',selector:'[data-cap="build"],[data-entry-tool="build"]',contexts:['ENTRY','WORKBENCH'],pose:'terminal',prompt:'Open the toolbox.',priority:4},
 {id:'connect',selector:'[data-cap="connect"],[data-entry-tool="connect"]',contexts:['ENTRY','WORKBENCH'],pose:'cable',prompt:'Connect a few things.',priority:4},
 {id:'test',selector:'[data-cap="test"],[data-entry-tool="test"]',contexts:['ENTRY','WORKBENCH'],pose:'tablet',prompt:'Check the result.',priority:4},
 {id:'work',selector:'a[href="#portfolio"],a[href="/#portfolio"]',contexts:['ENTRY','LOST','FOOTER'],pose:'present',prompt:'Start there.',priority:3},
 {id:'bench',selector:'a[href="#services"]',contexts:['ENTRY','PORTFOLIO'],pose:'workbench',prompt:'Try a tool.',priority:2},
 {id:'about',selector:'a[href="#experience"],.about-portrait',contexts:['ENTRY','ABOUT'],pose:'look-up',prompt:'That’s the actual human.',priority:2},
 {id:'contact',selector:'a[href="#contact"],a[href="/#contact"]',contexts:['ENTRY','ABOUT','LOST','FOOTER'],pose:'envelope',prompt:'Say hi.',priority:2},
 {id:'visuals',selector:'a[href="/visuals/"]',contexts:['ENTRY','SIDE_QUESTS','VISUALS','FOOTER'],pose:'camera',prompt:'Through the lens.',priority:3},
 {id:'github',selector:'a[href^="https://github.com/mandalaw"],a[href="https://github.com/UTSCCSCC01/finalprojectw22-GDSC2.0"]',contexts:['CONTACT','FOOTER','PORTFOLIO'],pose:'terminal',prompt:'The source is there.',priority:2},
 {id:'linkedin',selector:'a[href="https://www.linkedin.com/in/devmandalaw"]',contexts:['CONTACT','FOOTER'],pose:'document',prompt:'The professional side.',priority:2},
 {id:'world-a',selector:'[data-entry-select="a"]',contexts:['ENTRY'],pose:'curious',prompt:'A different door.',priority:1},
 {id:'world-b',selector:'[data-entry-select="b"]',contexts:['ENTRY'],pose:'workbench',prompt:'A little workbench.',priority:1},
 {id:'world-c',selector:'[data-entry-select="c"]',contexts:['ENTRY'],pose:'tablet',prompt:'One project first.',priority:1},
 {id:'home',selector:'a[href="/"],a[href="/#about"]',contexts:['LOST','VISUALS','RESUME'],pose:'present',prompt:'Home is that way.',priority:2}
].map(t=>Object.freeze({...t,anchors:['scene-left','scene-right','lower-left','lower-right'],reactions:['face','point','prop']})));
export function visible(el){if(!el||el.closest('[hidden],[inert]'))return false;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&r.top>=(el.closest('header')?0:64)&&r.bottom<=innerHeight-10&&r.left>=0&&r.right<=innerWidth&&s.visibility!=='hidden'&&s.display!=='none'}
export function candidates(context){return targets.filter(t=>t.contexts.includes(context)).flatMap(t=>[...document.querySelectorAll(t.selector)].filter(visible).map(el=>({...t,el}))).sort((a,b)=>b.priority-a.priority)}
export function match(node,context){for(const t of targets){if(!t.contexts.includes(context))continue;const el=node?.closest?.(t.selector);if(visible(el))return {...t,el}}return null}
export function choose(context,recent=[]){const all=candidates(context),fresh=all.filter(t=>!recent.slice(-3).includes(t.id));return (fresh.length?fresh:all)[0]||null}
