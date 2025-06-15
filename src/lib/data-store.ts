import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Car, ContactInfo, AdminCredentials, SiteSettings } from './types';

const CARS_COLLECTION = 'cars';
const CONFIG_COLLECTION = 'configuration';
const CONTACT_DOC_ID = 'contactInfo';
const ADMIN_CREDENTIALS_DOC_ID = 'adminCredentials';
const SITE_SETTINGS_DOC_ID = 'siteSettings';

// Default data for seeding if documents don't exist
const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: '+1 (555) 123-GARS (4549)',
  email: 'bookings@glitzyrides.com',
  instagram: '@GlitzyRidesOfficial',
  location: '456 Opulence Avenue, Diamond District, NY',
  contactPageImageUrl: 'https://placehold.co/800x600.png',
};

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  email: 'mjj.chethipuzha@gmail.com',
  // IMPORTANT: Storing plain text passwords is not secure. Use Firebase Authentication.
  password: 'salbin707123',
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroImageUrl: 'https://placehold.co/1200x800.png',
};


export const getCars = async (): Promise<Car[]> => {
  const carsCollection = collection(db, CARS_COLLECTION);
  // Order by 'createdAt' in descending order to get newest cars first
  // Note: You'll need to ensure 'createdAt' field is set when adding cars
  // and create a composite index in Firestore if you use more complex queries.
  // For simplicity, I'm omitting orderBy for now if 'createdAt' isn't being set.
  // const q = query(carsCollection, orderBy("name", "asc")); // Example ordering
  const carsSnapshot = await getDocs(carsCollection);
  const carList = carsSnapshot.docs.map(docSnapshot => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as Omit<Car, 'id'>),
  }));
  return carList;
};

export const getCarById = async (id: string): Promise<Car | undefined> => {
  const carDocRef = doc(db, CARS_COLLECTION, id);
  const carSnapshot = await getDoc(carDocRef);
  if (carSnapshot.exists()) {
    return { id: carSnapshot.id, ...(carSnapshot.data() as Omit<Car, 'id'>) };
  }
  return undefined;
};

export const addCar = async (carData: Omit<Car, 'id'>): Promise<Car> => {
  // Consider adding a createdAt timestamp for ordering
  // const carPayload = { ...carData, createdAt: Timestamp.now() };
  const docRef = await addDoc(collection(db, CARS_COLLECTION), carData);
  return { id: docRef.id, ...carData };
};

export const updateCar = async (updatedCarData: Car): Promise<Car | undefined> => {
  const carDocRef = doc(db, CARS_COLLECTION, updatedCarData.id);
  // Make sure not to pass the id into the data to be updated
  const { id, ...dataToUpdate } = updatedCarData;
  await updateDoc(carDocRef, dataToUpdate);
  return updatedCarData; // Return the full object as passed
};

export const deleteCar = async (id: string): Promise<boolean> => {
  const carDocRef = doc(db, CARS_COLLECTION, id);
  await deleteDoc(carDocRef);
  return true; // Assume success, or add error handling
};


// Configuration getters/setters

export const getContactInfo = async (): Promise<ContactInfo> => {
  const docRef = doc(db, CONFIG_COLLECTION, CONTACT_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as ContactInfo;
  } else {
    // Document doesn't exist, create it with default values
    await setDoc(docRef, DEFAULT_CONTACT_INFO);
    return DEFAULT_CONTACT_INFO;
  }
};

export const updateContactInfo = async (newContactInfo: Partial<ContactInfo>): Promise<ContactInfo> => {
  const docRef = doc(db, CONFIG_COLLECTION, CONTACT_DOC_ID);
  await setDoc(docRef, newContactInfo, { merge: true }); // Use set with merge to create if not exist or update
  const updatedDoc = await getDoc(docRef); // Re-fetch to return the full, merged object
  return updatedDoc.data() as ContactInfo;
};

export const getAdminCredentials = async (): Promise<AdminCredentials> => {
  const docRef = doc(db, CONFIG_COLLECTION, ADMIN_CREDENTIALS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AdminCredentials;
  } else {
    await setDoc(docRef, DEFAULT_ADMIN_CREDENTIALS);
    return DEFAULT_ADMIN_CREDENTIALS;
  }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const docRef = doc(db, CONFIG_COLLECTION, SITE_SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as SiteSettings;
  } else {
    await setDoc(docRef, DEFAULT_SITE_SETTINGS);
    return DEFAULT_SITE_SETTINGS;
  }
};

export const updateSiteSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
  const docRef = doc(db, CONFIG_COLLECTION, SITE_SETTINGS_DOC_ID);
  await setDoc(docRef, newSettings, { merge: true });
  const updatedDoc = await getDoc(docRef);
  return updatedDoc.data() as SiteSettings;
};
