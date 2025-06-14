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
}

export interface AdminCredentials {
  email: string;
  passwordHash?: string; // For potential future hashing
  password?: string; // For initial hardcoded password
}
