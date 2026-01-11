//
import { ObjectId } from 'mongoose';

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
}

export interface ICar {
  _id: ObjectId;
  name: string;
  description: string;
  image: string;
  color: string;
  isElectric: boolean;
  features: string[];
  pricePerHour: number;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TBooking {
  _id: ObjectId;
  date: Date;
  startTime: string;
  endTime: string | null;
  user: IUser;
  car: ICar;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  paymentStatus: string;
}

export interface TBookingResponse {
  _id: ObjectId;
  date?: Date;
  startTime?: string;
  endTime?: string | null;
  user?: IUser;
  car?: ICar;
  totalCost?: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
