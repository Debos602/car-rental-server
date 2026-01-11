import { ObjectId } from 'mongoose';

export type TUser = {
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string;
  confirmPassword?: string;
  needsPasswordChange?: boolean;
  passwordChangedAt?: Date;
  phone: string;
  nid?: string;
  drivingLicense?: string;
  features?: string[];
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface TSignIn {
  user: ObjectId;
  email: string;
  password: string;
}
