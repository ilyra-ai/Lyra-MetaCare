'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  className?: string;
  onClick?: () => void;
}

export function SidebarLink({
  href,
  children,
  icon: Icon,
  className,
  onClick,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary border-l-[3px] border-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-[1.01]',
        className
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span>{children}</span>
    </Link>
  );
}
