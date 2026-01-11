import express from 'express';
import { OrderController } from './order/order.controller';
import auth from '../Middlewar/auth';

const router = express.Router();

router.post('/orders', auth('user'), OrderController.createOrderInDb);
router.get('/orders', auth('admin'), OrderController.getOrderFromDb);
router.patch('/orders/update', auth('user'), OrderController.updateOrderInDb);

// app.get('/', (req, res) => {
//     const template = await paymentServices.confirmationService(req.query, );
//       res.send(template));
//     });

export const OrderRoutes = router;
