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
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-[20px] transition-all duration-300 group relative overflow-hidden',
        isActive
          ? 'bg-teal-50/50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.2)]'
          : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800',
        className
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
      )}

      <span className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
        isActive
          ? "bg-white text-teal-600 shadow-sm ring-1 ring-slate-100"
          : "text-slate-400 group-hover:text-slate-600 group-hover:bg-white group-hover:shadow-sm"
      )}>
        <Icon className={cn("w-[22px] h-[22px]", isActive ? "animate-pulse-slow" : "")} strokeWidth={isActive ? 2 : 1.5} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start justify-center">
        <span className={cn("truncate text-sm transition-colors", isActive ? "font-bold text-teal-900" : "font-medium text-slate-600 group-hover:text-slate-900")}>
          {children}
        </span>
        {description && (
          <span className={cn("truncate text-xs transition-colors mt-0.5", isActive ? "text-teal-600/80 font-medium" : "text-slate-400 group-hover:text-slate-500")}>
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}
