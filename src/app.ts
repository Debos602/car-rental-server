import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import { UserRoutes } from './app/modules/user.route';
import { CarRoutes } from './app/modules/car.route';
import { BookingRoutes } from './app/modules/booking.route';
import { OrderRoutes } from './app/modules/order.route';
import { PaymentRoutes } from './app/modules/payment/payment.route';
import { NotificationRoutes } from './app/modules/notification/notification.route';
import path from 'path';
import globalErrorHandler from './app/Middlewar/globalErrorHandler';
import config from './app/config';

const app: Application = express();

app.use(express.json());

// CORS configuration
const allowedOrigins = [
  `${config.Client_url}`
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
