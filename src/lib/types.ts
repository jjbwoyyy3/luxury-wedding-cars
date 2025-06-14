export interface Car {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  instagram: string;
  location: string;
  contactPageImageUrl?: string; // Added for editable contact page image
}

export interface AdminCredentials {
  email: string;
  passwordHash?: string; // For potential future hashing
  password?: string; // For initial hardcoded password
}

export interface SiteSettings {
  heroImageUrl?: string;
}
