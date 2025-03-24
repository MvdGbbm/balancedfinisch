
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  orientation?: "horizontal" | "vertical";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "vertical" ? "h-full w-fit flex-col" : "w-full",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <SliderPrimitive.Track 
      className={cn(
        "relative overflow-hidden rounded-full bg-secondary",
        orientation === "vertical" 
          ? "h-full w-1.5 grow" 
          : "h-1.5 w-full grow"
      )}
    >
      <SliderPrimitive.Range 
        className={cn(
          "absolute bg-primary",
          orientation === "vertical" 
            ? "w-full" 
            : "h-full"
        )} 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
