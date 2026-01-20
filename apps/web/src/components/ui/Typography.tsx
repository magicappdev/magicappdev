import { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/utils";

const variants = {
  display: "text-4xl md:text-5xl font-bold tracking-tight",
  headline: "text-2xl md:text-3xl font-semibold tracking-tight",
  title: "text-xl font-medium tracking-tight",
  body: "text-base font-normal leading-relaxed text-foreground/80",
  label: "text-sm font-medium tracking-wide uppercase text-foreground/60",
};

interface TypographyProps extends ComponentProps<"div"> {
  variant?: keyof typeof variants;
  as?: ElementType;
}

export function Typography({
  variant = "body",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component =
    as ||
    (variant.startsWith("display") || variant.startsWith("headline")
      ? "h1"
      : "p");

  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}
