export const PALETTE = {
  navy: "#1b2333",
  deep: "#162031",
  blue: "#354763",
  middle: "#4b617a",
  coral: "#f77062",
  peach: "#f8a78f",
  paper: "#f3f1e9",
  sage: "#a9c4b6",
  muted: "#bac6d3",
};
export function round(c, x, y, w, h, r = 8) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
export function background(style, transparent = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 540;
  const c = canvas.getContext("2d"),
    sf = [
      "hills",
      "fog",
      "golden",
      "bridge",
      "cloud",
      "deploy",
      "finish",
    ].includes(style),
    night = style === "tunnel" || style === "deploy";
  if (!transparent) {
    const sky = c.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(
      0,
      night
        ? "#172333"
        : sf
          ? style === "golden" || style === "finish"
            ? "#626f91"
            : "#456a82"
          : style === "morning"
            ? "#82a2ab"
            : "#435e77",
    );
    sky.addColorStop(
      0.74,
      sf ? "#d7a084" : style === "morning" ? "#c2cec1" : "#899fa4",
    );
    sky.addColorStop(1, "#364c60");
    c.fillStyle = sky;
    c.fillRect(0, 0, 1800, 540);
    c.fillStyle = sf ? "#fac7a7" : "#d8e1d5";
    c.globalAlpha = 0.6;
    c.beginPath();
    c.arc(sf ? 1200 : 260, 118, sf ? 58 : 32, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
  for (let layer = 0; layer < 2; layer++) {
    c.fillStyle = layer ? "#34485e" : "#4a6578";
    for (let i = 0; i < 42; i++) {
      const x = i * 49 + (layer ? 20 : 0),
        h = 50 + ((i * 37 + layer * 43) % 120);
      c.fillRect(x, 358 - h, 35 + (i % 3) * 5, h);
      if (layer && i % 3 === 0) {
        c.fillStyle = "#c5bfb0";
        c.globalAlpha = 0.18;
        for (let a = 0; a < 3; a++)
          for (let b = 0; b < 3; b++)
            c.fillRect(x + 7 + a * 8, 364 - h + b * 17, 3, 6);
        c.globalAlpha = 1;
        c.fillStyle = "#34485e";
      }
    }
  }
  if (!sf) {
    c.fillStyle = "#416274";
    c.fillRect(0, 355, 1800, 65);
    c.strokeStyle = "#79959c66";
    for (let y = 370; y < 411; y += 13) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1800, y);
      c.stroke();
    }
  } else {
    for (let k = 0; k < 3; k++) {
      c.fillStyle = ["#516778", "#435b6c", "#344d61"][k];
      c.beginPath();
      c.moveTo(0, 410);
      for (let x = 0; x <= 1800; x += 15)
        c.lineTo(x, 328 + k * 28 + Math.sin(x / 170 + k) * 23);
      c.lineTo(1800, 540);
      c.lineTo(0, 540);
      c.fill();
    }
    if (["bridge", "finish"].includes(style)) {
      c.strokeStyle = "#c68176";
      c.fillStyle = "#bd7c73";
      c.lineWidth = 7;
      for (const x of [365, 1085]) {
        c.fillRect(x - 7, 124, 14, 300);
        c.fillRect(x + 54, 124, 14, 300);
        c.fillRect(x - 7, 152, 75, 10);
      }
      c.beginPath();
      c.moveTo(0, 230);
      c.quadraticCurveTo(190, 345, 400, 135);
      c.quadraticCurveTo(730, 447, 1120, 135);
      c.quadraticCurveTo(1500, 440, 1800, 220);
      c.stroke();
      c.lineWidth = 2;
      for (let x = 440; x < 1090; x += 34) {
        const t = (x - 400) / 720,
          y = 135 + 4 * 156 * t * (1 - t);
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, 385);
        c.stroke();
      }
      c.fillRect(0, 381, 1800, 9);
    }
  }
  if (style === "grid") {
    c.strokeStyle = "#9fb6b738";
    c.lineWidth = 1;
    for (let x = 0; x < 1800; x += 45) {
      c.beginPath();
      c.moveTo(x, 90);
      c.lineTo(x, 420);
      c.stroke();
    }
    for (let y = 100; y < 430; y += 40) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1800, y);
      c.stroke();
    }
  }
  if (style === "tunnel") {
    c.fillStyle = "#172735";
    c.fillRect(0, 0, 1800, 85);
    for (let x = 0; x < 1800; x += 240) {
      c.strokeStyle = "#273e4f";
      c.lineWidth = 17;
      c.beginPath();
      c.ellipse(x, 325, 190, 260, 0, Math.PI, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#e4c8a6";
      round(c, x - 25, 70, 50, 5, 2);
      c.fill();
    }
  }
  return canvas;
}
export function drawTrophy(c, x, y, scale = 1, glow = 0) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (glow) {
    const g = c.createRadialGradient(0, -48, 3, 0, -48, 90);
    g.addColorStop(0, "#f8a78f55");
    g.addColorStop(1, "#f8a78f00");
    c.fillStyle = g;
    c.fillRect(-100, -148, 200, 200);
  }
  c.strokeStyle = PALETTE.peach;
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(-23, -67);
  c.bezierCurveTo(-53, -84, -50, -25, -21, -34);
  c.moveTo(23, -67);
  c.bezierCurveTo(53, -84, 50, -25, 21, -34);
  c.stroke();
  c.fillStyle = PALETTE.peach;
  round(c, -27, -82, 54, 62, 12);
  c.fill();
  c.fillRect(-4, -20, 8, 23);
  round(c, -29, 1, 58, 10, 4);
  c.fill();
  c.fillStyle = PALETTE.coral;
  round(c, -22, -67, 44, 25, 4);
  c.fill();
  c.fillStyle = "#fff";
  c.font = "bold 17px Arial";
  c.textAlign = "center";
  c.fillText("DEV", 0, -49);
  c.restore();
}
