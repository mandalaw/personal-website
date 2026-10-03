export class Camera {
  constructor() {
    this.x = null;
    this.y = 0;
    this.lead = 0;
  }
  reset() {
    this.x = null;
    this.y = 0;
    this.lead = 0;
  }
  update({
    x,
    y,
    vx = 0,
    ground = 421,
    width,
    dt,
    finish,
    quiet = false,
    board = false,
    frame = {anchor:.32,min:.29,max:.51},
  }) {
    if (this.x === null || quiet) this.x = x - width * frame.anchor;
    const desiredLead = board
      ? Math.max(-70, Math.min(120, vx * 0.3))
      : Math.max(-55, Math.min(75, vx * 0.22));
    this.lead += (desiredLead - this.lead) * Math.min(1, dt * 3);
    const screen = x - this.x + this.lead;
    let target = this.x;
    if (screen > width * frame.max) target += screen - width * frame.max;
    if (screen < width * frame.min) target += screen - width * frame.min;
    this.x += (target - this.x) * (quiet ? 1 : 1 - Math.exp(-dt * 7));
    this.x = Math.max(-width * frame.anchor, Math.min(finish - width * 0.53, this.x));
    const dy = Math.min(
      0,
      Math.max(-78, ground - 421 + Math.min(0, y - ground) * 0.16),
    );
    this.y += (dy - this.y) * (quiet ? 1 : 1 - Math.exp(-dt * 4));
    return this;
  }
}
