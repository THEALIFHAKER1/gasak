import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("scroll-m-20 tracking-tight", {
  variants: {
    variant: {
      default: "text-3xl font-bold",
      h1: "text-4xl font-extrabold lg:text-5xl",
      h2: "text-3xl font-semibold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  title: string;
  description?: string;
}

export function Heading({
  title,
  description,
  variant,
  className,
  ...props
}: HeadingProps) {
  return (
    <div className="space-y-1">
      <h1 className={cn(headingVariants({ variant, className }))} {...props}>
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}
