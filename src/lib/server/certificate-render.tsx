import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { unstable_rethrow } from "next/navigation";
import { ImageResponse } from "next/og";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import { LOGO_ORANGE, PETAL_H, PETAL_V } from "@/components/ui/logo";
import { type CertificateView } from "./certificates";
import { contentMime, readContentBytes } from "./content";

/* ──────────────────────────────────────────────────────────────
   Co-branded certificate (JuvenileAI × Scult Academy).
   Designed on a 1000 × 675 grid (13.33 × 9 in, the reference size)
   and rendered at any scale: 2× for screens, 3× for print.
   ────────────────────────────────────────────────────────────── */

export const CERT_W = 1000;
export const CERT_H = 675;

const C = {
  navy: "#19304E",
  slate: "#526989",
  green: "#37B184",
  orange: LOGO_ORANGE,
  paper: "#FFFEFB",
  line: "#E6E9EE",
};

const fontFile = (name: string) => readFile(join(process.cwd(), "src/assets/fonts", name));
const fonts = Promise.all([
  fontFile("geist-sans-latin-400-normal.woff"),
  fontFile("geist-sans-latin-500-normal.woff"),
  fontFile("geist-sans-latin-700-normal.woff"),
  fontFile("bricolage-grotesque-latin-700-normal.woff"),
  fontFile("instrument-serif-latin-400-italic.woff"),
]).then(([g4, g5, g7, b7, i4]) => [
  { name: "Geist", data: g4, weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: g5, weight: 500 as const, style: "normal" as const },
  { name: "Geist", data: g7, weight: 700 as const, style: "normal" as const },
  { name: "Bricolage", data: b7, weight: 700 as const, style: "normal" as const },
  { name: "Instrument", data: i4, weight: 400 as const, style: "italic" as const },
]);

const partnerLogo = readFile(join(process.cwd(), "public/partners/juvenileai-logo.png")).then(
  (b) => `data:image/png;base64,${b.toString("base64")}`,
);

/** A content-repo image with its pixel size (PNG/JPEG header), or null when missing. */
async function contentImage(path: string | undefined) {
  if (!path) return null;
  let bytes: Uint8Array | null = null;
  try {
    bytes = await readContentBytes(path);
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
  if (!bytes) return null;
  const buf = Buffer.from(bytes);
  let width = 0;
  let height = 0;
  if (buf.subarray(1, 4).toString() === "PNG") {
    width = buf.readUInt32BE(16);
    height = buf.readUInt32BE(20);
  } else {
    // JPEG: walk segments to the first SOFn marker.
    for (let i = 2; i < buf.length - 9; ) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        height = buf.readUInt16BE(i + 5);
        width = buf.readUInt16BE(i + 7);
        break;
      }
      i += 2 + len;
    }
  }
  if (!width || !height) return null;
  return { src: `data:${contentMime(path)};base64,${buf.toString("base64")}`, width, height };
}

function Corner({ s, color, pos }: { s: number; color: string; pos: "tl" | "tr" | "bl" | "br" }) {
  const len = 70 * s;
  const w = 5 * s;
  const inset = 26 * s;
  const v = pos[0] === "t" ? { top: inset } : { bottom: inset };
  const h = pos[1] === "l" ? { left: inset } : { right: inset };
  return (
    <div style={{ position: "absolute", display: "flex", width: len, height: len, ...v, ...h }}>
      <div
        style={{
          position: "absolute",
          [pos[0] === "t" ? "top" : "bottom"]: 0,
          left: 0,
          width: len,
          height: w,
          background: color,
          borderRadius: w,
        }}
      />
      <div
        style={{
          position: "absolute",
          [pos[1] === "l" ? "left" : "right"]: 0,
          top: 0,
          width: w,
          height: len,
          background: color,
          borderRadius: w,
        }}
      />
    </div>
  );
}

async function certificateElement(view: CertificateView, s: number) {
  const [logo, qr, signatures] = await Promise.all([
    partnerLogo,
    QRCode.toDataURL(view.verifyUrl, {
      margin: 0,
      width: Math.round(110 * s),
      errorCorrectionLevel: "M",
      color: { dark: C.navy, light: "#00000000" },
    }),
    Promise.all(view.signatories.map((sig) => contentImage(sig.signature))),
  ]);
  const px = (n: number) => n * s;
  const verifyLabel = view.verifyUrl.replace(/^https?:\/\//, "");

  return (
    <div
      style={{
        width: px(CERT_W),
        height: px(CERT_H),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        background: C.paper,
        fontFamily: "Geist",
        color: C.navy,
      }}
    >
      {/* Frame */}
      <div
        style={{
          position: "absolute",
          top: px(14),
          left: px(14),
          right: px(14),
          bottom: px(14),
          border: `${px(1.2)}px solid ${C.line}`,
          borderRadius: px(10),
          display: "flex",
        }}
      />
      <Corner s={s} pos="tl" color={C.green} />
      <Corner s={s} pos="br" color={C.green} />
      <Corner s={s} pos="tr" color={C.orange} />
      <Corner s={s} pos="bl" color={C.orange} />

      {/* Co-brand lockup */}
      <div style={{ display: "flex", alignItems: "center", marginTop: px(46), gap: px(22) }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
        <img src={logo} alt="" width={px(150)} height={px(29.3)} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", width: px(1.2), height: px(32), background: "#C9D1DC" }} />
        <div style={{ display: "flex", alignItems: "center", gap: px(9) }}>
          <svg width={px(25)} height={px(28)} viewBox="-380 -424 760 848">
            <path d={PETAL_H} fill={LOGO_ORANGE} />
            <path d={PETAL_V} fill={LOGO_ORANGE} />
            <path d={PETAL_H} fill={LOGO_ORANGE} transform="rotate(180)" />
            <path d={PETAL_V} fill={LOGO_ORANGE} transform="rotate(180)" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", gap: px(6) }}>
            <span style={{ fontFamily: "Bricolage", fontWeight: 700, fontSize: px(24), letterSpacing: px(-0.8), color: "#17130F" }}>
              Scult
            </span>
            <span style={{ fontSize: px(9.5), fontWeight: 500, letterSpacing: px(2), color: "#80776B" }}>ACADEMY</span>
          </div>
        </div>
      </div>

      {/* Title block */}
      <div
        style={{
          display: "flex",
          marginTop: px(30),
          fontFamily: "Bricolage",
          fontWeight: 700,
          fontSize: px(52),
          letterSpacing: px(4),
          color: C.navy,
        }}
      >
        CERTIFICATE
      </div>
      <div style={{ display: "flex", marginTop: px(4), fontSize: px(15), fontWeight: 700, letterSpacing: px(7.5), color: C.navy }}>
        {view.kind.replace(/^Certificate\s+/i, "").toUpperCase()}
      </div>
      <div style={{ display: "flex", marginTop: px(22), fontSize: px(10.5), fontWeight: 500, letterSpacing: px(2.4), color: C.slate }}>
        THIS IS TO CERTIFY THAT
      </div>

      {/* Name */}
      <div
        style={{
          display: "flex",
          marginTop: px(4),
          fontFamily: "Instrument",
          fontStyle: "italic",
          fontSize: px(view.name.length > 26 ? 46 : 56),
          color: C.navy,
          lineHeight: 1.1,
        }}
      >
        {view.name}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: px(6), width: px(560) }}>
        <div style={{ display: "flex", flex: 1, height: px(1.6), background: C.green }} />
        <div style={{ display: "flex", width: px(7), height: px(7), borderRadius: px(7), background: C.orange, margin: `0 ${px(8)}px` }} />
        <div style={{ display: "flex", flex: 1, height: px(1.6), background: C.green }} />
      </div>

      <div style={{ display: "flex", marginTop: px(14), fontSize: px(13), color: C.slate }}>{view.statement}</div>
      <div
        style={{
          display: "flex",
          marginTop: px(6),
          fontFamily: "Bricolage",
          fontWeight: 700,
          fontSize: px(27),
          letterSpacing: px(-0.4),
          color: C.navy,
          textAlign: "center",
        }}
      >
        {view.title}
      </div>
      {view.subtitle && (
        <div style={{ display: "flex", marginTop: px(3), fontSize: px(15), fontWeight: 500, color: C.navy }}>
          – {view.subtitle}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: px(12), marginTop: px(12), fontSize: px(12.5), fontWeight: 700 }}>
        <span style={{ color: C.green }}>{view.dateLabel}</span>
        <span style={{ color: "#C9D1DC" }}>|</span>
        <span style={{ color: C.green }}>{view.issuedLine || `Organized by ${view.organizer}`}</span>
      </div>
      {view.description && (
        <div
          style={{
            display: "flex",
            marginTop: px(8),
            maxWidth: px(640),
            fontSize: px(12.5),
            lineHeight: 1.45,
            color: C.slate,
            textAlign: "center",
          }}
        >
          {view.description}
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "center", gap: px(56), marginTop: px(26) }}>
        {view.signatories.map((sig, i) => (
          <div key={sig.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: px(200) }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", height: px(46), width: px(200) }}>
              {signatures[i] ? <Signature image={signatures[i]!} s={s} /> : null}
            </div>
            <div style={{ display: "flex", width: px(180), height: px(1.2), background: C.green, marginTop: px(3) }} />
            <div style={{ display: "flex", marginTop: px(6), fontSize: px(12.5), fontWeight: 700, color: C.navy }}>{sig.name}</div>
            <div style={{ display: "flex", marginTop: px(2), fontSize: px(10.5), fontWeight: 500, color: C.slate }}>{sig.title}</div>
          </div>
        ))}
      </div>

      {/* Footer: number + verification */}
      <div
        style={{
          position: "absolute",
          left: px(56),
          right: px(60),
          bottom: px(44),
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: px(3) }}>
          <span style={{ fontSize: px(10.5), fontWeight: 700, letterSpacing: px(1), color: C.slate }}>
            CERTIFICATE NO. {view.id}
          </span>
          <span style={{ fontSize: px(9.5), fontWeight: 500, letterSpacing: px(1), color: C.slate }}>
            VERIFICATION CODE {view.code}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: px(10) }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: px(2) }}>
            <span style={{ fontSize: px(9.5), fontWeight: 700, letterSpacing: px(1), color: C.navy }}>SCAN TO VERIFY</span>
            <span style={{ fontSize: px(8.5), color: C.slate }}>{verifyLabel}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
          <img src={qr} alt="" width={px(58)} height={px(58)} />
        </div>
      </div>
    </div>
  );
}

function Signature({ image, s }: { image: { src: string; width: number; height: number }; s: number }) {
  // Fit inside a 170 × 44 box, keeping the signature's aspect ratio.
  const scale = Math.min((170 * s) / image.width, (44 * s) / image.height);
  // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
  return <img src={image.src} alt="" width={image.width * scale} height={image.height * scale} />;
}

/** PNG of the certificate. scale 2 ≈ 2000 px wide (screen), 3 ≈ 225 dpi (print). */
export async function renderCertificatePng(view: CertificateView, scale = 2) {
  return new ImageResponse(await certificateElement(view, scale), {
    width: CERT_W * scale,
    height: CERT_H * scale,
    fonts: await fonts,
  });
}

/** Print-ready PDF at the reference size (13.33 × 9 in). */
export async function renderCertificatePdf(view: CertificateView) {
  const png = new Uint8Array(await (await renderCertificatePng(view, 3)).arrayBuffer());
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${view.kind} — ${view.name}`);
  pdf.setAuthor(`${view.organizer} × ${view.partner}`);
  pdf.setSubject(view.title);
  pdf.setKeywords([view.id, "certificate", view.organizer, view.partner]);
  pdf.setCreator("Scult Academy");
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([960, 648]);
  page.drawImage(image, { x: 0, y: 0, width: 960, height: 648 });
  return pdf.save();
}

export const certificateFileName = (view: CertificateView, ext: "pdf" | "png") =>
  `${view.id}-${view.name.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}.${ext}`;
