'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
        'nav-pill group relative w-full justify-start overflow-hidden border border-transparent',
        isActive && 'nav-pill-active',
        className
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-teal'
            : 'bg-white/70 text-muted-foreground group-hover:bg-white group-hover:text-foreground'
        )}
        style={{
          height: `calc(2.5rem * ${iconScale})`,
          width: `calc(2.5rem * ${iconScale})`,
        }}
      >
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
          style={{
            height: `calc(1.125rem * ${iconScale})`,
            width: `calc(1.125rem * ${iconScale})`,
          }}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span
          className="truncate text-sm font-semibold"
          style={{ fontSize: `calc(0.875rem * ${labelScale})` }}
        >
          {children}
        </span>
        {description ? (
          <span
            className={cn(
              'truncate text-xs',
              isActive ? 'text-primary/80' : 'text-muted-foreground'
            )}
            style={{ fontSize: `calc(0.75rem * ${labelScale})` }}
          >
            {description}
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          'h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-200',
          isActive
            ? 'bg-accent shadow-coral'
            : 'bg-transparent group-hover:bg-primary/30'
        )}
      />
    </Link>
  );
}
