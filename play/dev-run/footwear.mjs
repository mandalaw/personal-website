import { material } from './palette.mjs?v=dd92ec3032ad';
// The Bible's dark low-top: ankle cuff, raised toe, heel and a continuous pale outsole.
// Local anchors are the sole contact point; transforms travel with the owning leg.
export function shoe(side, x, y, angle = 0, scale = 1) {
  const path=d=>d.replace(/-?\d+(?:\.\d+)?/g,n=>Number((Number(n)*scale).toFixed(3)));
  return `<g data-footwear="${side}" transform="translate(${x} ${y}) rotate(${angle})"><path data-ankle="${side}" d="${path('M-11-29H3V-18H-11Z')}" fill="${material('skin')}"/><path data-upper="${side}" d="${path('M-13-23H3L9-11 22-7V0H-18V-14Z')}" fill="${material('shoes')}"/><path data-sole="${side}" d="${path('M-17-1H21')}" fill="none" stroke="${material('sole')}" stroke-width="${3.5*scale}" stroke-linecap="round"/><path d="${path('M2-15L9-12')}" fill="none" stroke="${material('sole')}" stroke-width="${1.5*scale}" opacity=".7"/></g>`;
}
export function shoeDefinitions(definitions) {
  return definitions.replace(/<g id="dev-part-leg-(left|right)">([\s\S]*?)<\/g>/g, (_,side,body) => {
    const paths=body.match(/<(?:path|rect)\b[^>]*\/\s*>/g);
    // Preserve the exact standing-leg anatomy; make its existing shoe explicit.
    const sole=paths[3].replaceAll('var(--dev-paper,#e6e6e6)',material('sole'));
    return `<g id="dev-part-leg-${side}" data-leg="${side==='left'?'rear':'front'}">${paths[0]}${paths[1]}<g data-footwear="${side==='left'?'rear':'front'}">${paths[2].replace('<path ','<path data-upper="'+side+'" ')}${sole.replace('<path ','<path data-sole="'+side+'" ')}</g></g>`;
  });
}
