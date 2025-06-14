"use client";

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCar } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';

interface AdminCarItemProps {
  car: Car;
  onEdit: (car: Car) => void;
}

export default function AdminCarItem({ car, onEdit }: AdminCarItemProps) {
  const { toast } = useToast();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    startDeleteTransition(async () => {
      const result = await deleteCar(car.id);
      if (result.success) {
        toast({ title: "Car Deleted", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setIsAlertOpen(false); // Close dialog after action
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={car.imageUrl || "https://placehold.co/100x75.png"}
            alt={car.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "small car"}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary truncate" title={car.name}>{car.name}</h3>
          <p className="text-sm text-muted-foreground truncate" title={car.description}>{car.description}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={() => onEdit(car)} aria-label={`Edit ${car.name}`}>
          <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" aria-label={`Delete ${car.name}`}>
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the car named <strong>{car.name}</strong> from the listings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Yes, delete it"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
