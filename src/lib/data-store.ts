import type { Car, ContactInfo, AdminCredentials, SiteSettings } from './types';

interface AppData {
  cars: Car[];
  contactInfo: ContactInfo;
  adminCredentials: AdminCredentials;
  siteSettings: SiteSettings;
}

// In-memory store
let data: AppData = {
  cars: [
    { id: '1', name: 'Rolls Royce Phantom', description: 'The pinnacle of luxury motoring. Make an unforgettable entrance.', imageUrl: 'https://placehold.co/800x600.png' /*data-ai-hint="luxury sedan"*/ },
    { id: '2', name: 'Bentley Continental GT', description: 'Grand touring excellence with breathtaking performance and exquisite craftsmanship.', imageUrl: 'https://placehold.co/800x600.png' /*data-ai-hint="sports coupe"*/ },
    { id: '3', name: 'Mercedes-Maybach S-Class', description: 'Opulence and cutting-edge technology combined for an unparalleled chauffeured experience.', imageUrl: 'https://placehold.co/800x600.png' /*data-ai-hint="luxury limousine"*/ },
    { id: '4', name: 'Lamborghini Urus', description: 'The world\'s first Super Sport Utility Vehicle, where luxury meets thrilling performance.', imageUrl: 'https://placehold.co/800x600.png' /*data-ai-hint="luxury suv"*/ },
    { id: '5', name: 'Ferrari Portofino M', description: 'A stunning convertible supercar offering exhilarating drives and timeless Italian style.', imageUrl: 'https://placehold.co/800x600.png' /*data-ai-hint="convertible supercar"*/ },
  ],
  contactInfo: {
    phone: '+1 (555) 123-GARS (4549)',
    email: 'bookings@glitzyrides.com',
    instagram: '@GlitzyRidesOfficial',
    location: '456 Opulence Avenue, Diamond District, NY',
    contactPageImageUrl: 'https://placehold.co/800x600.png', // Default placeholder
  },
  adminCredentials: {
    email: 'mjj.chethipuzha@gmail.com',
    password: 'salbin707123', // In a real app, this would be hashed and stored securely
  },
  siteSettings: {
    heroImageUrl: 'https://placehold.co/1200x800.png', // Default placeholder
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCars = async (): Promise<Car[]> => {
  await delay(100); 
  return JSON.parse(JSON.stringify(data.cars.map(car => ({
    ...car,
    ['data-ai-hint']: car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "luxury car"
  }))));
};

export const getCarById = async (id: string): Promise<Car | undefined> => {
  await delay(50);
  const car = data.cars.find(car => car.id === id);
  if (car) {
    const carCopy = JSON.parse(JSON.stringify(car));
    carCopy['data-ai-hint'] = car.name.toLowerCase().split(' ').slice(0,2).join(' ') || "luxury car";
    return carCopy;
  }
  return undefined;
};

export const addCar = async (carData: Omit<Car, 'id'>): Promise<Car> => {
  await delay(200);
  const newCar: Car = { ...carData, id: String(Date.now() + Math.random()) }; 
  data.cars.unshift(newCar); 
  return JSON.parse(JSON.stringify(newCar));
};

export const updateCar = async (updatedCar: Car): Promise<Car | undefined> => {
  await delay(200);
  const index = data.cars.findIndex(car => car.id === updatedCar.id);
  if (index !== -1) {
    data.cars[index] = { ...data.cars[index], ...updatedCar };
    return JSON.parse(JSON.stringify(data.cars[index]));
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
  return JSON.parse(JSON.stringify(data.contactInfo));
};

export const updateContactInfo = async (newContactInfo: Partial<ContactInfo>): Promise<ContactInfo> => {
  await delay(200);
  data.contactInfo = { ...data.contactInfo, ...newContactInfo };
  return JSON.parse(JSON.stringify(data.contactInfo));
};

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
  await delay(10);
  return JSON.parse(JSON.stringify(data.adminCredentials));
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  await delay(50);
  return JSON.parse(JSON.stringify(data.siteSettings));
};

export const updateSiteSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
  await delay(200);
  data.siteSettings = { ...data.siteSettings, ...newSettings };
  return JSON.parse(JSON.stringify(data.siteSettings));
};
