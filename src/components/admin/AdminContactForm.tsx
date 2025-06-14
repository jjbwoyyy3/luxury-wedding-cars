
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ContactInfo } from "@/lib/types";
import { updateContactInfo } from "@/lib/actions";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminContactFormProps {
  contactInfo: ContactInfo;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
      {!pending && <Save className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function AdminContactForm({ contactInfo }: AdminContactFormProps) {
  const initialState = { message: null, errors: {}, success: false };
  // Bind current contactInfo to the action if needed, or ensure form has all fields
  const [state, dispatch] = useActionState(updateContactInfo, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Contact Info Updated" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Edit Contact Information</CardTitle>
        <CardDescription>Update the contact details that appear on your website.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={contactInfo.phone} required />
              {state?.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={contactInfo.email} required />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input id="instagram" name="instagram" defaultValue={contactInfo.instagram} placeholder="@YourHandle" required />
            {state?.errors?.instagram && <p className="text-sm text-destructive">{state.errors.instagram[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input id="location" name="location" defaultValue={contactInfo.location} required />
            {state?.errors?.location && <p className="text-sm text-destructive">{state.errors.location[0]}</p>}
          </div>

          {state.message && !state.success && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
