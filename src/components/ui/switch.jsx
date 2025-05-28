import React from "react"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        checked ? 'bg-sky-500' : 'bg-slate-200'
      } ${className || ''}`}
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      {...props}
    >
      <span
        className={`block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
})

Switch.displayName = "Switch"

export { Switch } 