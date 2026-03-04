import { mergeProps, useRender } from "@base-ui-components/react";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-md border-1 border-highlight bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground shadow-inset disabled:opacity-50",
);

interface InputProps extends useRender.ComponentProps<"input"> {}

export default function Input(props: InputProps) {
  const mergedProps = mergeProps(props, {
    className: inputVariants(),
    type: props.type,
  });
  const element = useRender({
    defaultTagName: "input",
    render: props.render,
    props: mergedProps,
  });
  return element;
}
