import express from 'express';

import auth from '../Middlewar/auth';
import { BookingController } from './booking/booking.controller';

const router = express.Router();

router.get('/bookings', auth('admin'), BookingController.getAllBookingsFromDb);
router.post('/bookings', auth('user'), BookingController.createBookingInDb);
router.get(
  '/bookings/my-bookings',
  auth('user'),
  BookingController.getAllBookingsUserFromDb,
);

router.delete('/bookings/:bookingId', BookingController.deleteSingleBooking);
router.patch(
  '/bookings/:bookingId',
  auth('admin'),
  BookingController.updateBookingInDb,
);

export const BookingRoutes = router;
