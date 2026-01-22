import express from 'express';
import { CarControllers } from './car.controller';
import auth from '../../Middlewar/auth';
import { BookingController } from '../booking/booking.controller';
import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.post(
  '/cars',
  multerUpload.single('image'),
  auth('admin'),
  CarControllers.createCarInfo,
);
router.get('/cars', CarControllers.getAllCar);
router.put('/cars/return', auth('admin'), BookingController.returnCar);
router.get('/cars/available', auth('admin'), CarControllers.getAvailableCar);
router.get('/cars/:id', CarControllers.getSingleCar);
router.patch(
  '/cars/update',
  multerUpload.single('image'), // Ensure this matches the name used in FormData
  auth('admin'), // Authentication middleware
  CarControllers.updateCarInDb,
);
router.patch(
  '/cars/:id/status',
  auth('user'),
  CarControllers.updateCarStatus,
);
router.delete('/cars/:id', auth('admin'), CarControllers.deleteCarformDb);
export const CarRoutes = router;
