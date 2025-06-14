
"use client";

import React, { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Save, UploadCloud } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SiteSettings } from "@/lib/types";
import { updateSiteSettings } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface AdminSiteSettingsFormProps {
  siteSettings: SiteSettings;
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

export default function AdminSiteSettingsForm({ siteSettings: initialSiteSettings }: AdminSiteSettingsFormProps) {
  const [currentSettings, setCurrentSettings] = useState(initialSiteSettings);
  const initialState = { message: null, errors: {}, success: false, noChanges: false, currentData: initialSiteSettings };
  const [state, dispatch] = useActionState(updateSiteSettings, initialState);
  const { toast } = useToast();
  const router = useRouter();

  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(initialSiteSettings?.heroImageUrl || null);
  const [finalHeroImageUrl, setFinalHeroImageUrl] = useState<string>(initialSiteSettings?.heroImageUrl || '');
  const heroFileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
    setCurrentSettings(initialSiteSettings);
    setHeroImagePreview(initialSiteSettings?.heroImageUrl || null);
    setFinalHeroImageUrl(initialSiteSettings?.heroImageUrl || '');
  }, [initialSiteSettings]);

  const handleHeroFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (heroFileInputRef.current) heroFileInputRef.current.value = ""; 

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
          setHeroImagePreview(dataUri);
          setFinalHeroImageUrl(dataUri);
        } else {
          toast({ variant: "destructive", title: "Image Error", description: "Invalid image file for hero." });
          setHeroImagePreview(currentSettings?.heroImageUrl || null);
          setFinalHeroImageUrl(currentSettings?.heroImageUrl || '');
          if (heroFileInputRef.current) heroFileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Image Error", description: "Could not read hero image file." });
         setHeroImagePreview(currentSettings?.heroImageUrl || null);
         setFinalHeroImageUrl(currentSettings?.heroImageUrl || '');
        if (heroFileInputRef.current) heroFileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      setHeroImagePreview(currentSettings?.heroImageUrl || null);
      setFinalHeroImageUrl(currentSettings?.heroImageUrl || '');
    }
  };
  
  useEffect(() => {
    if (state.message) {
      if (state.noChanges) {
         toast({ title: "Site Settings", description: state.message });
      } else {
        toast({
          title: state.success ? "Site Settings Updated" : "Error",
          description: state.message,
          variant: state.success ? "default" : "destructive",
        });
      }
      if (state.success) {
        router.refresh(); 
        if (state.currentData) {
            setCurrentSettings(state.currentData as SiteSettings);
        }
      } else if (state.currentData) {
         setCurrentSettings(state.currentData as SiteSettings);
      }
    }
  }, [state, toast, router]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Site Settings</CardTitle>
        <CardDescription>Manage global images and other settings for your website.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="heroImageUrl" value={finalHeroImageUrl} />
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="heroImageUpload">Homepage Hero Image</Label>
            <Input 
              id="heroImageUpload" 
              name="heroImageUploadInput" 
              type="file" 
              accept="image/*" 
              onChange={handleHeroFileChange}
              ref={heroFileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {heroImagePreview && (
              <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden border">
                <Image src={heroImagePreview} alt="Hero Image Preview" layout="fill" objectFit="contain" />
              </div>
            )}
            {state?.errors?.heroImageUrl && <p className="text-sm text-destructive">{state.errors.heroImageUrl[0]}</p>}
            <p className="text-xs text-muted-foreground">This image appears prominently on your homepage.</p>
          </div>
          
          {state.message && !state.success && !state.noChanges && (
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

