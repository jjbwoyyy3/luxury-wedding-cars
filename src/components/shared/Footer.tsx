import { Heart } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/95 py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Logo />
          <p>&copy; {currentYear} Glitzy Rides. All rights reserved.</p>
          <p className="flex items-center">
            Crafted with <Heart className="w-4 h-4 mx-1 text-primary" /> for your special day.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
