export class AudioBus {
  constructor() {
    this.enabled = false;
    this.context = null;
  }
  async enable(value) {
    this.enabled = !!value;
    if (!value) {
      this.context?.suspend();
      return;
    }
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) {
      this.enabled = false;
      return;
    }
    this.context ||= new Audio();
    try {
      await this.context.resume();
      this.play("ui");
    } catch {
      this.enabled = false;
    }
  }
  play(kind) {
    const c = this.context;
    if (!this.enabled || !c || c.state !== "running") return;
    const notes = {
      jump: [260, 390, 0.09],
      pickup: [620, 880, 0.1],
      hit: [155, 80, 0.12],
      checkpoint: [390, 590, 0.18],
      win: [520, 1040, 0.32],
      ui: [340, 420, 0.045],
      slide: [140, 240, 0.19],
      land: [90, 65, 0.07],
      near: [440, 600, 0.06],
      cat: [590, 390, 0.16],
      crowd: [220, 270, 0.26],
    };
    const [from, to, duration] = notes[kind] || notes.ui,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = kind === "hit" ? "triangle" : "sine";
    o.frequency.setValueAtTime(from, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(to, c.currentTime + duration);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.035, c.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration + 0.01);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  suspend() {
    this.context?.suspend();
  }
  resume() {
    if (this.enabled) this.context?.resume().catch(() => {});
  }
  dispose() {
    this.context?.close();
    this.context = null;
  }
}
