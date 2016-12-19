// Mostly copied from here:
// http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript

exports.rgbToHsv = (r, g, b) => {
  let rr;
  let gg;
  let bb;
  let h;
  let s;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  let v = Math.max(r, g, b);
  let diff = v - Math.min(r, g, b);

  const diffc = (c) => {
    return (v - c) / 6 / diff + 1 / 2;
  };

  if (diff == 0) {
      h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
        h = bb - gg;
    } else if (g === v) {
        h = (1 / 3) + rr - bb;
    } else if (b === v) {
        h = (2 / 3) + gg - rr;
    }

    if (h < 0) {
        h += 1;
    } else if (h > 1) {
        h -= 1;
    }
  }

  return {
    h: Math.round(h * 1536),
    s: Math.round(s * 255),
    v: Math.round(v * 255)
  };
}
