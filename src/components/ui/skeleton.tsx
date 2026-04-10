import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[18px] bg-[linear-gradient(110deg,rgba(49,155,142,0.08),rgba(139,92,246,0.12),rgba(240,101,67,0.08))] bg-[length:200%_100%] animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
