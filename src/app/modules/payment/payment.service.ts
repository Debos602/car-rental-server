import { join } from 'path';
import OrderModel from '../order/order.model';
import { verifyPayment } from './payment.utils';
import { readFileSync } from 'fs';
import { NotificationServices } from '../notification/notification.service';
import { UserModel } from '../user/user.model';

const confirmationService = async (transactionId: string, status: string) => {
  const verifyResponse = await verifyPayment(transactionId);
  console.log(verifyResponse);

  let message = '';

  // Log all orders with the given transactionId to ensure multiple orders exist
  const matchingOrders = await OrderModel.find({ transactionId });
  console.log(
    `Found ${matchingOrders.length} orders with transactionId: ${transactionId}`,
  );

  let result;

  if (verifyResponse && verifyResponse.pay_status === 'Successful') {
    // Update all orders with the matching transactionId
    result = await OrderModel.updateMany(
      { transactionId },
      {
        paymentStatus: 'paid',
      },
    );

    // Ensure result is defined before accessing properties
    if (result && result.matchedCount > 0) {
      message = `Successfully paid for ${result.modifiedCount} orders`; // Set success message
    } else {
      message = 'Payment status updated, but no orders were modified';
    }
    // Create notifications for affected users/emails
    try {
      const orders = await OrderModel.find({ transactionId }).exec();
      for (const ord of orders) {
        let userId: string | undefined = undefined;
        try {
          const user = await UserModel.findOne({ email: ord.email }).exec();
          if (user) userId = user._id.toString();
        } catch (err) {
          // ignore lookup error
        }

        const title = 'Payment Successful';
        const messageBody = `Payment for your order ${ord._id} (${ord.carName}) on ${ord.date?.toISOString().split('T')[0]} was successful.`;
        await NotificationServices.createNotification({ userId, recipientEmail: ord.email, title, message: messageBody });
      }
    } catch (notifyErr) {
      console.error('Failed to create payment notifications:', notifyErr);
    }
  } else {
    message = 'Payment failed'; // Set the failure message
  }

  console.log(
    result
      ? `Matched ${result.matchedCount} and modified ${result.modifiedCount} orders`
      : 'No update result returned',
  );

  const filePath = join(__dirname, '../../../../public/confirmation.html');
  let template = readFileSync(filePath, 'utf-8');

  // Use 'message' to reflect payment status
  template = template.replace('{{message}}', status || message);

  return template;
};

export const paymentServices = {
  confirmationService,
};
