import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import { UserRoutes } from './app/modules/user/user.route';
import { CarRoutes } from './app/modules/car/car.route';
import { BookingRoutes } from './app/modules/booking/booking.route';
import { OrderRoutes } from './app/modules/order/order.route';
import { PaymentRoutes } from './app/modules/payment/payment.route';
import { NotificationRoutes } from './app/modules/notification/notification.route';
import path from 'path';
import globalErrorHandler from './app/Middlewar/globalErrorHandler';
import config from './app/config';

const app: Application = express();

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    console.log("CORS origin:", origin); // debug

    // AmarPay / Postman / browser direct hit → allow
    if (!origin || origin === "") return callback(null, true);

    const allowedOrigins = [
      config.Client_url,
      config.Server_url,
    ].filter(Boolean);

    // Valid frontend origins → allow
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // অন্য সব origin → block
    return callback(null, false); // throw না, শুধু blocked
  },
  credentials: true,
}));




app.use(cookieParser()); // Add cookie-parser middleware
app.use(express.static(path.join(__dirname, 'public')));

// Register routes
app.use('/api', UserRoutes);
app.use('/api', CarRoutes);
app.use('/api', BookingRoutes);
app.use('/api', OrderRoutes);
app.use('/api', PaymentRoutes);
app.use('/api', NotificationRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Car Rental Reservation System');
});

//Global error handler
app.use(globalErrorHandler);
// Global "Not Found" handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Not Found',
  });
});

export default app;