
"use client";

import React, { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, UploadCloud } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ContactInfo } from "@/lib/types";
import { updateContactInfo } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from 'next/image';

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

export default function AdminContactForm({ contactInfo: initialContactInfo }: AdminContactFormProps) {
  const [currentContactInfo, setCurrentContactInfo] = useState(initialContactInfo);
  const initialState = { message: null, errors: {}, success: false, currentData: initialContactInfo };
  const [state, dispatch] = useActionState(updateContactInfo, initialState);
  const { toast } = useToast();
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(initialContactInfo?.contactPageImageUrl || null);
  const [finalImageUrl, setFinalImageUrl] = useState<string>(initialContactInfo?.contactPageImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update local state if initialContactInfo changes (e.g., after server refresh)
    setCurrentContactInfo(initialContactInfo);
    setImagePreview(initialContactInfo?.contactPageImageUrl || null);
    setFinalImageUrl(initialContactInfo?.contactPageImageUrl || '');
  }, [initialContactInfo]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = ""; 

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
          setImagePreview(dataUri);
          setFinalImageUrl(dataUri);
        } else {
          toast({ variant: "destructive", title: "Image Error", description: "Invalid image file." });
          setImagePreview(currentContactInfo?.contactPageImageUrl || null);
          setFinalImageUrl(currentContactInfo?.contactPageImageUrl || '');
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Image Error", description: "Could not read image file." });
        setImagePreview(currentContactInfo?.contactPageImageUrl || null);
        setFinalImageUrl(currentContactInfo?.contactPageImageUrl || '');
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(currentContactInfo?.contactPageImageUrl || null);
      setFinalImageUrl(currentContactInfo?.contactPageImageUrl || '');
    }
  };

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Contact Info Updated" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        router.refresh(); // Refresh server components on the page
        if (state.currentData) {
           setCurrentContactInfo(state.currentData as ContactInfo); // Update local state with latest from server
        }
      } else if (state.currentData) {
        // On error, if server sends back current data (e.g. for validation display), update local state
        setCurrentContactInfo(state.currentData as ContactInfo);
      }
    }
  }, [state, toast, router]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Edit Contact Information</CardTitle>
        <CardDescription>Update the contact details and image that appear on your public contact page.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="contactPageImageUrl" value={finalImageUrl} />
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={currentContactInfo.phone} required />
              {state?.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={currentContactInfo.email} required />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input id="instagram" name="instagram" defaultValue={currentContactInfo.instagram} placeholder="@YourHandle" required />
            {state?.errors?.instagram && <p className="text-sm text-destructive">{state.errors.instagram[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input id="location" name="location" defaultValue={currentContactInfo.location} required />
            {state?.errors?.location && <p className="text-sm text-destructive">{state.errors.location[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPageImageUpload">Contact Page Image</Label>
            <Input 
              id="contactPageImageUpload" 
              name="contactPageImageUploadInput" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={imagePreview} alt="Contact Page Image Preview" layout="fill" objectFit="contain" />
              </div>
            )}
            {state?.errors?.contactPageImageUrl && <p className="text-sm text-destructive">{state.errors.contactPageImageUrl[0]}</p>}
            <p className="text-xs text-muted-foreground">This image appears on the public "Contact Us" page.</p>
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
