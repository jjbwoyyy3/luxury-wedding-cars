import type { Car } from '@/lib/types';
import CarCard from './CarCard';

interface CarListProps {
  cars: Car[];
}

const CarList = ({ cars }: CarListProps) => {
  if (!cars || cars.length === 0) {
    return <p className="text-center text-lg text-muted-foreground py-12">No cars available at the moment. Please check back later.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {cars.map((car, index) => (
         <div key={car.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <CarCard car={car} />
         </div>
      ))}
    </div>
  );
};

export default CarList;
