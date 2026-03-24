'use client';

import * as React from 'react';
import { Clock3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TimeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, type = 'time', ...props }, ref) => (
    <div className="relative">
      <Input
        ref={ref}
        type={type}
        className={cn('w-full pr-12', className)}
        {...props}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Clock3 className="h-[18px] w-[18px]" />
      </span>
    </div>
  )
);

TimeInput.displayName = 'TimeInput';
