// IBooking.ts
export interface TOrder {
  carName: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalCost: number;
  transactionId?: string;
  paymentStatus?: string;
  name: string;
  email: string;
  phone: string;
}

export type paymentData = {
  transactionId: string;
  totalCost: number;
  name: string;
  email: string;
  phone: string;
};
