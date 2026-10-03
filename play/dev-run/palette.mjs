// Character Bible (Pass 16): one material palette for every pose, independent of scenery.
export const PALETTES=Object.freeze({
 light:Object.freeze({ink:'#2f2e41',jacket:'#2f2e41',pants:'#2f2e41',shoes:'#2f2e41',hair:'#2f2e41',shirt:'#fa6771',skin:'#ffb8b8',sole:'#e6e6e6',paper:'#e6e6e6',device:'#3f3d56',screen:'#f2f2f2',sage:'#8a9d91'}),
 dark:Object.freeze({ink:'#3d4a63',jacket:'#3d4a63',pants:'#3d4a63',shoes:'#3d4a63',hair:'#3d4a63',shirt:'#fa6771',skin:'#ffb8b8',sole:'#e6e6e6',paper:'#39475b',device:'#4d5d7a',screen:'#1b2230',sage:'#7e9c96'})
});
export const material=name=>`var(--dev-${name},${PALETTES.light[name]})`;
export function resolvePalette(svg,theme='light'){
 const colors=PALETTES[theme]||PALETTES.light;
 return svg.replace(/var\(--dev-([a-z]+),(#[\da-f]+)\)/g,(_,name,fallback)=>colors[name]||fallback);
}
