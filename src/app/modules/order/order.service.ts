
import { initiatPayment } from '../payment/payment.utils';
import BookingModel from '../booking/booking.model';
import { UserModel } from '../user/user.model';
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
    // console.log('Order created:', result);



    // Ensure that the order creation was successful and transactionId exists
    if (!result.transactionId) {
      throw new Error('Transaction ID is missing');
    }

    // Update related booking(s) to mark them as paid at order creation
    try {
      // Find the user by email to get the ObjectId stored on bookings
      const user = await UserModel.findOne({ email: result.email }).exec();
      if (user) {
        const filter: any = { user: user._id };
        if (result.totalCost !== undefined) filter.totalCost = result.totalCost;
        if (result.startTime) filter.startTime = result.startTime;

        // Optionally include date when it matches exactly
        if (result.date) filter.date = result.date;

        const updateRes = await BookingModel.updateMany(filter, { paymentStatus: 'paid' });
        // eslint-disable-next-line no-console
        console.log(`Marked ${updateRes.modifiedCount} booking(s) as paid for transaction ${result.transactionId}`);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`No user found with email ${result.email}; skipping booking update.`);
      }
    } catch (bkErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to update booking paymentStatus after creating order:', bkErr);
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
    // console.log('Initiating payment with data:', paymentData);



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
