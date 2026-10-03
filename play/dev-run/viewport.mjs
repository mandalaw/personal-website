const clamp = (min, n, max) => Math.max(min, Math.min(n, max));
// CSS pixels select the composition; simulation coordinates and physics stay unchanged.
export function viewportPlan({ width, height, immersive = false, mobile = false, safeLeft = 0, safeRight = 0, finale = false }) {
  width = Math.max(1, width); height = Math.max(1, height);
  const portrait = width < height;
  if (!immersive && !mobile) return { width: 540 * width / height, height: 540, cameraY: 0, anchor: .32, min: .29, max: .51, quality: 'full', portrait, mode: 'desktop' };
  const worldHeight = finale && !portrait ? Math.max(540, Math.min(680, height / 1.08)) : portrait
    ? height * clamp(1.48, 640 / width, 1.95)
    : clamp(420, height / clamp(.55, .54 + width / 8500, .76), 1000);
  const worldWidth = worldHeight * width / height;
  const scale = height / worldHeight;
  const groundPixel = portrait ? height * .70 : Math.min(height * .78, height - (immersive ? 84 : 32));
  const left = safeLeft / scale, usable = worldWidth - (safeLeft + safeRight) / scale;
  return { width: worldWidth, height: worldHeight, cameraY: finale && !portrait ? 0 : 421 - groundPixel / scale,
    anchor: (left + usable * (portrait ? .34 : .32)) / worldWidth,
    min: (left + usable * .27) / worldWidth, max: (left + usable * (portrait ? .45 : .43)) / worldWidth,
    quality: width < 1000 || height < 500 ? 'balanced' : 'full', portrait,
    mode: portrait ? 'portrait' : height < 450 ? 'short-landscape' : 'landscape' };
}
export const MODES = Object.freeze(['PAGE', 'ENTERING', 'IMMERSIVE', 'ROTATE_PROMPT', 'PAUSED', 'EXITING']);
const links = { PAGE:['ENTERING'], ENTERING:['IMMERSIVE','ROTATE_PROMPT','PAUSED','EXITING'], IMMERSIVE:['ROTATE_PROMPT','PAUSED','EXITING'], ROTATE_PROMPT:['IMMERSIVE','PAUSED','EXITING'], PAUSED:['IMMERSIVE','ROTATE_PROMPT','EXITING'], EXITING:['PAGE'] };
export class ImmersiveState {
  constructor(){this.value='PAGE';}
  set(next){if(next===this.value)return false;if(!links[this.value]?.includes(next))return false;this.value=next;return true;}
  get active(){return this.value!=='PAGE'&&this.value!=='EXITING';}
}
