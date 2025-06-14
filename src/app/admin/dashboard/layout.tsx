"use client"; // This layout needs client-side state for sidebar collapse

import { useState, useEffect, ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Helper to get a user-friendly page title from the pathname
const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin/dashboard') return 'Admin Overview';
  if (pathname.startsWith('/admin/dashboard/cars')) return 'Manage Cars';
  if (pathname.startsWith('/admin/dashboard/contact')) return 'Manage Contact Info';
  if (pathname.startsWith('/admin/dashboard/settings')) return 'Settings';
  // Fallback or further specific titles
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length -1];
  return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ') : 'Admin Dashboard';
};


export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    setIsMounted(true);
    // Persist sidebar state (optional)
    const storedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (storedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(storedSidebarState));
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };
  
  if (!isMounted) {
    // Optional: return a loading skeleton for the layout
    return <div className="flex h-screen items-center justify-center bg-background"><p>Loading admin area...</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="hidden md:block"> {/* Sidebar for desktop */}
        <AdminSidebar isCollapsed={isSidebarCollapsed} />
      </div>
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <AdminHeader pageTitle={pageTitle} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
