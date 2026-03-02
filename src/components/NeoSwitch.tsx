import { mergeProps, Switch, useRender } from "@base-ui-components/react";
import { cva, type VariantProps } from "class-variance-authority";

const switchVariants = cva(
  "cursor-pointer h-5.5 w-12 rounded-full focus-visible:outline-none focus-visible:ring-offset-2 foucs-visible:ring-foreground foucus-visible:ring-2 bg-background shadow-inset data-[checked]:bg-primary",
);
const thumbVariants = cva();

interface SwitchProps
  extends
    useRender.ComponentProps<"switch">,
    VariantProps<typeof switchVariants> {}

export default function NeoSwitch(props: SwitchProps) {
  const mergedProps = mergeProps(props, { className: switchVariants() });

  const thumbProps = mergeProps(props, { className: thumbVariants() });
  return (
    <Switch.Root {...mergedProps}>
      <Switch.Thumb {...thumbProps} />
    </Switch.Root>
  );
}
