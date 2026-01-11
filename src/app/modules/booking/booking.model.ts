import mongoose, { Schema } from 'mongoose';
import { TBooking } from './booking.interface';

const bookingSchema: Schema = new Schema<TBooking>(
  {
    date: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      default: null,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'paid', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

const BookingModel = mongoose.model<TBooking>('Booking', bookingSchema);

export default BookingModel;
