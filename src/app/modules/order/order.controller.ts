import { Request, Response } from 'express';
import { OrderServices } from './order.service';

const createOrderInDb = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Attempt to create the order and initiate payment
    const result = await OrderServices.createOrder(data);

    console.log("result...", result);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Order created successfully',
      data: result,
    });
  } catch (err) {
    // Log the error for debugging
    console.error('Order creation error:', err);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while creating the order',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    });
  }
};

const getOrderFromDb = async (req: Request, res: Response) => {
  try {
    const result = await OrderServices.getOrder();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while retrieving the order',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

const updateOrderInDb = async (req: Request, res: Response) => {
  try {
    const orderEmail = req.body.email;
    console.log(orderEmail);
    const data = req.body;

    console.log(data);
    const result = await OrderServices.updateOrder(orderEmail, data);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order updated successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while updating the order',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const OrderController = {
  createOrderInDb,
  getOrderFromDb,
  updateOrderInDb,
};
