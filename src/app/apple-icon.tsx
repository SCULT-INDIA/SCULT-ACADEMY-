import { ImageResponse } from "next/og";
import { LOGO_ORANGE, PETAL_H, PETAL_V } from "@/components/ui/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
        <svg width="180" height="180" viewBox="-512 -512 1024 1024">
          <g transform="scale(0.62)">
            <path d={PETAL_H} fill={LOGO_ORANGE} />
            <path d={PETAL_V} fill={LOGO_ORANGE} />
            <path d={PETAL_H} fill={LOGO_ORANGE} transform="rotate(180)" />
            <path d={PETAL_V} fill={LOGO_ORANGE} transform="rotate(180)" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
