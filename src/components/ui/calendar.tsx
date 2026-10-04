'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from '@daypicker/react';
import { ptBR } from '@daypicker/react/locale';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const isRange = props.mode === 'range';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn('rounded-[24px] bg-card/96 p-4', className)}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: 'relative flex flex-col gap-4 sm:flex-row sm:gap-4',
        month: 'flex w-full flex-col gap-4',
        month_caption:
          'relative flex h-10 items-center justify-center px-12 pt-1',
        caption_label:
          'font-display text-base font-semibold capitalize tracking-tight text-foreground',
        dropdowns:
          'flex items-center justify-center gap-2 font-display text-sm font-semibold capitalize text-foreground',
        dropdown_root:
          'relative inline-flex items-center rounded-full border border-border/70 bg-white/80 px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-ring',
        dropdown: 'absolute inset-0 cursor-pointer opacity-0',
        nav: 'absolute inset-x-0 top-0 z-10 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-9 w-9 rounded-full bg-white/80 text-foreground shadow-sm aria-disabled:opacity-40'
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-9 w-9 rounded-full bg-white/80 text-foreground shadow-sm aria-disabled:opacity-40'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-10 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: cn(
          'relative h-10 w-10 p-0 text-center text-sm',
          isRange
            ? '[&.rdp-range_end]:rounded-r-full [&.rdp-range_start]:rounded-l-full'
            : 'aria-[selected]:rounded-full'
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-10 w-10 rounded-full p-0 font-normal text-inherit aria-selected:opacity-100'
        ),
        selected:
          'rounded-full bg-gradient-teal text-white shadow-teal hover:brightness-105 focus-within:brightness-105',
        today:
          'rounded-full border border-primary/25 bg-primary/8 text-primary',
        outside: 'text-muted-foreground/60 aria-selected:text-white',
        disabled: 'text-muted-foreground/40 opacity-60',
        range_start: cn('rdp-range_start', defaultClassNames.range_start),
        range_middle:
          'rounded-none bg-primary/10 text-foreground aria-selected:bg-primary/12',
        range_end: cn('rdp-range_end', defaultClassNames.range_end),
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({
          className: chevronClassName,
          orientation,
          ...iconProps
        }) => {
          const iconClassName = cn('h-[18px] w-[18px]', chevronClassName);

          if (orientation === 'left') {
            return <ChevronLeft className={iconClassName} {...iconProps} />;
          }

          if (orientation === 'right') {
            return <ChevronRight className={iconClassName} {...iconProps} />;
          }

          return (
            <ChevronDown
              className={cn('ml-1 h-4 w-4', chevronClassName)}
              {...iconProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
