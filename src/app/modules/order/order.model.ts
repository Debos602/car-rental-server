import mongoose, { Schema } from 'mongoose';
import { TOrder } from './order.interface';

const OrderSchema: Schema = new Schema(
  {
    carName: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Change to Date if preferred
    endTime: { type: String, required: true }, // Change to Date if preferred
    totalCost: { type: Number, required: true },
    transactionId: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    name: { type: String, required: true }, // Added field
    email: { type: String, required: true }, // Added field
    phone: { type: String, required: true }, // Added field
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
  },
);

const OrderModel = mongoose.model<TOrder>('Order', OrderSchema);

export default OrderModel;
