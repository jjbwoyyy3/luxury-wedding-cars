import HeroSection from '@/components/landing/HeroSection';
import FeaturedCars from '@/components/landing/FeaturedCars';
import { getCars } from '@/lib/data-store';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const cars = await getCars();

  return (
    <div className="space-y-12 md:space-y-16">
      <HeroSection />
      <Separator className="my-8 md:my-12" />
      <FeaturedCars cars={cars} />
    </div>
  );
}
