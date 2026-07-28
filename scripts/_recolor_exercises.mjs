import sharp from "sharp";
const GOLD = [0xff, 0xd7, 0x00];      // --gold
const DARK = [0x06, 0x05, 0x00];      // --background
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
// Recolor one 512² flat illustration → 16:9 transparent PNG, gold duotone figure.
export async function recolor(srcPath, outPath, size = [660, 372]) {
  const img = sharp(srcPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  // background colour = median-ish of the 4 corners
  const corner = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };
  const cs = [corner(0, 0), corner(W - 1, 0), corner(0, H - 1), corner(W - 1, H - 1)];
  const bg = [0, 1, 2].map(k => Math.round(cs.reduce((s, c) => s + c[k], 0) / 4));
  const out = Buffer.alloc(W * H * 4);
  const D_IN = 42, D_OUT = 78; // chroma-key feather band (distance to bg)
  for (let p = 0; p < W * H; p++) {
    const i = p * C, o = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    // figure alpha: 0 near bg colour, 255 well away, feathered between
    let a = dist <= D_IN ? 0 : dist >= D_OUT ? 255 : Math.round(((dist - D_IN) / (D_OUT - D_IN)) * 255);
    // luminance-based duotone: shadows→DARK (fades into card), highlights→GOLD
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const t = Math.min(1, Math.max(0, (lum - 0.15) / 0.7)); // stretch contrast a touch
    out[o] = lerp(DARK[0], GOLD[0], t);
    out[o + 1] = lerp(DARK[1], GOLD[1], t);
    out[o + 2] = lerp(DARK[2], GOLD[2], t);
    out[o + 3] = a;
  }
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 10 })                                   // crop to figure bbox
    .resize(size[0], size[1], { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}
// CLI: recolor the two prototype samples
const SP = process.env.SP;
if (process.argv[2] === "proto") {
  for (const f of ["push-up-peak", "glute-bridge-peak"]) {
    await recolor(`${SP}/rd_raw/${f}.webp`, `${SP}/rd_out/${f}.png`);
    console.log("recolored", f);
  }
}
// batch: recolor rd_raw/{id}.webp → public/exercises/{id}.png for every our-id
if (process.argv[2] === "batch") {
  const ids = ["wall-push-up","calf-raise","glute-bridge","knee-push-up","incline-push-up","dead-bug","bodyweight-squat","sumo-squat","forward-lunge","reverse-lunge","step-up","push-up","crunch","sit-up","bicycle-crunch","mountain-climber","bird-dog","cross-body-knee-touch","march-in-place","standing-side-crunch","arm-circles","chair-assisted-squat","high-knees"];
  let ok = 0;
  for (const id of ids) {
    try { await recolor(`${SP}/rd_raw/${id}.webp`, `public/exercises/${id}.png`, [640, 360]); ok++; }
    catch (e) { console.error("FAIL", id, e.message); }
  }
  console.log(`recolored ${ok}/${ids.length} → public/exercises/`);
}
