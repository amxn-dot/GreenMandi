
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:shadow-lg border",
  {
    variants: {
      variant: {
        default: "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 shadow-md",
        destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 shadow-md",
        outline: "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 shadow-sm",
        secondary: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600 shadow-md",
        ghost: "border-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900",
        link: "text-green-600 underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
