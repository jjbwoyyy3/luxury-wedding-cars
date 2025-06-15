
import type { Car, ContactInfo, AdminCredentials, SiteSettings } from './types';

interface AppData {
  cars: Car[];
  contactInfo: ContactInfo;
  adminCredentials: AdminCredentials;
  siteSettings: SiteSettings;
}

// In-memory store
let data: AppData = {
  cars: [], // Initialize with an empty array
  contactInfo: {
    phone: '+1 (555) 123-GARS (4549)',
    email: 'bookings@glitzyrides.com',
    instagram: '@GlitzyRidesOfficial',
    location: '456 Opulence Avenue, Diamond District, NY',
    contactPageImageUrl: 'https://placehold.co/800x600.png',
  },
  adminCredentials: {
    email: 'mjj.chethipuzha@gmail.com',
    password: 'salbin707123',
  },
  siteSettings: {
    heroImageUrl: 'https://placehold.co/1200x800.png',
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create deep copies to simulate immutable data updates
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getCars = async (): Promise<Car[]> => {
  await delay(100);
  // Return a deep copy to ensure components get new references if data changes
  return deepCopy(data.cars.map(car => ({
    ...car,
    // The data-ai-hint is primarily for Next/Image if it were to use AI for placeholders,
    // but not strictly necessary for Data URIs. Retaining for consistency.
    ['data-ai-hint']: car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "luxury car"
  })));
};

export const getCarById = async (id: string): Promise<Car | undefined> => {
  await delay(50);
  const car = data.cars.find(c => c.id === id);
  if (car) {
    const carCopy = deepCopy(car);
    carCopy['data-ai-hint'] = car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "luxury car";
    return carCopy;
  }
  return undefined;
};

export const addCar = async (carData: Omit<Car, 'id'>): Promise<Car> => {
  await delay(200);
  const newCar: Car = { ...carData, id: String(Date.now() + Math.random()) };
  // Add to the beginning of the array to show newest first
  data.cars = [newCar, ...data.cars];
  return deepCopy(newCar);
};

export const updateCar = async (updatedCarData: Car): Promise<Car | undefined> => {
  await delay(200);
  const index = data.cars.findIndex(car => car.id === updatedCarData.id);
  if (index !== -1) {
    // Ensure we create a new object for the updated car to help React detect changes
    data.cars[index] = deepCopy({ ...data.cars[index], ...updatedCarData });
    return deepCopy(data.cars[index]);
  }
  return undefined;
};

export const deleteCar = async (id: string): Promise<boolean> => {
  await delay(200);
  const initialLength = data.cars.length;
  data.cars = data.cars.filter(car => car.id !== id);
  return data.cars.length < initialLength;
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  await delay(50);
  return deepCopy(data.contactInfo);
};

export const updateContactInfo = async (newContactInfo: Partial<ContactInfo>): Promise<ContactInfo> => {
  await delay(200);
  data.contactInfo = deepCopy({ ...data.contactInfo, ...newContactInfo });
  return deepCopy(data.contactInfo);
};

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
  await delay(10);
  return deepCopy(data.adminCredentials);
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  await delay(50);
  return deepCopy(data.siteSettings);
};

export const updateSiteSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
  await delay(200);
  data.siteSettings = deepCopy({ ...data.siteSettings, ...newSettings });
  return deepCopy(data.siteSettings);
};
