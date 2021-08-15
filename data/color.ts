const stringify = require("color-stringify");
const space = require("color-space");
const parse = require("color-parse");

type Luv = { l: number; u: number; v: number };

const toLuv = (arr: [number, number, number]): Luv => ({
  l: arr[0],
  u: arr[1],
  v: arr[2],
});

// https://github.com/lucasb-eyer/go-ul/blob/4d8f45c41ac988423342507a1fb6050239b5a742/.go#L882
function blendLuv(luv1: Luv, luv2: Luv, t: number): Luv {
  const { l: l1, u: u1, v: v1 } = luv1;
  const { l: l2, u: u2, v: v2 } = luv2;

  return {
    l: l1 + t * (l2 - l1),
    u: u1 + t * (u2 - u1),
    v: v1 + t * (v2 - v1),
  };
}

// https://github.com/charmbracelet/lipgloss/blob/51800631a29c383f2975f868d700a6ca18135653/example/main.go#L338
function grid(xSteps, ySteps) {
  // hex to rgb to luv
  const x0y0 = toLuv(space.rgb.luv(parse("#F25D94").values));
  const x1y0 = toLuv(space.rgb.luv(parse("#EDFF82").values));
  const x0y1 = toLuv(space.rgb.luv(parse("#643AFF").values));
  const x1y1 = toLuv(space.rgb.luv(parse("#14F9D5").values));

  const x0 = [];
  for (let i = 0; i < ySteps; i++) {
    x0[i] = blendLuv(x0y0, x0y1, i / ySteps);
  }

  const x1 = [];
  for (let i = 0; i < ySteps; i++) {
    x1[i] = blendLuv(x1y0, x1y1, i / ySteps);
  }

  const grid: string[][] = [];
  for (let x = 0; x < ySteps; x++) {
    const y0 = x0[x];
    grid[x] = [];

    for (let y = 0; y < xSteps; y++) {
      grid[x][y] = stringify(
        space.luv
          .rgb(Object.values(blendLuv(y0, x1[x], y / xSteps)))
          .map((v) => Math.floor(v)),
        "hex"
      );
    }
  }

  return grid;
}

export default { stringify, space, parse, toLuv, blendLuv, grid };
