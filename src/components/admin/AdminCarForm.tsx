
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, PlusCircle } from "lucide-react";
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
  const [imageFileValue, setImageFileValue] = useState<string>(''); // Used to reset file input's controlled value
  const [finalImageUrl, setFinalImageUrl] = useState<string>(car?.imageUrl || '');

  useEffect(() => {
    if (car) {
      setImagePreview(car.imageUrl);
      setFinalImageUrl(car.imageUrl);
    } else {
      // For add mode, or if car becomes null
      setImagePreview(null);
      setFinalImageUrl('');
      setImageFileValue(''); // Ensure file input is reset if form is for adding new
    }
  }, [car]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentInputValue = event.target.value; // Store this to reset if needed
    setImageFileValue(currentInputValue); // Update controlled component state

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
          setImagePreview(dataUri);
          setFinalImageUrl(dataUri);
        } else {
          toast({
            variant: "destructive",
            title: "Image Preview Error",
            description: "Could not generate a valid preview. The file might be corrupted or an unsupported format. Please try another image.",
          });
          // Revert to previous/original image if available, otherwise clear
          setImagePreview(car?.imageUrl || null);
          setFinalImageUrl(car?.imageUrl || '');
          setImageFileValue(''); // Clear the file input visually
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Image Read Error",
          description: "There was an error reading the image file. Please try again or select a different file.",
        });
        setImagePreview(car?.imageUrl || null);
        setFinalImageUrl(car?.imageUrl || '');
        setImageFileValue(''); // Clear the file input visually
      };
      reader.readAsDataURL(file);
    } else {
      // No file selected (e.g., user cleared the selection in the dialog)
      setImagePreview(car?.imageUrl || null); // Revert to original or clear if adding
      setFinalImageUrl(car?.imageUrl || '');   // Revert to original or clear if adding
      // imageFileValue will be "" here because event.target.value would be ""
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
          // Reset form fields for "Add New" case
          setImagePreview(null);
          setFinalImageUrl('');
          setImageFileValue(''); // Reset file input's controlled value
          // Note: Text inputs with `defaultValue` will also need their parent form/dialog to be re-keyed or reset if not unmounted.
          // In this Dialog setup, DialogContent might unmount/remount or `car` prop changes, handling reset.
        }
      }
    }
  }, [state, toast, isEditing, onFormSubmit, car]); // Added `car` to deps for reset logic completeness

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{isEditing ? "Edit Car Details" : "Add New Car"}</CardTitle>
        <CardDescription>{isEditing ? "Update the information for this luxury car." : "Fill in the details for the new luxury car."}</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        {isEditing && car?.id && <input type="hidden" name="id" value={car.id} />}
        {/* This hidden input sends the actual image URL or Data URI to the server */}
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
              name="imageFileUploadInput" // This name is not directly used by server action schema
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              value={imageFileValue} // Controlled component for reset capability
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" />
              </div>
            )}
            {/* Display error specific to imageUrl if provided by the server action's response */}
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
