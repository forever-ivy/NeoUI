import { mergeProps, Slider } from "@base-ui-components/react";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

const sliderVariants = cva("w-full h-4");

const trackVarints = cva("relative w-full h-4 rounded-full shadow-inset");

const rangeVariants = cva("absolute h-full rounded-full ", {
  variants: {
    variant: {
      default: "bg-linear-to-l from-primary to-primary/75",
      secondary: "bg-linear-to-l from-muted-foreground to-muted-foreground/75",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const thumbVarints = cva(
  "rounded-full border-1 border-highlight bg-background h-5 w-5 cursor-pointer shadow-inset active:shadow-raised duration-350 transition-shadow ease-out",
);

interface SliderProps
  extends
    React.ComponentProps<typeof Slider.Root>,
    VariantProps<typeof rangeVariants> {}

export default function NeoSlider(props: SliderProps) {
  const rootMerge = mergeProps(props, { className: sliderVariants() });
  return (
    <Slider.Root {...rootMerge}>
      <Slider.Control className={"relative"}>
        <Slider.Track className={trackVarints()}>
          <Slider.Indicator
            className={rangeVariants({ variant: props.variant })}
          />
        </Slider.Track>
        <Slider.Thumb className={thumbVarints()} />
      </Slider.Control>
    </Slider.Root>
  );
}
