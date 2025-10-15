import Link from "next/link";
import { LayoutDashboard, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center">Health AI</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link href="/">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="#">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="#">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </nav>
    </aside>
  );
}