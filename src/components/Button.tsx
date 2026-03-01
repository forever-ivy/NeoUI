import { mergeProps, useRender } from "@base-ui-components/react";
import { cva, type VariantProps } from "class-variance-authority"


const buttonVariants=cva("inline-flex justify-center items-center bg-red-400",
  {
  variants:{
    variant:{
    default:"",
    primary:"bg-blue-400",
    destructive:"bg-red-400",
    warning:"."
  },
  size:{
    default:"h-12 px-4",
    icon:"h-12 w-12",
  }
},
defaultVariants:{
  variant:"default",
  size:"default"
}
}
)

interface ButtonProps extends useRender.ComponentProps<"button">,VariantProps<typeof buttonVariants>{}


export default function Button(props:ButtonProps){
  const mergedProps = mergeProps(props,{
    className:buttonVariants({variant:props.variant,size:props.size})
  })
  const element = useRender({
    defaultTagName:'button',
    render:props.render,
    props:mergedProps,
  })

  return element;
}  