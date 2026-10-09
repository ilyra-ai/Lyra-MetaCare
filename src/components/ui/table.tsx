import * as React from 'react';
import { cn } from '@/lib/utils';

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Para tabelas que podem rolar na horizontal: o contêiner de rolagem vira
   * uma região focável com este nome, para quem navega pelo teclado
   * (WCAG 2.1.1).
   */
  scrollLabel?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, scrollLabel, ...props }, ref) => (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card/92 shadow-sm">
      <div
        className="relative w-full overflow-auto"
        {...(scrollLabel
          ? { tabIndex: 0, role: 'region', 'aria-label': scrollLabel }
          : {})}
      >
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    </div>
  )
);

Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-muted/85 [&_tr]:border-b [&_tr]:border-border',
      className
    )}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-b-0', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-border bg-muted/60 font-medium last:[&>tr]:border-b-0',
      className
    )}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/8',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground has-[[role=checkbox]]:pr-0',
      className
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3 align-middle text-sm text-foreground has-[[role=checkbox]]:pr-0',
      className
    )}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
