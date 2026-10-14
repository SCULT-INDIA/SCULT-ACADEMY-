// Copies browser-side vendor files that must be served as standalone assets.
// Runs on postinstall so the pdf.js worker always matches the installed version.
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("public/vendor", { recursive: true });
await copyFile("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/vendor/pdf.worker.min.mjs");
console.log("copied pdf.js worker to public/vendor/");
