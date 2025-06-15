
"use client";

import React, { useActionState, useEffect, useState, useRef } from "react";
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
  const initialState = { message: "", errors: {}, success: false };
  const [state, dispatch] = useActionState(action, initialState);
  const { toast } = useToast();

  const [name, setName] = useState(car?.name || "");
  const [description, setDescription] = useState(car?.description || "");
  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null);
  const [finalImageUrl, setFinalImageUrl] = useState<string>(car?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (car) {
      setName(car.name);
      setDescription(car.description);
      setImagePreview(car.imageUrl);
      setFinalImageUrl(car.imageUrl);
    } else {
      // For add mode
      setName("");
      setDescription("");
      setImagePreview(null);
      setFinalImageUrl('');
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [car]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Don't try to reset fileInputRef.current.value here if it was done in useEffect for 'add' mode.
    // Only reset if an error occurs below, or after successful upload of a *new* car.

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
            description: "Could not generate a valid preview. Please try another image or ensure it's a standard image type.",
          });
          setImagePreview(car?.imageUrl || null); 
          setFinalImageUrl(car?.imageUrl || ''); // Revert to original or empty
          if (fileInputRef.current) fileInputRef.current.value = ""; // Clear selection on error
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Image Read Error",
          description: "There was an error reading the image file. Please try again.",
        });
        setImagePreview(car?.imageUrl || null);
        setFinalImageUrl(car?.imageUrl || ''); // Revert to original or empty
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear selection on error
      };
      reader.readAsDataURL(file);
    } else {
      // No file selected, revert to original image if editing, or no image if adding
      setImagePreview(car?.imageUrl || null);
      setFinalImageUrl(car?.imageUrl || '');
    }
  };

  useEffect(() => {
    if (state.message && state.message !== "") {
      toast({
        title: state.success ? (isEditing ? "Car Updated" : "Car Added") : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        if (onFormSubmit) onFormSubmit();
        if (!isEditing) {
          // Reset form fields for "Add New" case after successful submission
          setName("");
          setDescription("");
          setImagePreview(null);
          setFinalImageUrl('');
          if (fileInputRef.current) fileInputRef.current.value = "";
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
            <Input 
              id="name" 
              name="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Rolls Royce Phantom" 
              required 
            />
            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="e.g., The pinnacle of luxury motoring..." 
              required 
            />
            {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageFileUpload">Car Image</Label>
            <Input 
              id="imageFileUpload" 
              name="imageFileUploadInput" // This name doesn't matter for action, but good for label
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={imagePreview} alt="Image Preview" fill className="object-contain" />
              </div>
            )}
            {state?.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
             <p className="text-xs text-muted-foreground">Upload a new image or leave empty to keep the current one (if editing).</p>
          </div>
          
          {state.message && state.message !== "" && !state.success && (
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
