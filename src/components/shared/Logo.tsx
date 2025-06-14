import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="text-3xl font-headline font-bold text-primary hover:text-accent transition-colors duration-300">
      Glitzy<span className="text-accent">Rides</span>
    </Link>
  );
};

export default Logo;
