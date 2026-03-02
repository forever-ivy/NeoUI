import { mergeProps, useRender } from "@base-ui-components/react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const textVariants = cva("text-foreground antialiased leading-relaxed", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg tracking-tight",
      xl: "text-xl tracking-tight",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      warning: "text-warning",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    effect: {
      raised: "text-shadow-raised",
      flat: "",
      inset: "text-shadow-inset",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
    weight: "medium",
    effect: "raised",
  },
});

interface TextProps
  extends useRender.ComponentProps<"p">, VariantProps<typeof textVariants> {}

export default function Text(props: TextProps) {
  const mergedProps = mergeProps(props, {
    className: twMerge(
      textVariants({
        size: props.size,
        tone: props.tone,
        weight: props.weight,
        effect: props.effect,
      }),
      props.className,
    ),
  });
  const element = useRender({
    defaultTagName: "p",
    render: props.render,
    props: mergedProps,
  });

  return element;
}
