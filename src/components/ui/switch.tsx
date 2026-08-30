"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[22px] data-[size=default]:w-[40px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-unchecked:border-muted-foreground/40 data-unchecked:bg-muted-foreground/30 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform ltr:group-data-[size=default]/switch:ml-[2px] ltr:group-data-[size=sm]/switch:ml-[2px] rtl:group-data-[size=default]/switch:mr-[2px] rtl:group-data-[size=sm]/switch:mr-[2px] group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-[12px] group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-4px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-4px)] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(100%-4px)] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(100%-4px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
