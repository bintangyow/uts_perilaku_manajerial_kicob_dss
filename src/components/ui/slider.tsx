import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center py-4", className)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center">
        <SliderPrimitive.Track
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-primary/10 border border-white/5"
        >
          <SliderPrimitive.Indicator
            className="absolute h-full bg-gradient-to-r from-primary to-blue-400"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-transform hover:scale-110 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
