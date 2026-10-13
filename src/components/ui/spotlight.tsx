"use client";

import type { ComponentProps, CSSProperties, PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** A surface whose soft radial highlight follows the pointer. */
export function Spotlight({
  className,
  spot,
  style,
  children,
  ...props
}: ComponentProps<"div"> & { spot?: string }) {
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onPointerMove={onPointerMove}
      className={cn("spotlight", className)}
      style={spot ? ({ ...style, "--spot": spot } as CSSProperties) : style}
      {...props}
    >
      {children}
    </div>
  );
}
