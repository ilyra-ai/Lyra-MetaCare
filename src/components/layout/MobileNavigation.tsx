"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Target, Zap, BrainCircuit, HeartPulse, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plan", icon: BrainCircuit, label: "Plano" },
  { href: "/monitoring", icon: HeartPulse, label: "Ao Vivo" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-2xl dark:bg-gray-950 dark:border-gray-800">
      <nav className="flex justify-around h-16 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center p-2 text-xs transition-colors duration-200 w-1/5", // Garante distribuição igual
                isActive ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-500 hover:text-green-600 dark:hover:text-green-400"
              )}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 transition-transform duration-300",
                  isActive ? "scale-110" : ""
                )} 
              />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}