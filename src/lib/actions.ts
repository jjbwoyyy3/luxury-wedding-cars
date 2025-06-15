
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
  getContactInfo as dbGetContactInfo, // For currentData in case of error
  getSiteSettings as dbGetSiteSettings, // For currentData in case of error
} from "./data-store";
import type { Car, ContactInfo, SiteSettings } from "./types";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE_NAME } from "./auth";
import { revalidatePath } from "next/cache";

// Schemas for validation
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Reusable schema for image URLs (can be http/https or data URI)
const ImageUrlSchema = z.string().refine(
  (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'), 
  { message: "Image is required and must be a valid URL or a data URI." }
);

const CarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: ImageUrlSchema, // Image is mandatory for cars
});

const ContactInfoSchema = z.object({
  phone: z.string().min(10, "Phone number seems too short."),
  email: z.string().email("Invalid email address."),
  instagram: z.string().min(3, "Instagram handle seems too short."),
  location: z.string().min(5, "Location seems too short."),
  contactPageImageUrl: ImageUrlSchema.optional().or(z.literal('')), // Optional, can be empty string
});

const SiteSettingsSchema = z.object({
  heroImageUrl: ImageUrlSchema.optional().or(z.literal('')), // Optional, can be empty string
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
    // Redirect is handled client-side now
    return { success: true, message: "Login successful." };
  } else {
    return { success: false, message: "Invalid email or password." };
  }
}

export async function logout() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE_NAME);
  redirect(ADMIN_LOGIN_PATH);
}

export async function addCar(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  // imageUrl comes directly from the hidden input, which holds the Data URI or existing URL
  const carData = {
    name: rawData.name,
    description: rawData.description,
    imageUrl: rawData.imageUrl,
  };
  const validatedFields = CarSchema.safeParse(carData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid car data. Ensure all fields are correct and an image is provided.",
      success: false,
    };
  }
  
  try {
    // id is not part of validatedFields.data when adding, so we pass only name, desc, imageUrl
    const { id, ...dataToAdd } = validatedFields.data; // id will be undefined here
    await dbAddCar(dataToAdd as Omit<Car, 'id'>);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
    revalidatePath("/cars"); // Public cars page
    revalidatePath("/");     // Home page (if featured cars are shown)
    return { message: "Car added successfully.", success: true };
  } catch (error) {
    console.error("Add car error:", error);
    return { message: "Failed to add car. Please try again.", success: false };
  }
}

export async function updateCar(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const carId = rawData.id as string;

  if (!carId) {
    return { message: "Car ID is missing. Cannot update.", success: false };
  }

  // Fetch existing car to compare, not strictly necessary for update but good for context
  const carToUpdate = await dbGetCarById(carId);
  if (!carToUpdate) {
    return { message: "Car not found. Cannot update.", success: false };
  }
  
  // imageUrl comes directly from the hidden input
  const dataToValidate = {
    id: carId,
    name: rawData.name || carToUpdate.name,
    description: rawData.description || carToUpdate.description,
    imageUrl: rawData.imageUrl || carToUpdate.imageUrl, 
  };

  const validatedFields = CarSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid car data. Ensure all fields are correct.",
      success: false,
    };
  }
  
  try {
    await dbUpdateCar(validatedFields.data as Car);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
    revalidatePath("/cars"); 
    revalidatePath("/");
    return { message: "Car updated successfully.", success: true };
  } catch (error) {
    console.error("Update car error:", error);
    return { message: "Failed to update car. Please try again.", success: false };
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
  const currentData = await dbGetContactInfo(); // Get current data for comparison/fallback

  const dataToValidate: Partial<ContactInfo> = {
    phone: rawData.phone as string || currentData.phone,
    email: rawData.email as string || currentData.email,
    instagram: rawData.instagram as string || currentData.instagram,
    location: rawData.location as string || currentData.location,
    contactPageImageUrl: (rawData.contactPageImageUrl as string)?.trim() || currentData.contactPageImageUrl || "",
  };
  
  const validatedFields = ContactInfoSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid contact information.",
      success: false,
      currentData: currentData 
    };
  }
  
  try {
    const updatedData = await dbUpdateContactInfo(validatedFields.data);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/contact");
    revalidatePath("/dashboard"); 
    return { message: "Contact information updated successfully.", success: true, currentData: updatedData };
  } catch (error) {
    return { message: "Failed to update contact information.", success: false, currentData: currentData };
  }
}

export async function updateSiteSettings(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const currentData = await dbGetSiteSettings(); // Get current data

  const dataToValidate: Partial<SiteSettings> = {
     heroImageUrl: (rawData.heroImageUrl as string)?.trim() || currentData.heroImageUrl || "",
  };

  const validatedFields = SiteSettingsSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid site settings data.",
      success: false,
      currentData: currentData
    };
  }

  // Check if anything actually changed
  if (dataToValidate.heroImageUrl === currentData.heroImageUrl) {
      return { message: "No changes to save.", success: true, noChanges: true, currentData: currentData };
  }

  try {
    const updatedData = await dbUpdateSiteSettings(validatedFields.data);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/settings");
    revalidatePath("/"); 
    return { message: "Site settings updated successfully.", success: true, currentData: updatedData };
  } catch (error) {
    return { message: "Failed to update site settings.", success: false, currentData: currentData };
  }
}


export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
  return session?.value === "loggedIn";
}
