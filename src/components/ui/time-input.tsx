"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, type = "time", ...props }, ref) => {
    return (
      <Input
        type={type}
        className={cn("w-full", className)}
        ref={ref}
        // O id, name, value, onChange, onBlur props são espalhados aqui via {...props}
        {...props}
      />
    );
  }
);
TimeInput.displayName = "TimeInput";