
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
} from "./data-store";
import type { Car, ContactInfo } from "./types";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE_NAME } from "./auth";
import { revalidatePath } from "next/cache";

// Schemas for validation
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const CarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid URL for the image."),
});

const ContactInfoSchema = z.object({
  phone: z.string().min(10, "Phone number seems too short."),
  email: z.string().email("Invalid email address."),
  instagram: z.string().min(3, "Instagram handle seems too short."),
  location: z.string().min(5, "Location seems too short."),
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
    cookies().set(ADMIN_SESSION_COOKIE_NAME, "loggedIn", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: 'lax', // Explicitly set SameSite attribute
    });
    return { success: true, message: "Login successful." };
  } else {
    return { message: "Invalid email or password.", success: false };
  }
}

export async function logout() {
  cookies().delete(ADMIN_SESSION_COOKIE_NAME);
  redirect(ADMIN_LOGIN_PATH);
}

export async function addCar(prevState: any, formData: FormData) {
  const validatedFields = CarSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid car data.",
      success: false,
    };
  }

  try {
    await dbAddCar(validatedFields.data as Omit<Car, 'id'>);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    return { message: "Car added successfully.", success: true };
  } catch (error) {
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
    imageUrl: rawData.imageUrl || carToUpdate.imageUrl,
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
  const validatedFields = ContactInfoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid contact information.",
      success: false,
    };
  }

  try {
    await dbUpdateContactInfo(validatedFields.data);
    revalidatePath(ADMIN_DASHBOARD_PATH + "/contact");
    revalidatePath("/dashboard"); // Public contact page
    return { message: "Contact information updated successfully.", success: true };
  } catch (error) {
    return { message: "Failed to update contact information.", success: false };
  }
}

export async function checkAdminSession() {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
  return session?.value === "loggedIn";
}
