"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Logo from "../shared/Logo";
import AdminSidebar from "./AdminSidebar"; // For mobile sheet content

interface AdminHeaderProps {
  pageTitle: string;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminHeader = ({ pageTitle, isSidebarCollapsed, toggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <Button
        variant="outline"
        size="icon"
        className="hidden md:flex shrink-0"
        onClick={toggleSidebar}
        aria-label={isSidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>
      
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[250px]">
            {/* Pass isCollapsed={false} for mobile sidebar as it's always expanded in sheet */}
            <AdminSidebar isCollapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      <h1 className="flex-1 text-xl font-semibold font-headline text-primary">{pageTitle}</h1>
      {/* Add User avatar/dropdown here if needed in future */}
    </header>
  );
};

export default AdminHeader;
