import { initiatPayment } from '../payment/payment.utils';
import { TOrder } from './order.interface';
import OrderModel from './order.model';

const createOrder = async (data: TOrder) => {
  try {
    // Generate a transaction ID before creating the order
    const transactionId: string = `TXN-${Date.now()}`;

    // Include transaction ID in the order data
    const orderData = {
      ...data,
      transactionId,
    };

    // Create the order in the database
    const result = await OrderModel.create(orderData);
    console.log('Order created:', result);

    // Ensure that the order creation was successful and transactionId exists
    if (!result.transactionId) {
      throw new Error('Transaction ID is missing');
    }

    // Prepare payment data for initiating the payment session
    const paymentData = {
      transactionId: result.transactionId, // This should be defined
      totalCost: result.totalCost,
      name: result?.name, // Ensure user data is available
      email: result?.email,
      phone: result?.phone,
    };

    // Log payment initiation attempt
    console.log('Initiating payment with data:', paymentData);

    // Initiate the payment session
    const paymentSession = await initiatPayment(paymentData);

    // Check if the payment session was created successfully
    if (!paymentSession) {
      throw new Error('Failed to initiate payment session');
    }

    return paymentSession;
  } catch (error) {
    // Log the specific error for debugging
    console.error('Error creating order or initiating payment:', error);

    // Re-throw the error so it can be handled at a higher level
    throw new Error(`Order creation failed: ${error}`);
  }
};

const getOrder = async () => {
  try {
    const order = await OrderModel.find();
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
};

const updateOrder = async (email: string, order: TOrder) => {
  try {
    const result = await OrderModel.findOneAndUpdate(
      { email }, // Find the order by email field
      order, // Update with the new order details
      { new: true }, // Return the updated document
    );
    return result;
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

export const OrderServices = {
  createOrder,
  getOrder,
  updateOrder,
};
