'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { scalePx, scaleRem } from '@/lib/site-page-config/runtime';

type SidebarLinkProps = {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  description?: string;
  className?: string;
  onClick?: () => void;
  iconScale?: number;
  labelScale?: number;
};

export function SidebarLink({
  href,
  children,
  icon: Icon,
  description,
  className,
  onClick,
  iconScale = 1,
  labelScale = 1,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] px-4 py-3 transition-all duration-300',
        isActive
          ? 'bg-linear-to-r from-primary/10 via-primary/5 to-cosmic/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]'
          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
        className
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-gradient-teal shadow-teal" />
      )}

      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300',
          isActive
            ? 'bg-card text-primary shadow-sm ring-1 ring-primary/15'
            : 'text-muted-foreground group-hover:bg-card group-hover:text-foreground group-hover:shadow-sm'
        )}
      >
        <Icon
          className={cn(isActive ? 'animate-pulse-slow' : '')}
          strokeWidth={isActive ? 2 : 1.5}
          style={{
            height: scalePx(22, iconScale),
            width: scalePx(22, iconScale),
          }}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start justify-center">
        <span
          className={cn(
            'truncate transition-colors',
            isActive
              ? 'font-bold text-primary'
              : 'font-medium text-foreground/70 group-hover:text-foreground'
          )}
          style={{ fontSize: scaleRem(0.875, labelScale) }}
        >
          {children}
        </span>
        {description && (
          <span
            className={cn(
              'mt-0.5 truncate transition-colors',
              isActive
                ? 'font-medium text-primary/75'
                : 'text-muted-foreground/80 group-hover:text-muted-foreground'
            )}
            style={{ fontSize: scaleRem(0.75, labelScale) }}
          >
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}
