import { mergeProps, Switch, useRender } from "@base-ui-components/react";
import { cva, type VariantProps } from "class-variance-authority";

const switchVariants = cva(
  "inline-flex h-5.5 w-12 shrink-0 items-center justify-start rounded-full border-1 border-highlight bg-background p-0.25 shadow-inset transition-all duration-250 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 data-[checked]:border-primary data-[checked]:bg-linear-to-tl data-[checked]:from-primary/5 data-[checked]:to-primary/25 data-[checked]:shadow-raised",
);

const thumbVariants = cva(
  "relative block h-5 w-5 translate-x-0 rounded-full border-1 border-highlight bg-background shadow-inset transition-all duration-250 ease-out after:absolute after:top-1/2 after:left-1/2 after:h-1 after:w-1 after:-translate-1/2 after:rounded-full after:bg-muted-foreground data-[checked]:translate-x-6 data-[checked]:after:bg-primary",
);

interface SwitchProps
  extends
    useRender.ComponentProps<"switch">,
    VariantProps<typeof switchVariants> {}

export default function NeoSwitch(props: SwitchProps) {
  const mergedProps = mergeProps(props, { className: switchVariants() });
  return (
    <Switch.Root {...mergedProps}>
      <Switch.Thumb className={thumbVariants()} />
    </Switch.Root>
  );
}
