"use client";

import { useEffect, useState, useTransition } from 'react';
import type { Car } from '@/lib/types';
import { getCars } from '@/lib/data-store'; // This is fine for initial load if data-store is simple
import AdminCarItem from '@/components/admin/AdminCarItem';
import AdminCarForm from '@/components/admin/AdminCarForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, startLoadingTransition] = useTransition();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchCars = () => {
    startLoadingTransition(async () => {
      const fetchedCars = await getCars(); // Using the server-side function
      setCars(fetchedCars);
      if(!initialLoadComplete) setInitialLoadComplete(true);
    });
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCar(null);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = () => {
    setIsFormOpen(false); // Close dialog
    fetchCars(); // Refresh list
  };

  if (!initialLoadComplete && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="w-24 h-20 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">Car Fleet Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl text-primary">{selectedCar ? 'Edit Car' : 'Add New Car'}</DialogTitle>
               {/* DialogClose can be added here if needed, or rely on onOpenChange */}
            </DialogHeader>
            <AdminCarForm car={selectedCar} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && !initialLoadComplete && <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto my-10" />}

      {cars.length > 0 ? (
        <div className="space-y-4">
          {cars.map((car) => (
            <AdminCarItem key={car.id} car={car} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        !isLoading && <p className="text-center text-muted-foreground py-10">No cars found. Click "Add New Car" to get started.</p>
      )}
    </div>
  );
}
