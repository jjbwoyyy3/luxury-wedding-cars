"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car, Home, Info, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/cars', label: 'Our Cars', icon: Car },
  { href: '/dashboard', label: 'Contact Us', icon: Info },
  { href: '/admin/login', label: 'Admin', icon: UserCog },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // or a loading skeleton
  }

  const NavLinkItem = ({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ElementType; onClick?: () => void }) => (
    <Button variant="ghost" asChild className={cn(
      "text-foreground hover:text-primary hover:bg-primary/10 transition-colors w-full justify-start md:w-auto",
      pathname === href ? "text-primary font-semibold bg-primary/10" : ""
    )} onClick={onClick}>
      <Link href={href}>
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6">
              <div className="mb-6 flex justify-between items-center">
                <Logo />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <NavLinkItem key={link.href} {...link} onClick={() => setIsSheetOpen(false)} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
