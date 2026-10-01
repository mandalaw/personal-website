/** One idle deadline. A blocked tick always grants a fresh interval on release. */
export class IdleClock {
  constructor(now, interval = 10000) { this.interval = interval; this.since = now; }
  reset(now) { this.since = now; }
  tick(now, blocked) {
    if (blocked) { this.reset(now); return false; }
    if (now - this.since < this.interval) return false;
    this.reset(now); return true;
  }
}
export const nextMode = mode => ({a:'b', b:'c', c:'a'})[mode] || 'a';
