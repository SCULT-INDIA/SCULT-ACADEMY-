import { ImageResponse } from "next/og";
import { LOGO_ORANGE, MARK_VIEWBOX, PETAL_H, PETAL_V } from "@/components/ui/logo";

export const alt = "Scult Academy — Sculpt your edge in the age of AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f7f3ec",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(246,194,68,0.55), transparent 45%), radial-gradient(circle at 100% 100%, rgba(234,101,38,0.45), transparent 50%)",
          color: "#17130f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="72" viewBox={MARK_VIEWBOX}>
            <path d={PETAL_H} fill={LOGO_ORANGE} />
            <path d={PETAL_V} fill={LOGO_ORANGE} />
            <path d={PETAL_H} fill={LOGO_ORANGE} transform="rotate(180)" />
            <path d={PETAL_V} fill={LOGO_ORANGE} transform="rotate(180)" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>Scult</span>
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#80776b" }}>ACADEMY</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>Sculpt your edge</div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -5, lineHeight: 1.05 }}>
            <span style={{ color: "#5a5248" }}>in the age of&nbsp;</span>
            <span style={{ color: "#cd4a12" }}>AI</span>
            <span style={{ color: "#f6c244" }}>.</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#5a5248" }}>
          {["Students", "Professionals", "Industries", "Enterprises"].map((label) => (
            <span
              key={label}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1.5px solid #d3c7b3",
                background: "rgba(255,255,255,0.6)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
