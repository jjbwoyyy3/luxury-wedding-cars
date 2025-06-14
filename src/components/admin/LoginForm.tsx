
"use client";

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ADMIN_DASHBOARD_PATH } from '@/lib/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Logging In..." : "Log In"}
      {!pending && <LogIn className="ml-2 h-5 w-5" />}
    </Button>
  );
}

export default function LoginForm() {
  const [isMounted, setIsMounted] = useState(false);
  const initialState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(login, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      router.push(ADMIN_DASHBOARD_PATH);
    } else if (state.message && !state.errors?.email && !state.errors?.password) { 
      // Show general error toast only if there are no specific field errors and login wasn't successful
      // (e.g. "Invalid email or password")
      // state.errors being empty or undefined also implies !state.errors.email and !state.errors.password
      // The "Invalid input." message comes with state.errors populated.
      if (state.message !== "Invalid input.") { // Avoid double toast for validation message
         toast({
          variant: "destructive",
          title: "Login Failed",
          description: state.message,
        });
      }
    }
  }, [state, toast, router]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to manage Glitzy Rides.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                aria-describedby="email-error"
                className={state?.errors?.email ? "border-destructive" : ""}
              />
              {state?.errors?.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                aria-describedby="password-error"
                className={state?.errors?.password ? "border-destructive" : ""}
              />
              {state?.errors?.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
             {state?.message && !state.success && !state.errors?.email && !state.errors?.password && state.message !== "Invalid input." && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
