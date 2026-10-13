// Generates every Scult Academy logo variation from the master mark geometry.
// Variations differ only in size and placement — the mark is always its
// original orange. Run with: npm run brand:assets
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Keep in sync with src/components/ui/logo.tsx
const PETAL_H =
  "M-115 -290L38 -395C80 -424 146 -424 188 -395L350 -287C362 -279 362 -266 350 -258C290 -217 210 -162 123 -162C40 -162 -50 -210 -115 -290Z";
const PETAL_V =
  "M-124 -255L-124 115C-124 132 -140 141 -156 134C-255 85 -375 20 -375 -115C-375 -205 -300 -297 -212 -297C-180 -297 -150 -288 -132 -273C-126 -268 -124 -262 -124 -255Z";
const LOGO = "#ff6f0f";
const INK = "#17130f";
const CREAM = "#f5efe6";
const INK_MUTE = "#80776b";
const CREAM_MUTE = "#aaa093";

/** Full-detail petals. */
const petals = `<g fill="${LOGO}"><path d="${PETAL_H}"/><path d="${PETAL_V}"/><g transform="rotate(180)"><path d="${PETAL_H}"/><path d="${PETAL_V}"/></g></g>`;

/** Small-size cut: each petal shrinks about its own centre, opening the gaps
    so the four shapes stay distinct at 16–32px. */
const shrink = (cx, cy, d) => `<path transform="translate(${cx} ${cy}) scale(0.9) translate(${-cx} ${-cy})" d="${d}"/>`;
const petalsSmall = `<g fill="${LOGO}">${shrink(123, -290, PETAL_H)}${shrink(-250, -78, PETAL_V)}<g transform="rotate(180)">${shrink(123, -290, PETAL_H)}${shrink(-250, -78, PETAL_V)}</g></g>`;

const svg = (viewBox, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>\n`;
const FONT = `font-family="'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif"`;
const MONO = `font-family="'Geist Mono', ui-monospace, Menlo, monospace"`;

const mark = svg("-380 -424 760 848", petals);
const markSquare = svg("-440 -440 880 880", petals);
const markSmall = svg("-440 -440 880 880", petalsSmall);
const appIcon = (tile, body = petals) =>
  svg("-512 -512 1024 1024", `<rect x="-512" y="-512" width="1024" height="1024" rx="232" fill="${tile}"/><g transform="scale(0.66)">${body}</g>`);
const horizontal = (word, sub) =>
  svg(
    "0 0 1240 300",
    `<g transform="translate(150 150) scale(0.33)">${petals}</g>` +
      `<text x="300" y="186" ${FONT} font-size="150" font-weight="700" letter-spacing="-6" fill="${word}">Scult</text>` +
      `<text x="776" y="182" ${MONO} font-size="52" font-weight="500" letter-spacing="10" fill="${sub}">ACADEMY</text>`,
  );
const stacked = (word, sub) =>
  svg(
    "0 0 800 820",
    `<g transform="translate(400 270) scale(0.52)">${petals}</g>` +
      `<text x="400" y="680" text-anchor="middle" ${FONT} font-size="170" font-weight="700" letter-spacing="-7" fill="${word}">Scult</text>` +
      `<text x="408" y="770" text-anchor="middle" ${MONO} font-size="50" font-weight="500" letter-spacing="18" fill="${sub}">ACADEMY</text>`,
  );

const svgFiles = {
  "mark.svg": mark,
  "mark-square.svg": markSquare,
  "mark-small.svg": markSmall,
  "logo-horizontal.svg": horizontal(INK, INK_MUTE),
  "logo-horizontal-on-dark.svg": horizontal(CREAM, CREAM_MUTE),
  "logo-stacked.svg": stacked(INK, INK_MUTE),
  "logo-stacked-on-dark.svg": stacked(CREAM, CREAM_MUTE),
  "app-icon.svg": appIcon("#ffffff"),
  "app-icon-dark.svg": appIcon(INK),
};

// [file, source svg, size]; ≤48px uses the small-size cut
const pngFiles = [
  ...[16, 32, 48].map((s) => [`mark-${s}.png`, markSmall, s]),
  ...[64, 128, 256, 512, 1024].map((s) => [`mark-${s}.png`, markSquare, s]),
  ...[180, 192, 512].map((s) => [`app-icon-${s}.png`, appIcon("#ffffff"), s]),
  ...[192, 512].map((s) => [`app-icon-dark-${s}.png`, appIcon(INK), s]),
];

const root = new URL("../", import.meta.url);
const brandDir = new URL("public/brand/", root);
await rm(brandDir, { recursive: true, force: true });
await mkdir(new URL("svg/", brandDir), { recursive: true });
await mkdir(new URL("png/", brandDir), { recursive: true });

for (const [name, content] of Object.entries(svgFiles)) {
  await writeFile(new URL(`svg/scult-academy-${name}`, brandDir), content);
}
for (const [name, source, size] of pngFiles) {
  await sharp(Buffer.from(source), { density: 72 * (size / 64) })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(fileURLToPath(new URL(`png/scult-academy-${name}`, brandDir)));
}

// Favicon uses the small-size cut
await writeFile(new URL("src/app/icon.svg", root), markSmall);

console.log(`Wrote ${Object.keys(svgFiles).length} SVGs and ${pngFiles.length} PNGs to public/brand/`);
