
"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addCar as dbAddCar,
  deleteCar as dbDeleteCar,
  getAdminCredentials as dbGetAdminCredentials,
  updateCar as dbUpdateCar,
  updateContactInfo as dbUpdateContactInfo,
  getCarById as dbGetCarById,
  updateSiteSettings as dbUpdateSiteSettings,
} from "./data-store";
import type { Car, ContactInfo, SiteSettings } from "./types";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE_NAME } from "./auth";
import { revalidatePath } from "next/cache";

// Schemas for validation
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const ImageUrlSchema = z.string().refine(
  (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'), 
  { message: "Image is required and must be a valid URL or a data URI." }
);

const CarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: ImageUrlSchema,
});

const ContactInfoSchema = z.object({
  phone: z.string().min(10, "Phone number seems too short."),
  email: z.string().email("Invalid email address."),
  instagram: z.string().min(3, "Instagram handle seems too short."),
  location: z.string().min(5, "Location seems too short."),
  contactPageImageUrl: ImageUrlSchema.optional().or(z.literal('')), // Optional, can be empty string if not updated
});

const SiteSettingsSchema = z.object({
  heroImageUrl: ImageUrlSchema.optional().or(z.literal('')), // Optional for hero image
});


export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input.",
      success: false,
    };
  }

  const { email, password } = validatedFields.data;
  const adminCreds = await dbGetAdminCredentials();

  if (email === adminCreds.email && password === adminCreds.password) {
    (await cookies()).set(ADMIN_SESSION_COOKIE_NAME, "loggedIn", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: 'lax',
    });
    return { success: true, message: "Login successful." };
  } else {
    return { message: "Invalid email or password.", success: false };
  }
}

export async function logout() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE_NAME);
  redirect(ADMIN_LOGIN_PATH);
}

export async function addCar(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const carData = {
    name: rawData.name,
    description: rawData.description,
    imageUrl: rawData.imageUrl, // This is the Data URI or URL from hidden input
  };
  const validatedFields = CarSchema.safeParse(carData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid car data.",
      success: false,
    };
  }
  
  try {
    const { id, ...dataToAdd } = validatedFields.data;
    await dbAddCar(dataToAdd as Omit<Car, 'id'>);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    return { message: "Car added successfully.", success: true };
  } catch (error) {
    console.error("Add car error:", error);
    return { message: "Failed to add car.", success: false };
  }
}

export async function updateCar(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const carId = rawData.id as string;

  if (!carId) {
    return { message: "Car ID is missing.", success: false };
  }

  const carToUpdate = await dbGetCarById(carId);
  if (!carToUpdate) {
    return { message: "Car not found.", success: false };
  }
  
  const dataToValidate = {
    id: carId,
    name: rawData.name || carToUpdate.name,
    description: rawData.description || carToUpdate.description,
    imageUrl: rawData.imageUrl || carToUpdate.imageUrl, // imageUrl from hidden input
  };

  const validatedFields = CarSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid car data.",
      success: false,
    };
  }
  
  try {
    await dbUpdateCar(validatedFields.data as Car);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
    revalidatePath(`/cars`); 
    revalidatePath("/");
    return { message: "Car updated successfully.", success: true };
  } catch (error) {
    console.error("Update car error:", error);
    return { message: "Failed to update car.", success: false };
  }
}

export async function deleteCar(id: string) {
  try {
    const success = await dbDeleteCar(id);
    if (success) {
      revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
      revalidatePath("/cars");
      revalidatePath("/");
      return { message: "Car deleted successfully.", success: true };
    }
    return { message: "Car not found or already deleted.", success: false };
  } catch (error) {
    return { message: "Failed to delete car.", success: false };
  }
}


export async function updateContactInfo(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const dataToValidate: Partial<ContactInfo> = {
    phone: rawData.phone as string,
    email: rawData.email as string,
    instagram: rawData.instagram as string,
    location: rawData.location as string,
  };
  
  // Only include contactPageImageUrl if it's provided and not an empty string
  if (rawData.contactPageImageUrl && typeof rawData.contactPageImageUrl === 'string' && rawData.contactPageImageUrl.trim() !== '') {
    dataToValidate.contactPageImageUrl = rawData.contactPageImageUrl;
  } else if (!rawData.contactPageImageUrl && prevState?.currentData?.contactPageImageUrl) {
    // If no new image is provided, keep the existing one (edge case, usually hidden input sends current)
    // This part might be redundant if hidden input correctly sends previous value when no new file.
  }


  const validatedFields = ContactInfoSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid contact information.",
      success: false,
      currentData: prevState?.currentData // Pass back current data for form repopulation on server error
    };
  }
  
  try {
    const updatedData = await dbUpdateContactInfo(validatedFields.data);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/contact");
    revalidatePath("/dashboard"); // Public contact page
    return { message: "Contact information updated successfully.", success: true, currentData: updatedData };
  } catch (error) {
    return { message: "Failed to update contact information.", success: false, currentData: prevState?.currentData };
  }
}

export async function updateSiteSettings(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
   const dataToValidate: Partial<SiteSettings> = {};

  if (rawData.heroImageUrl && typeof rawData.heroImageUrl === 'string' && rawData.heroImageUrl.trim() !== '') {
    dataToValidate.heroImageUrl = rawData.heroImageUrl;
  }

  const validatedFields = SiteSettingsSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid site settings data.",
      success: false,
      currentData: prevState?.currentData
    };
  }

  try {
    // Only update if there's actual data to update
    if (Object.keys(validatedFields.data).length === 0 && Object.keys(dataToValidate).length === 0) {
       return { message: "No changes to save.", success: true, noChanges: true, currentData: prevState?.currentData };
    }

    const updatedData = await dbUpdateSiteSettings(validatedFields.data);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/settings");
    revalidatePath("/"); // Revalidate home page for hero image
    return { message: "Site settings updated successfully.", success: true, currentData: updatedData };
  } catch (error) {
    return { message: "Failed to update site settings.", success: false, currentData: prevState?.currentData };
  }
}


export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
  return session?.value === "loggedIn";
}
