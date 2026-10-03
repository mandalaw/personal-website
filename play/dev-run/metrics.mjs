export class Metrics {
  constructor() {
    this.reset();
  }
  reset() {
    this.frames = 0;
    this.total = 0;
    this.max = 0;
    this.over33 = 0;
    this.over50 = 0;
    this.renderTotal = 0;
    this.histogram = new Uint32Array(251);
    this.heap = [];
  }
  frame(ms, cost) {
    if (ms <= 0) return;
    this.frames++;
    this.total += ms;
    this.max = Math.max(this.max, ms);
    if (ms > 33.4) this.over33++;
    if (ms > 50) this.over50++;
    this.renderTotal += cost;
    this.histogram[Math.min(250, Math.floor(ms))]++;
    if (this.frames % 1800 === 0 && performance.memory) {
      this.heap.push(performance.memory.usedJSHeapSize);
      if (this.heap.length > 20) this.heap.shift();
    }
  }
  snapshot() {
    let n = 0,
      p95 = 0;
    for (let i = 0; i < this.histogram.length; i++) {
      n += this.histogram[i];
      if (n >= this.frames * 0.95) {
        p95 = i + 1;
        break;
      }
    }
    return {
      frames: this.frames,
      fps: this.total ? Math.round((this.frames / this.total) * 10000) / 10 : 0,
      p95FrameMs: p95,
      maxFrameMs: Math.round(this.max * 10) / 10,
      over33ms: this.over33,
      over50ms: this.over50,
      meanRenderMs: this.frames
        ? Math.round((this.renderTotal / this.frames) * 100) / 100
        : 0,
      heapBytes: this.heap.slice(),
    };
  }
}
