import React from 'react';
    import { cn } from '@/lib/utils';
    import { Label } from '@/components/ui/label';

    const ColorPickerInput = React.forwardRef(({ className, label, id, value, onChange, ...props }, ref) => {
      return (
        <div className={cn("flex flex-col space-y-1", className)}>
          {label && <Label htmlFor={id} className="text-sky-300">{label}</Label>}
          <div className="flex items-center space-x-2 p-2 bg-slate-700 border border-slate-600 rounded-md">
            <input
              type="color"
              id={id}
              value={value}
              onChange={onChange}
              className="w-8 h-8 rounded-md border-none cursor-pointer"
              ref={ref}
              {...props}
            />
            <span className="text-slate-300 uppercase text-sm font-mono">{value}</span>
          </div>
        </div>
      );
    });
    ColorPickerInput.displayName = 'ColorPickerInput';

    export { ColorPickerInput };