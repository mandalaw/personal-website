import { round } from "./scenery.mjs?v=5014aceabc11";
export const LAYERS = Object.freeze({
  sky: 0.025,
  city: 0.18,
  water: 0.27,
  transit: 0.38,
  street: 0.55,
  wildlife: 0.66,
  gameplay: 1,
});
export const CAT_COATS = ["tuxedo", "orange", "gray", "black", "tabby"];
export const CAT_STATES = [
  "walk",
  "sit",
  "stretch",
  "groom",
  "look",
  "sleep",
  "tail",
];
export const RACCOON_STATES = [
  "peek",
  "walk",
  "stand",
  "climb",
  "inspect",
  "hide",
];
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const mod = (x, n) => ((x % n) + n) % n;
export function cells(camera, width, depth, spacing, pad = 150) {
  const out = [];
  for (
    let i = Math.floor((camera * depth - pad) / spacing);
    i * spacing < camera * depth + width + pad;
    i++
  )
    out.push({ id: i, x: i * spacing - camera * depth });
  return out;
}
export function shadow(c, x, y, w = 20, alpha = 0.18) {
  c.save();
  c.fillStyle = `rgba(10,25,37,${alpha})`;
  c.beginPath();
  c.ellipse(x, y, w, w * 0.16, 0, 0, 7);
  c.fill();
  c.restore();
}
export function weatherAt(zone, x) {
  const progress = clamp((x - zone.start) / (zone.end - zone.start));
  // Toronto winter grows across roofs/snow, eases into the covered station. Bay never snows.
  const snow =
    zone.stage === 1
      ? 0.15 * smooth(progress)
      : zone.scene === "snow"
        ? 0.15 + 0.85 * smooth(progress)
        : zone.scene === "transit"
          ? 0.7 * (1 - smooth(progress))
          : 0;
  return {
    snow: clamp(snow),
    accumulation:
      zone.stage === 2 ? 2 + 4 * snow : zone.stage === 1 ? 2 * progress : 0,
    fog: zone.scene === "fog" ? 0.17 : zone.scene === "golden" ? 0.055 : 0,
    bay: zone.stage >= 6,
  };
}
function stroke(c, color, width, points) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
}
function ellipse(c, x, y, rx, ry, color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, 7);
  c.fill();
}
export function animalState(type, id, time, quiet = false) {
  const names = type === "cat" ? CAT_STATES : RACCOON_STATES;
  const offset = mod(id * 3.7, names.length * 5);
  const age = quiet ? offset : time + offset;
  return {
    name: names[Math.floor(age / 5) % names.length],
    phase: mod(age, 5) / 5,
  };
}
export function drawCat(
  c,
  x,
  y,
  coat = "tuxedo",
  state = "sit",
  phase = 0,
  scale = 1,
) {
  const colors = {
    tuxedo: "#2b3540",
    orange: "#b87547",
    gray: "#7a868f",
    black: "#252d38",
    tabby: "#807560",
  };
  const color = colors[coat],
    walk = state === "walk",
    sleep = state === "sleep",
    stretch = state === "stretch",
    groom = state === "groom";
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  shadow(c, 0, 1, 22);
  const bodyY = sleep ? -7 : walk || stretch ? -15 : -18;
  ellipse(
    c,
    0,
    bodyY,
    sleep ? 21 : 18,
    sleep ? 8 : walk || stretch ? 10 : 15,
    color,
  );
  const hx = sleep ? 15 : walk || stretch ? 17 : 9,
    hy = sleep ? -9 : stretch ? -13 : walk ? -24 : -38;
  if (walk || stretch)
    for (let i = 0; i < 4; i++) {
      const dx = walk ? Math.sin(phase * Math.PI * 8 + i * Math.PI) * 5 : 0;
      stroke(c, color, 4, [
        [i < 2 ? -11 : 11, -15],
        [i < 2 ? -10 + dx : 12 - dx, -1],
      ]);
    }
  else if (!sleep) {
    stroke(c, color, 5, [
      [7, -18],
      [9, -1],
    ]);
    stroke(c, color, 5, [
      [15, -18],
      [16, -1],
    ]);
  }
  ellipse(c, hx, hy, 10, 9, color);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(hx - 9, hy - 3);
  c.lineTo(hx - 8, hy - 14);
  c.lineTo(hx - 1, hy - 8);
  c.lineTo(hx + 7, hy - 13);
  c.lineTo(hx + 9, hy);
  c.fill();
  if (coat === "tuxedo") ellipse(c, 10, bodyY + 5, 5, 9, "#dde2d9");
  if (coat === "tabby" || coat === "orange") {
    for (let i = 0; i < 3; i++)
      stroke(c, "#483d3855", 2, [
        [-9 + i * 7, bodyY - 7],
        [-6 + i * 7, bodyY],
      ]);
  }
  stroke(c, color, 5, [
    [-15, bodyY],
    [-27, bodyY - 4],
    [-29 + (state === "tail" ? Math.sin(phase * 6) * 5 : 0), bodyY - 16],
  ]);
  if (sleep) {
    stroke(c, "#d9cbbb", 1, [
      [hx - 4, hy],
      [hx - 1, hy + 1],
      [hx + 2, hy],
    ]);
  } else {
    ellipse(c, hx + 3, hy - 1, 1.5, 1.4, "#dce2b4");
    ellipse(c, hx + 9, hy + 3, 2, 1.3, "#dfad9c");
  }
  if (groom)
    stroke(c, color, 5, [
      [14, -13],
      [hx + 6, hy + 9 + Math.sin(phase * 12) * 2],
    ]);
  c.restore();
}
export function drawRaccoon(c, x, y, state = "peek", phase = 0, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  shadow(c, 0, 1, 23);
  const hide = state === "hide",
    climb = state === "climb",
    peek = state === "peek";
  const rise = climb ? -phase * 34 : 0;
  if (!hide || phase < 0.65) {
    c.save();
    c.translate(0, rise);
    ellipse(c, 0, -14, 20, 13, "#83908f");
    for (let i = 0; i < 5; i++)
      ellipse(
        c,
        -20 - i * 3,
        -12 + i * 0.7,
        6,
        5,
        i % 2 ? "#83908f" : "#3c4b55",
      );
    for (let i = 0; i < 3; i++)
      stroke(c, "#43545c", 5, [
        [-8 + i * 10, -12],
        [
          -7 +
            i * 10 +
            (state === "walk" ? Math.sin(phase * 22 + i * 2) * 4 : 0),
          -1,
        ],
      ]);
    const headY = state === "stand" || peek ? -32 : -22;
    ellipse(c, 15, headY, 12, 10, "#99a3a0");
    ellipse(c, 7, headY - 9, 4, 4, "#43545c");
    ellipse(c, 21, headY - 9, 4, 4, "#43545c");
    ellipse(c, 17, headY, 11, 4, "#344550");
    ellipse(c, 13, headY - 1, 1.5, 1.5, "#e8e2cf");
    ellipse(c, 23, headY - 1, 1.5, 1.5, "#e8e2cf");
    ellipse(c, 26, headY + 4, 3, 2, "#263641");
    if (state === "inspect") {
      stroke(c, "#43545c", 4, [
        [13, -13],
        [29, -10],
      ]);
      ellipse(c, 31, -7, 5, 5, "#d6b98a");
    }
    c.restore();
  }
  if (peek || climb || hide) {
    c.fillStyle = "#4e696b";
    round(c, -23, -28, 33, 30, 3);
    c.fill();
    c.fillStyle = "#77938d";
    c.fillRect(-26, -31, 39, 5);
    stroke(c, "#b3c4b3", 2, [
      [-17, -25],
      [-17, -3],
    ]);
  }
  c.restore();
}
export function drawBird(c, x, y, kind, t, perched = false) {
  const color =
    kind === "gull" ? "#e4e3d4" : kind === "pigeon" ? "#6a7b8b" : "#465d6d";
  const size = kind === "small" ? 3 : 5;
  ellipse(c, x, y, size, perched ? size * 0.7 : 2.2, color);
  ellipse(c, x + size * 0.8, y - 2, 2.4, 2.4, color);
  if (perched)
    stroke(c, "#ba9c80", 1, [
      [x, y + 2],
      [x, y + 7],
      [x + 4, y + 7],
    ]);
  else {
    const flap = Math.sin(t * 5) * 5;
    stroke(c, color, 2, [
      [x - size * 2, y + flap],
      [x, y],
      [x + size * 2, y + flap],
    ]);
  }
}
export function transitPosition(camera, time, width, quiet = false) {
  // Wrap only while the entire train is outside the viewport, never at a camera tile seam.
  const cycle=width+1100;
  return mod((quiet?0:time*66)-camera*LAYERS.transit+600,cycle)-700;
}
export function drawTransit(c, w, camera, time, bay, quiet = false, weather = {}) {
  const y = bay ? 294 : 342,
    deck = bay ? 302 : 349;
  // Continuous guideway / rails; piers end on the midground street plane.
  c.fillStyle = bay ? "#637988" : "#6a7680";
  c.fillRect(0, deck, w, bay ? 12 : 3);
  for (const { x } of cells(camera, w, LAYERS.transit, bay ? 230 : 180)) {
    if (bay) {
      c.fillStyle = "#617481";
      c.fillRect(x, deck + 12, 15, 368 - deck - 12);
      c.fillRect(x - 12, deck + 10, 39, 8);
      shadow(c, x + 7, 369, 26, 0.13);
    } else {
      stroke(c, "#51616c", 2, [
        [x, 350],
        [x, 233],
        [x + 177, 233],
      ]);
      stroke(c, "#53636b", 1, [
        [x, 241],
        [x + 180, 241],
      ]);
    }
  }
  const spacing = bay ? 206 : 73,
    count = bay ? 3 : 5,
    head = transitPosition(camera, time, w, quiet);
  for (let car = 0; car < count; car++) {
    const x = head + car * spacing,
      ww = spacing - 5;
    if (x > w + 10 || x + ww < -10) continue;
    shadow(c, x + ww / 2, deck, ww / 2, 0.19);
    c.fillStyle = bay ? "#d2dcda" : "#b56360";
    round(c, x, y - 49, ww, 48, bay ? 10 : 6);
    c.fill();
    c.fillStyle = bay ? "#678ba1" : "#eee1cd";
    c.fillRect(x + 3, y - 13, ww - 6, 7);
    c.fillStyle = "#304b5f";
    round(c, x + 8, y - 41, ww - 16, 22, 3);
    c.fill();
    const doors = bay ? 3 : 1;
    for (let d = 0; d < doors; d++) {
      const dx = x + 12 + (d * (ww - 28)) / doors;
      c.fillStyle = bay ? "#9bb6c3" : "#daccc2";
      c.fillRect(dx, y - 42, 11, 36);
      stroke(c, "#57798c", 1, [
        [dx + 5, y - 42],
        [dx + 5, y - 6],
      ]);
    }
    for (let k = 0; k < (bay ? 7 : 2); k++) {
      const wx = x + 32 + k * 21;
      if (wx > x + ww - 10) break;
      c.fillStyle = "#91bcc533";
      c.fillRect(wx, y - 38, 13, 12);
      ellipse(c, wx + 6, y - 26, 2, 4, "#c2ba9e55");
    }
    if(weather.night>.3){ellipse(c,x+ww-7,y-19,3,2,'#f2dfb1');stroke(c,'#e5d1a244',2,[[x+ww-13,deck+4],[x+ww+23,deck+4]]);}
    if(weather.rain>.2){for(let n=0;n<3;n++)stroke(c,'#b5ced64d',1,[[x+22+n*17,y-39],[x+24+n*17,y-25]]);}
    for (const off of [14, ww - 14])
      ellipse(c, x + off, y - 1, 5, 5, "#2b4353");
    if (!bay && car === 2)
      stroke(c, "#40535f", 2, [
        [x + 24, y - 49],
        [x + 38, 242],
        [x + 21, 242],
        [x + 35, y - 49],
      ]);
    if (car < count - 1) {
      c.fillStyle = "#485d6b";
      c.fillRect(x + ww, y - 38, 5, 31);
    }
  }
  // Shelters and signs sit on a platform, not on the train.
  for (const { id, x } of cells(camera, w, LAYERS.transit, 920)) {
    c.fillStyle = "#6e8287";
    c.fillRect(x - 12, deck + 3, 225, 8);
    for (const dx of [0, 180]) c.fillRect(x + dx, deck - 86, 4, 89);
    c.fillStyle = "#9dafaa";
    c.beginPath();
    c.moveTo(x - 15, deck - 86);
    c.lineTo(x + 186, deck - 86);
    c.lineTo(x + 198, deck - 78);
    c.lineTo(x - 22, deck - 78);
    c.fill();
    c.fillStyle = "#284653";
    round(c, x + 18, deck - 71, 145, 17, 3);
    c.fill();
    c.fillStyle = "#e4e5d0";
    c.font = "9px Arial";
    c.textAlign = "center";
    c.fillText(
      bay ? "BAY RAPID / WESTBOUND" : "WATERFRONT / STREETCAR",
      x + 90,
      deck - 59,
    );
    if (id % 2 === 0) {
      const age=quiet?0:mod(time+id*3,18),flight=age>10?(age-10)/8:0;
      const arc=Math.sin(flight*Math.PI);
      drawBird(c,x+165+arc*95,deck-86-arc*48,"pigeon",time,flight===0);
    }
  }
}
function drawStreet(c, w, camera, time, bay, snow, quiet, mobile) {
  const depth = LAYERS.street;
  c.fillStyle = bay ? "#506b7166" : "#556c7b66";
  c.fillRect(0, 366, w, 12);
  for (const { id, x } of cells(camera, w, depth, 165)) {
    const type = mod(id, 7);
    shadow(c, x + 20, 369, 35, 0.13);
    if (type === 0) {
      // Timber bench with metal feet.
      c.fillStyle = "#987e6e";
      c.fillRect(x, 341, 53, 5);
      c.fillRect(x, 350, 53, 6);
      for (const n of [5, 42]) {
        c.fillStyle = "#465e6a";
        c.fillRect(x + n, 345, 4, 24);
      }
      if (snow) c.fillRect(x, 339, 53, snow);
    } else if (type === 1) {
      c.fillStyle = "#69807b";
      round(c, x, 343, 50, 25, 3);
      c.fill();
      for (let j = 0; j < 4; j++) {
        stroke(c, "#6d8f7b", 3, [
          [x + 10 + j * 8, 345],
          [x + 6 + j * 10, 315 - (j % 2) * 8],
        ]);
        ellipse(c, x + 5 + j * 10, 319 - (j % 2) * 8, 7, 14, "#7e9984");
      }
    } else if (type === 2) {
      stroke(c, "#6b8087", 3, [
        [x, 368],
        [x, 266],
        [x + 21, 266],
      ]);
      ellipse(c, x + 22, 269, 7, 3, "#e8d3a6");
    } else if (type === 3) {
      c.fillStyle = "#6f8586";
      round(c, x, 343, 21, 25, 3);
      c.fill();
      c.fillStyle = "#8aa09a";
      c.fillRect(x - 2, 340, 25, 4);
    } else if (type === 4) {
      c.fillStyle = "#a47567";
      round(c, x, 350, 11, 17, 3);
      c.fill();
      c.fillRect(x - 5, 355, 22, 5);
      ellipse(c, x + 5, 350, 6, 3, "#c1977d");
    } else if (type === 5) {
      for (const dx of [0, 28]) {
        c.strokeStyle = "#849d9e";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x + dx, 360, 9, 0, 7);
        c.stroke();
      }
      stroke(c, "#c2a391", 2, [
        [x, 360],
        [x + 12, 344],
        [x + 28, 360],
        [x, 360],
        [x + 19, 349],
      ]);
    } else {
      stroke(c, "#6e868c", 2, [
        [x, 367],
        [x, 345],
        [x + 100, 345],
        [x + 100, 367],
      ]);
      for (let n = 20; n < 100; n += 20)
        stroke(c, "#6e868c", 1, [
          [x + n, 346],
          [x + n, 367],
        ]);
    }
  }
  if (mobile) return;
  const cycleX=mod(time*31-camera*.55+350,w+180)-90;
  shadow(c,cycleX+14,370,30,.12);
  for(const dx of [0,29]){c.strokeStyle='#8ea9aa';c.lineWidth=2;c.beginPath();c.arc(cycleX+dx,360,8,0,7);c.stroke();}
  stroke(c,'#c5b29a',2,[[cycleX,360],[cycleX+11,344],[cycleX+29,360],[cycleX,360],[cycleX+19,346]]);
  ellipse(c,cycleX+13,326,4,4,'#c8b5a4');stroke(c,'#6e8f94',5,[[cycleX+13,332],[cycleX+6,345]]);
  const pedal=quiet?0:Math.sin(time*4)*4;
  stroke(c,'#455e72',3,[[cycleX+7,344],[cycleX+18+pedal,350],[cycleX+14,360]]);
  stroke(c,'#b6ab99',2,[[cycleX+13,334],[cycleX+24,344]]);
  const busX=mod(time*25-camera*.31+900,w+900)-160;
  c.fillStyle='#8e9e9e';round(c,busX,334,112,32,5);c.fill();c.fillStyle='#3f6073';
  for(let i=0;i<6;i++)c.fillRect(busX+8+i*16,339,12,12);
  c.fillStyle='#c0b89a';c.fillRect(busX+3,356,104,4);for(const dx of [18,94])ellipse(c,busX+dx,366,5,5,'#2b4657');
  for (const { id, x } of cells(camera, w, depth, 600)) {
    const step = quiet ? 0 : Math.sin(time * 3 + id) * 3,
      xx = x + 35 + (quiet ? 0 : Math.sin(time * 0.23 + id) * 55);
    ellipse(c, xx, 341, 4, 4, "#bcb7a7");
    c.fillStyle = id % 2 ? "#928d94" : "#8aa299";
    c.fillRect(xx - 4, 345, 8, 13);
    stroke(c, "#425b6e", 2, [
      [xx, 357],
      [xx - 4 - step, 368],
    ]);
    stroke(c, "#425b6e", 2, [
      [xx, 357],
      [xx + 4 + step, 368],
    ]);
  }
}
export function drawLivingWorld(
  c,
  w,
  game,
  camera,
  time,
  zone,
  quiet = false,
  mobile = false,
  authoredWeather = null,
) {
  const bay = zone.stage >= 6,
    toronto = zone.stage < 5,
    indoor = ["tunnel", "grid", "layers"].includes(zone.scene);
  const weather = authoredWeather || weatherAt(zone, game.distance),
    t = quiet ? 0 : time;
  if (!bay && !toronto) return;
  if (indoor) return;
  c.save();
  // Street wall: anchored repeats, brick courses, windows and roof snow.
  for (const { id, x } of cells(camera, w, LAYERS.city, 110)) {
    const hh = 46 + mod(id * 31, 90),
      y = 326 - hh;
    c.fillStyle = bay
      ? id % 2
        ? "#59758088"
        : "#788a8788"
      : id % 2
        ? "#7f777c99"
        : "#866d6988";
    c.fillRect(x, y, 98, hh);
    c.fillStyle = "#aec6c44d";
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 4; k++)
        c.fillRect(x + 10 + k * 22, y + 13 + row * 21, 9, 12);
    if (!bay) {
      c.fillStyle = "#493d4428";
      for (let yy = y + 8; yy < 326; yy += 9) c.fillRect(x, yy, 98, 1);
    }
    c.fillStyle = weather.accumulation ? "#d9e3df" : "#92a3a077";
    c.fillRect(x - 3, y - 3, 104, Math.max(3, weather.accumulation));
  }
  if (bay) {
    c.fillStyle = "#60868c55";
    c.fillRect(0, 322, w, 35);
    for (let i = 0; i < (mobile ? 12 : 25); i++) {
      const x = mod(i * 83 - camera * 0.27 + t * 4, w + 100) - 50;
      stroke(c, weather.night>.5?"#b8cbe355":weather.sun>.5?"#ebc69777":"#bfd5ca55", 1, [
        [x, 329 + (i % 5) * 5],
        [x + 23, 329 + (i % 5) * 5],
      ]);
    }
    const boat = mod(t * 18 - camera * 0.18, w + 450) - 170;
    shadow(c, boat + 50, 345, 56, 0.12);
    c.fillStyle = "#c1d0c5";
    c.beginPath();
    c.moveTo(boat, 329);
    c.lineTo(boat + 103, 329);
    c.lineTo(boat + 85, 341);
    c.lineTo(boat + 15, 341);
    c.fill();
    c.fillRect(boat + 25, 315, 54, 14);
    c.fillStyle = "#456879";
    for (let i = 0; i < 5; i++) c.fillRect(boat + 29 + i * 9, 319, 6, 6);
    const sail = mod(t * 11 - camera * 0.21 + 600, w + 350) - 150;
    stroke(c, "#bacabc", 1, [
      [sail, 309],
      [sail, 339],
    ]);
    c.fillStyle = "#dad9bb";
    c.beginPath();
    c.moveTo(sail - 2, 309);
    c.lineTo(sail - 24, 334);
    c.lineTo(sail - 2, 334);
    c.fill();
    stroke(c, "#587482", 3, [
      [sail - 25, 339],
      [sail + 10, 339],
    ]);
  }
  if (
    [
      "morning",
      "snow",
      "transit",
      "fog",
      "golden",
      "bridge",
      "finish",
    ].includes(zone.scene)
  )
    drawTransit(c, w, camera, t, bay, quiet, weather);
  // Trees occupy the street plane; canopies above the gameplay silhouette.
  for (const { id, x } of cells(camera, w, 0.48, mobile ? 470 : 330)) {
    const y = 366;
    shadow(c, x, y, 28, 0.13);
    stroke(c, "#6c7476", 5, [
      [x, y],
      [x - 3, 297],
      [x + 7, 279],
    ]);
    if (bay) {
      const sway=quiet?0:Math.sin(t*1.8+id)*(weather.wind??.3)*3;
      ellipse(c, x - 4+sway, 299, 25, 27, "#647f7166");
      ellipse(c, x + 12+sway, 283, 18, 26, "#80968188");
      ellipse(c, x - 16+sway, 285, 15, 22, "#7b948177");
    } else {
      for (const d of [-1, 1]) {
        stroke(c, "#67717c", 2, [
          [x - 2, 318],
          [x + d * 23, 289],
          [x + d * 26, 280],
        ]);
        stroke(c, "#67717c", 2, [
          [x - 2, 305],
          [x + d * 14, 271],
        ]);
      }
      if (weather.accumulation) {
        stroke(c, "#d8e3df", 2, [
          [x - 22, 290],
          [x - 2, 318],
          [x + 22, 290],
        ]);
      }
    }
  }
  drawStreet(c, w, camera, t, bay, weather.accumulation, quiet, mobile);
  // Distant traffic stays behind the player surface; its projection cannot enter collision code.
  const car = mod(t * 39 - camera * 0.31 + 340, w + 400) - 180;
  c.fillStyle = "#96a59e";
  round(c, car, 349, 67, 17, 5);
  c.fill();
  round(c, car + 15, 340, 34, 15, 5);
  c.fill();
  c.fillStyle = "#536f7c";
  c.fillRect(car + 21, 343, 23, 7);
  for (const off of [12, 54]) ellipse(c, car + off, 366, 5, 5, "#2b4657");
  for (const { id, x } of cells(
    camera,
    w,
    LAYERS.wildlife,
    mobile ? 600 : 340,
  )) {
    const s = animalState(bay ? "cat" : "raccoon", id, t, quiet);
    if(weather.rain>.35)s.name=bay?'sleep':'peek';
    if(!bay&&weather.snow>.5)s.name='peek';
    const move =
      s.name === "walk"
        ? Math.sin(s.phase * Math.PI) ** 2 * 55
        : s.name === "hide"
          ? 0
          : 0;
    c.save();c.translate(x+move,369);
    if(s.name==='walk'&&s.phase>.5)c.scale(-1,1);
    if(weather.rain>.35){c.fillStyle='#647780';c.fillRect(-28,-36,60,4);c.fillRect(-26,-32,3,32);c.fillRect(28,-32,3,32);}
    if (bay) drawCat(c,0,0,CAT_COATS[mod(id,5)],s.name,s.phase,.73);
    else drawRaccoon(c,0,0,s.name,s.phase,.7);
    c.restore();
  }
  const birds = mobile ? 3 : 7;
  for (let i = 0; i < birds; i++) {
    const x =
      mod(i * 219 + t * (12 + (i % 3) * 4) - camera * 0.07, w + 100) - 50;
    drawBird(
      c,
      x,
      100 + (i % 4) * 24 - (weather.rain||0)*22,
      i % 3 === 0 ? "gull" : i % 3 === 1 ? "pigeon" : "small",
      t + i,
    );
  }
  if (!mobile) {
    const age = mod(t + zone.stage * 7, 42);
    if (age < 14) {
      const x = (age * (w + 180)) / 14 - 90;
      stroke(c, "#d4d9cf66", 1, [
        [x - 90, 70],
        [x - 12, 70],
      ]);
      stroke(c, "#b3c7c3", 2, [
        [x - 10, 70],
        [x + 10, 70],
      ]);
      stroke(c, "#b3c7c3", 2, [
        [x - 2, 62],
        [x + 2, 70],
        [x - 2, 76],
      ]);
    }
  }
  if (!authoredWeather && weather.snow > 0 && !quiet) {
    const n = Math.floor((mobile ? 25 : 64) * weather.snow);
    for (let i = 0; i < n; i++) {
      const depth = i % 3,
        size = 0.7 + depth * 0.55;
      const x = mod(i * 73 + t * (8 + depth * 4) - camera * 0.025, w + 20) - 10,
        y = mod(i * 43 + t * (11 + depth * 8), 355);
      ellipse(c, x, y, size, size, "#edf0e07a");
    }
  }
  if (!authoredWeather && weather.fog) {
    const haze = c.createLinearGradient(0, 200, 0, 365);
    haze.addColorStop(0, "#d5dac500");
    haze.addColorStop(1, `rgba(216,222,205,${weather.fog})`);
    c.fillStyle = haze;
    c.fillRect(0, 200, w, 170);
  }
  c.restore();
}
