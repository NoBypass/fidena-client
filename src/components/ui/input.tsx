// src/components/ui/input.tsx
import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  inputClassName?: string
}

function Input({ className, type, startContent, endContent, inputClassName, ...props }: InputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const disabled = Boolean(props.disabled)
  const ariaInvalid = !!props["aria-invalid"]

  const onPointerDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null
    if (!target || !containerRef.current) return

    const focusable = target.closest(
      'button, a, input, textarea, select, [role="button"], [tabindex]'
    )

    if (focusable) return

    e.preventDefault()
    inputRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={onPointerDown}
      className={cn(
        "relative flex items-center min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        ariaInvalid ? "ring-destructive/20 dark:ring-destructive/40 border-destructive" : "",
        disabled ? "pointer-events-none cursor-not-allowed opacity-50" : "",
        className
      )}
      data-slot="input-wrapper"
    >
      {startContent ? (
        <div className="ml-2 mr-1 flex items-center pointer-events-auto" data-slot="start">
          {startContent}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        {...props}
        className={cn(
          "h-9 flex-1 w-full min-w-0 bg-transparent px-3 py-1 text-base outline-none border-0 placeholder:text-muted-foreground",
          "file:text-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          inputClassName
        )}
      />

      {endContent ? (
        <div className="mr-2 flex items-center pointer-events-auto" data-slot="end">
          {endContent}
        </div>
      ) : null}
    </div>
  )
}

export { Input }
