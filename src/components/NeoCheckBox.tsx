import { Checkbox, mergeProps } from "@base-ui-components/react";
import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type React from "react";

const checkboxVariants = cva(
  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-1 border-highlight bg-background shadow-inset transition-all duration-350 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 data-[checked]:border-primary/50 data-[checked]:bg-linear-to-tl data-[checked]:from-primary/5 data-[checked]:to-primary/25 data-[checked]:shadow-raised data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed ",
);

const checkIndicatorVariants = cva(
  "flex items-center justify-center text-primary ",
);

type CheckBoxProps = React.ComponentProps<typeof Checkbox.Root>;

export default function NeoCheckBox(props: CheckBoxProps) {
  const mergedProps = mergeProps(props, { className: checkboxVariants() });
  return (
    <Checkbox.Root {...mergedProps}>
      <Checkbox.Indicator className={checkIndicatorVariants()}>
        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}
