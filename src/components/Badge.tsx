import { mergeProps } from "@base-ui-components/react/merge-props";
import { useRender } from "@base-ui-components/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-background px-2.5 py-0.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground shadow-raised hover:shadow-inset",
        primary:
          "bg-linear-to-tl from-primary/5 to-primary/25 text-primary shadow-raised hover:shadow-inset",
        destructive:
          "bg-linear-to-tl from-destructive/5 to-destructive/25 text-destructive shadow-raised hover:shadow-inset",
        warning:
          "bg-linear-to-tl from-warning/5 to-warning/25 text-warning shadow-raised hover:shadow-inset",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends useRender.ComponentProps<"div">, VariantProps<typeof badgeVariants> {}

export function Badge(props: BadgeProps) {
  const { render, className, variant, ...otherProps } = props;

  const mergedProps = mergeProps(otherProps, {
    className: badgeVariants({ variant, className }),
  });

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergedProps,
  });

  return element;
}
