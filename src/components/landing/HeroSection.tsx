import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background to-primary/5 rounded-lg shadow-xl overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="animate-slide-up">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Arrive in <span className="text-accent">Unforgettable Style</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
            Glitzy Rides offers an exclusive collection of luxury vehicles to make your wedding day truly exceptional. Experience unparalleled elegance, comfort, and service that turns moments into cherished memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/cars">
                Explore Our Fleet <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-accent/20 transition-shadow border-primary text-primary hover:bg-primary/5 hover:text-primary">
              <Link href="/dashboard">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-auto md:min-h-[400px] animate-fade-in [animation-delay:0.3s]">
          <Image
            src="https://placehold.co/1200x800.png"
            alt="Luxury wedding car convoy"
            layout="fill"
            objectFit="cover"
            className="rounded-lg shadow-2xl"
            data-ai-hint="luxury car"
            priority
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
