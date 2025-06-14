import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CarCardProps {
  car: Car;
  showDetailsButton?: boolean;
}

const CarCard = ({ car, showDetailsButton = true }: CarCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full animate-fade-in">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={car.imageUrl || "https://placehold.co/400x300.png"}
            alt={car.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
            data-ai-hint={car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "luxury car"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="font-headline text-2xl text-primary mb-2">{car.name}</CardTitle>
        <CardDescription className="text-foreground/70 mb-4 flex-grow min-h-[60px]">{car.description}</CardDescription>
        {showDetailsButton && (
          <Button variant="outline" className="mt-auto w-full border-primary text-primary hover:bg-primary/10 hover:text-primary" asChild>
            {/* In a full app, this might link to a car details page e.g. /cars/${car.id} */}
            <Link href="/cars">
              View Details 
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CarCard;
