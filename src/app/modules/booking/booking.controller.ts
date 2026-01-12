import { Request, Response } from 'express';
import { BookingServices } from './booking.service';
import { NotificationServices } from '../notification/notification.service';
import { CarServices } from '../car/car.service';
import { getIo } from '../../socket';



const createBookingInDb = async (req: Request, res: Response) => {
  try {
    const { carId, date, startTime, endTime } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        error: 'User ID is missing',
      });
    }

    // Use the service to create the booking
    const result = await BookingServices.createBooking(
      carId,
      userId,
      date,
      startTime,
      endTime
    );

    // Update the car status to 'unavailable' after booking is created
    try {
      await CarServices.updateCarStatus(carId, 'unavailable');
      console.log(`Car ${carId} status updated to 'unavailable'`);
    } catch (carUpdateError) {
      console.error('Error updating car status:', carUpdateError);
      // Don't fail the booking if car status update fails, but log it
      // You might want to implement a retry mechanism or notification here
    }

    // Create a notification for the user about the booking
    // After NotificationServices.createNotification(...)
    try {
      const title = 'Booking Created';
      const messageText = `Your booking for ${result.car?.name || 'the car'} on ${result.date?.toISOString().split('T')[0]} from ${result.startTime} to ${result.endTime} has been created.`;

      const notification = await NotificationServices.createNotification({
        userId: userId?.toString(),
        bookingId: result._id?.toString(),
        title,
        message: messageText
      });

      // ✅ Emit via Socket.IO
      const io = getIo();
      if (io) {
        // Assuming you use room = userId
        io.to(userId?.toString()).emit('new-notification', notification);
        console.log('Notification emitted via socket for user:', userId);
      }
    } catch (notifyErr) {
      console.error('Failed to create booking notification:', notifyErr);
    }


    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Booking created successfully and car status updated',
      data: {
        _id: result._id,
        date: result.date?.toISOString().split('T')[0],
        startTime: result.startTime,
        endTime: result.endTime,
        user: {
          _id: result.user?._id?.toString(),
          name: result.user?.name,
          email: result.user?.email,
          role: result.user?.role,
          phone: result.user?.phone,
          address: result.user?.address,
        },
        car: {
          _id: result.car?._id?.toString(),
          name: result.car?.name,
          description: result.car?.description,
          image: result.car?.image,
          color: result.car?.color,
          isElectric: result.car?.isElectric,
          features: result.car?.features,
          pricePerHour: result.car?.pricePerHour,
          status: 'unavailable', // Updated status
          isDeleted: result.car?.isDeleted,
          createdAt: result.car?.createdAt?.toISOString(),
          updatedAt: result.car?.updatedAt?.toISOString(),
        },
        totalCost: result.totalCost,
        status: result.status,
        paymentStatus: result.paymentStatus,
        createdAt: result.createdAt?.toISOString(),
        updatedAt: result.updatedAt?.toISOString(),
      },
    });
  } catch (err) {
    console.error('Error creating booking:', err);

    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the booking',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

const getAllBookingsFromDb = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingServices.getAllBookings();

    // Always return a success response, even if there are no bookings.
    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      date: booking.date?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      startTime: booking.startTime,
      endTime: booking.endTime,
      user: {
        _id: booking.user?._id,
        name: booking.user?.name,
        email: booking.user?.email,
        role: booking.user?.role,
        phone: booking.user?.phone,
        address: booking.user?.address,
      },
      car: {
        _id: booking.car?._id,
        name: booking.car?.name,
        description: booking.car?.description,
        image: booking.car?.image,
        color: booking.car?.color,
        isElectric: booking.car?.isElectric,
        features: booking.car?.features,
        pricePerHour: booking.car?.pricePerHour,
        status: booking.car?.status,
        isDeleted: booking.car?.isDeleted,
        createdAt: booking.car?.createdAt?.toISOString(),
        updatedAt: booking.car?.updatedAt?.toISOString(),
      },
      totalCost: booking.totalCost,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
    }));

    // Respond with success status and the formatted bookings or an empty array if none exist.
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Bookings retrieved successfully',
      data: formattedBookings, // This will be empty if no bookings exist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the bookings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const getAllBookingsUserFromDb = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Ensure req.user is populated

    const bookings = await BookingServices.getAllBookingsUser(userId);

    // Format bookings data
    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      date: booking.date?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      startTime: booking.startTime,
      endTime: booking.endTime,
      user: {
        _id: booking.user?._id,
        name: booking.user?.name,
        email: booking.user?.email,
        role: booking.user?.role,
        phone: booking.user?.phone,
        address: booking.user?.address,
      },
      car: {
        _id: booking.car?._id,
        name: booking.car?.name,
        description: booking.car?.description,
        image: booking.car?.image,
        color: booking.car?.color,
        isElectric: booking.car?.isElectric,
        features: booking.car?.features,
        pricePerHour: booking.car?.pricePerHour,
        status: booking.car?.status,
        isDeleted: booking.car?.isDeleted,
        createdAt: booking.car?.createdAt?.toISOString(),
        updatedAt: booking.car?.updatedAt?.toISOString(),
      },
      totalCost: booking.totalCost,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
    }));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Bookings retrieved successfully',
      data: formattedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the bookings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const returnCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, endTime, status } = req.body;
    console.log(bookingId, endTime, status);
    if (!bookingId || !endTime) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Booking ID and end time are required',
      });
      return;
    }

    const updatedBooking = await BookingServices.returnCarService(
      bookingId,
      endTime,
      status,
    );

    if (!updatedBooking) {
      // Handle case where booking is not found
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Booking not found',
      });
      return;
    }

    // Successfully returned car
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Car returned successfully',
      data: updatedBooking,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    // Send internal server error response
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: errorMessage,
    });
  }
};

const deleteSingleBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = Array.isArray(req.params) ? req.params[0] : req.params;

    const result = await BookingServices.deleteSingleBookingfromDb(bookingId);

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Booking not found',
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Booking deleted successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while deleting the booking',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const updateBookingInDb = async (req: Request, res: Response) => {
  try {
    const { bookingId } = Array.isArray(req.params) ? req.params[0] : req.params;
    const bookingData = req.body;

    // Update the booking using the ID
    const result = await BookingServices.updateBooking(bookingId, bookingData);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Booking updated successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while updating the booking',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const BookingController = {
  createBookingInDb,
  getAllBookingsFromDb,
  getAllBookingsUserFromDb,
  returnCar,
  deleteSingleBooking,
  updateBookingInDb,
};
