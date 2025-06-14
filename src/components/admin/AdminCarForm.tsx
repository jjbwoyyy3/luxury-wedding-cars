
"use client";

import { useActionState } from "react";
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
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AdminCarFormProps {
  car?: Car | null; // For editing existing car
  onFormSubmit?: () => void; // Optional: callback after successful submission, e.g. to close a dialog
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
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? (isEditing ? "Car Updated" : "Car Added") : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        if(onFormSubmit) onFormSubmit();
        // Optionally, redirect or clear form. For now, toast is enough.
        // If not using a dialog, might want to router.push('/admin/dashboard/cars');
        if (!isEditing) { // If adding new, form fields might not reset automatically without full page reload.
          // This relies on the parent component to re-render or re-key the form.
        }
      }
    }
  }, [state, toast, isEditing, onFormSubmit, router]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{isEditing ? "Edit Car Details" : "Add New Car"}</CardTitle>
        <CardDescription>{isEditing ? "Update the information for this luxury car." : "Fill in the details for the new luxury car."}</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        {isEditing && car?.id && <input type="hidden" name="id" value={car.id} />}
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
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" type="url" defaultValue={car?.imageUrl || ""} placeholder="https://placehold.co/800x600.png" required />
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
