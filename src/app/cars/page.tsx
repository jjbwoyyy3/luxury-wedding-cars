import CarList from '@/components/cars/CarList';
import PageHeader from '@/components/shared/PageHeader';
import { getCars } from '@/lib/data-store';

export const metadata = {
  title: 'Our Luxury Fleet - Glitzy Rides',
  description: 'Explore our exquisite collection of luxury rental cars for your wedding or special event.',
};

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <div className="py-8">
      <PageHeader
        title="Our Exquisite Fleet"
        description="Discover the perfect luxury vehicle to complement your special day. Each car in our collection represents the pinnacle of automotive excellence and style."
      />
      <CarList cars={cars} />
    </div>
  );
}
