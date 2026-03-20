'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rounded-[24px] bg-card/96 p-4', className)}
      classNames={{
        months: 'flex flex-col gap-4 sm:flex-row sm:gap-4',
        month: 'space-y-4',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label:
          'font-display text-base font-semibold tracking-tight text-foreground',
        nav: 'flex items-center gap-2',
        nav_button: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-9 w-9 rounded-full bg-white/80 text-foreground shadow-sm'
        ),
        nav_button_previous: 'absolute left-0',
        nav_button_next: 'absolute right-0',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell:
          'w-10 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
        row: 'mt-2 flex w-full',
        cell: cn(
          'relative p-0 text-center text-sm [&:has([aria-selected])]:rounded-full',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full'
            : ''
        ),
        day: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-10 w-10 rounded-full p-0 font-normal text-foreground'
        ),
        day_selected:
          'bg-gradient-teal text-white shadow-teal hover:brightness-105 focus:brightness-105',
        day_today: 'border border-primary/25 bg-primary/8 text-primary',
        day_outside: 'text-muted-foreground/60',
        day_disabled: 'text-muted-foreground/40 opacity-60',
        day_range_middle:
          'rounded-none bg-primary/10 text-foreground aria-selected:bg-primary/12',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn('h-[18px] w-[18px]', className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn('h-[18px] w-[18px]', className)} {...iconProps} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
