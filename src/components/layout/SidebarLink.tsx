'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { scalePx, scaleRem } from '@/lib/site-page-config/runtime';

type SidebarLinkProps = {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  className?: string;
  onClick?: () => void;
  iconScale?: number;
  labelScale?: number;
};

/*
  Item de navegação "Lyra Clean": ícone + rótulo em uma linha, 40px de
  altura, fundo teal suave no item ativo. As descrições de cada página
  continuam disponíveis na busca (Ctrl K), onde ajudam a encontrar a tela.
*/
export function SidebarLink({
  href,
  children,
  icon: Icon,
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
        'flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 transition-colors duration-150',
        isActive
          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
          : 'text-foreground/80 hover:bg-muted hover:text-foreground',
        className
      )}
      style={{ fontSize: scaleRem(0.875, labelScale) }}
    >
      <Icon
        aria-hidden="true"
        className="shrink-0"
        strokeWidth={isActive ? 2.1 : 1.8}
        style={{
          height: scalePx(18, iconScale),
          width: scalePx(18, iconScale),
        }}
      />
      <span className="truncate">{children}</span>
    </Link>
  );
}
