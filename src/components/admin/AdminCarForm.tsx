
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, PlusCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Car } from "@/lib/types";
import { addCar, updateCar } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface AdminCarFormProps {
  car?: Car | null;
  onFormSubmit?: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Car")}
      {!pending && (isEditing ? <Save className="ml-2 h-4 w-4" /> : <PlusCircle className="ml-2 h-4 w-4" />)}
    </Button>
  );
}

export default function AdminCarForm({ car, onFormSubmit }: AdminCarFormProps) {
  const isEditing = !!car;
  const action = isEditing ? updateCar : addCar;
  const initialState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(action, initialState);
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null);
  const [imageFileValue, setImageFileValue] = useState<string>(''); // Used to reset file input

  // This will hold the actual string to be submitted (Data URI or existing URL)
  const [finalImageUrl, setFinalImageUrl] = useState<string>(car?.imageUrl || '');

  useEffect(() => {
    if (car?.imageUrl) {
      setImagePreview(car.imageUrl);
      setFinalImageUrl(car.imageUrl);
    } else {
      setImagePreview(null);
      setFinalImageUrl('');
    }
  }, [car]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setFinalImageUrl(dataUri); // Set for submission
      };
      reader.readAsDataURL(file);
    } else {
      // If file is deselected, revert to original car image URL if editing, or clear if adding
      setImagePreview(car?.imageUrl || null);
      setFinalImageUrl(car?.imageUrl || '');
    }
  };

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? (isEditing ? "Car Updated" : "Car Added") : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        if (onFormSubmit) onFormSubmit();
        if (!isEditing) {
          // Reset form fields for "Add New" case, including file input preview
          setImagePreview(null);
          setFinalImageUrl('');
          setImageFileValue(''); // Reset file input
          // Inputs with `defaultValue` won't reset on their own unless the component is re-keyed or state is managed.
          // For a dialog form, usually it's closed and re-opened, re-initializing.
        }
      }
    }
  }, [state, toast, isEditing, onFormSubmit]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{isEditing ? "Edit Car Details" : "Add New Car"}</CardTitle>
        <CardDescription>{isEditing ? "Update the information for this luxury car." : "Fill in the details for the new luxury car."}</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        {isEditing && car?.id && <input type="hidden" name="id" value={car.id} />}
        <input type="hidden" name="imageUrl" value={finalImageUrl} />

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Car Name</Label>
            <Input id="name" name="name" defaultValue={car?.name || ""} placeholder="e.g., Rolls Royce Phantom" required />
            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={car?.description || ""} placeholder="e.g., The pinnacle of luxury motoring..." required />
            {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageFileUpload">Car Image</Label>
            <Input 
              id="imageFileUpload" 
              name="imageFileUploadInput" // Not directly submitted, handled by state
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              value={imageFileValue} // To allow resetting
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" />
              </div>
            )}
            {state?.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
          </div>
          
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </form>
    </Card>
  );
}
