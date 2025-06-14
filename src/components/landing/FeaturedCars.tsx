import type { Car } from '@/lib/types';
import CarCard from '@/components/cars/CarCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedCarsProps {
  cars: Car[];
}

const FeaturedCars = ({ cars }: FeaturedCarsProps) => {
  const featured = cars.slice(0, 3); // Show first 3 cars as featured

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary mb-4 animate-slide-up">
            Our Signature Collection
          </h2>
          <p className="text-lg text-foreground/80 max-w-xl mx-auto animate-slide-up [animation-delay:0.1s]">
            A glimpse into the world of luxury that awaits you. Each vehicle is meticulously maintained to ensure a flawless experience.
          </p>
        </div>
        {featured.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map((car, index) => (
              <div key={car.id} className="animate-slide-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-muted-foreground">No featured cars available at the moment.</p>
        )}
        <div className="text-center mt-12 animate-fade-in [animation-delay:0.8s]">
          <Button asChild size="lg" className="shadow-lg hover:shadow-primary/30 transition-shadow">
            <Link href="/cars">
              View All Luxury Cars <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
