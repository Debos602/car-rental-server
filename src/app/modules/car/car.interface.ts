import { ObjectId } from 'mongoose';

export interface TCar {
  _id?: ObjectId;
  name: string;
  description: string;
  color: string;
  isElectric: boolean;
  status?: 'available' | 'unavailable'; // Defaults to 'available'
  features: string[];
  rating?: number;
  pricePerHour: number;
  isDeleted: boolean; // Defaults to false
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  location: string;
}

export interface TDecodedToken {
  userId: string;
  role: string;
}
