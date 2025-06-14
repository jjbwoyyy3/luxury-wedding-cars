
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/actions';
import { LayoutDashboard, Car, Contact, LogOut, Settings, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/cars', label: 'Manage Cars', icon: Car },
  { href: '/admin/dashboard/contact', label: 'Manage Contact', icon: Contact },
  { href: '/admin/dashboard/settings', label: 'Site Settings', icon: Settings } 
];

const AdminSidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
    <aside className={cn(
      "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b px-4 shrink-0",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        {isCollapsed ? (
          <Link href="/admin/dashboard" className="text-primary hover:text-accent transition-colors">
            <Car className="h-8 w-8" />
          </Link>
        ) : (
          <Logo />
        )}
      </div>
      <nav className="flex-grow space-y-2 p-2 overflow-y-auto">
        {adminNavLinks.map((link) => (
          <Tooltip key={link.href}>
            <TooltipTrigger asChild>
              <Button
                variant={pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href)) ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  (pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href))) ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : ""
                )}
                asChild
              >
                <Link href={link.href}>
                  <link.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && link.label}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
       <form action={logout} className="w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive",
                   isCollapsed ? "justify-center px-0" : "px-3"
                )}
                type="submit"
              >
                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && "Logout"}
              </Button>
            </TooltipTrigger>
             {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </form>
      </div>
    </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
