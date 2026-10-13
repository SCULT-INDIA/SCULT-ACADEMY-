import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "matte" | "ink" | "outline" | "cream" | "ghost-dark";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

const arrowSizes: Record<Size, string> = {
  sm: "size-6 -mr-1.5",
  md: "size-7 -mr-2.5",
  lg: "size-8 -mr-3",
};

const arrowTones: Record<Variant, string> = {
  matte: "bg-white/18 text-white",
  ink: "bg-cream/12 text-cream",
  outline: "bg-ink text-cream",
  cream: "bg-ember-600 text-white",
  "ghost-dark": "bg-cream/12 text-cream",
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
};

export function ButtonLink({
  variant = "matte",
  size = "md",
  arrow = false,
  className,
  children,
  href = "#",
  ...props
}: ButtonLinkProps) {
  const classes = cn("btn", `btn-${variant}`, sizes[size], className);
  const content = (
    <>
      {children}
      {arrow && (
        <span className={cn("btn-arrow", arrowSizes[size], arrowTones[variant])} aria-hidden="true">
          <ArrowRight className="size-[55%]" strokeWidth={2.4} />
        </span>
      )}
    </>
  );

  // Client-side navigation for internal paths; plain anchors for #hash, mailto: and external links.
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {content}
    </a>
  );
}
