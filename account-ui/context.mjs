export const PUBLIC_ORIGIN="https://www.mandalawi.ca";
export const ACCOUNT_ORIGIN="https://accounts.mandalawi.ca";
const paths=new Set(["/", "/career-guide/", "/case-studies/dev-run/", "/case-studies/garden/", "/case-studies/gdsc/", "/case-studies/original-portfolio/", "/case-studies/othello/", "/case-studies/trustai/", "/case-studies/web-work/", "/dev-agent/", "/engineering-notes/", "/field-notes/", "/how-it-works/", "/labs/", "/labs/dev-run/", "/labs/evaluation/", "/labs/integration/", "/labs/maps/", "/play/dev-run/", "/portfolio-website/", "/privacy/", "/professional-access/", "/recruiter-packet/", "/recruiter-room/", "/resume/", "/search/", "/start/", "/visuals/", "/workshop/"]);

export function safeContext(value) {
 if(typeof value!=='string'||value.length>220||!value.startsWith('/')||/[\\%?\s]/.test(value)||value.startsWith('//'))return '/';
 const [path,hash,...extra]=value.split('#');if(extra.length||!paths.has(path))return '/';
 if(hash&&!/^(about|portfolio|services|experience|contact|playground|project-(trustai|gdsc|dev-run|devrun|garden|routeability|original-portfolio|original|othello)|api|arena|career|design|graph|maps|missions|notes|packet|passport|resources|resume|terminal|transit)$/.test(hash))return path;
 return path+(hash?'#'+hash:'');
}
export function themeValue(value){return value==='night'?'night':'day';}
export function publicReturn(value,theme){const u=new URL(safeContext(value),PUBLIC_ORIGIN);u.searchParams.set('theme',themeValue(theme));return u.href;}
export function accountLink(path='/account/',context='/') {const u=new URL(path,ACCOUNT_ORIGIN);u.searchParams.set('return',safeContext(context));u.searchParams.set('theme',themeValue(document.documentElement.dataset.theme));return u.href;}
