import { TBooking } from './booking.interface';
import BookingModel from './booking.model';
import CarModel from '../car/car.model';
import { NotificationServices } from '../notification/notification.service';

const calculateHoursFromISO = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid startTime or endTime format');
  }

  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);

  return hours;
};

const createBooking = async (
  carId: string,
  userId: string,
  date: string,
  startTime: string,
  endTime: string,
  extras?: {
    insurance?: boolean;
    gps?: boolean;
    childSeat?: boolean;
  },
) => {
  try {
    // 🔹 1. Find car
    const car = await CarModel.findById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    // 🔹 2. Calculate duration
    const hours = calculateHoursFromISO(startTime, endTime);
    if (hours <= 0) {
      throw new Error('End time must be greater than start time');
    }

    // 🔹 3. Validate price
    const pricePerHour = Number(car.pricePerHour);
    if (isNaN(pricePerHour) || pricePerHour <= 0) {
      throw new Error('Invalid car price');
    }

    // 🔹 4. Base cost
    let totalCost = pricePerHour * hours;

    // 🔹 5. Extras cost
    if (extras?.insurance) totalCost += 15 * hours;
    if (extras?.gps) totalCost += 5 * hours;
    if (extras?.childSeat) totalCost += 10 * hours;

    // 🔹 6. Final validation
    totalCost = Math.round((totalCost + Number.EPSILON) * 100) / 100;
    if (isNaN(totalCost) || totalCost <= 0) {
      throw new Error('Total cost calculation failed');
    }

    // 🔹 7. Create booking
    const booking = await BookingModel.create({
      car: carId,
      user: userId,
      date,
      startTime,
      endTime,
      extras,
      totalCost,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // 🔹 8. Update car status
    await CarModel.findByIdAndUpdate(carId, {
      status: 'unavailable',
    });

    // 🔹 9. Populate & return
    const populatedBooking = await BookingModel.findById(booking._id)
      .populate('user')
      .populate('car');

    return populatedBooking;
  } catch (error) {
    throw new Error(`Error creating booking: ${(error as Error).message}`);
  }
};

const getAllBookings = async () => {
  try {
    const bookings = await BookingModel.find()
      .populate('user') // Populate user details
      .populate('car'); // Populate car details

    return bookings;
  } catch (error) {
    throw new Error(`Error getting bookings: ${error}`);
  }
};
const getAllBookingsUser = async (id: string) => {
  try {
    // Fetch all bookings for a given user ID
    const bookings = await BookingModel.find({ user: id })
      .populate('user') // Populate user details
      .populate('car'); // Populate car details

    return bookings;
  } catch (error) {
    throw new Error(`Error getting bookings`);
  }
};

const returnCarService = async (
  bookingId: string,
  endTime: string,
  status: string,
): Promise<TBooking | null> => {
  // Find the booking by ID
  const booking = await BookingModel.findById(bookingId)
    .populate('user')
    .populate('car')
    .exec();

  // If no booking is found, return null instead of throwing an error
  if (!booking) {
    return null; // Handle in controller as a 404
  }

  // Helper function to convert time string (HH:mm or hh:mm AM/PM) to total hours
  const timeToHours = (time: string): number => {
    let totalHours = 0;
    const timeParts = time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);

    if (timeParts) {
      let hours = Number(timeParts[1]);
      const minutes = Number(timeParts[2]);
      const isPM = timeParts[3] && timeParts[3].toUpperCase() === 'PM';

      if (isPM && hours < 12) {
        hours += 12; // Convert PM hours to 24-hour format
      } else if (!isPM && hours === 12) {
        hours = 0; // Convert 12 AM to 0 hours
      }

      totalHours = hours + minutes / 60;
    }

    return totalHours;
  };

  // Log and convert times

  const startHours = timeToHours(booking.startTime);
  let endHours = timeToHours(endTime);

  if (isNaN(startHours) || isNaN(endHours)) {
    throw new Error('Invalid start time or end time');
  }

  // Handle next-day end time case
  if (endHours < startHours) {
    endHours += 24;
  }

  const durationHours = endHours - startHours;

  if (isNaN(durationHours) || durationHours < 0) {
    throw new Error('Invalid duration');
  }

  const pricePerHour = booking.car?.pricePerHour ?? 0;
  if (pricePerHour <= 0) {
    throw new Error('Invalid price per hour');
  }

  const totalCost = durationHours * pricePerHour;
  if (isNaN(totalCost) || totalCost < 0) {
    throw new Error('Total cost calculation failed');
  }

  booking.status = status;
  booking.endTime = endTime;
  booking.totalCost = totalCost;
  await booking.save();

  // Update car status
  if (booking.car) {
    await CarModel.findByIdAndUpdate(booking.car._id, { status: 'available' });
  }

  return booking;
};

const deleteSingleBookingfromDb = async (bookingId: string) => {
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      return null; // Return null if booking not found
    }
    const carId = deletedBooking.car._id; // Assuming car is populated in the booking
    await CarModel.findByIdAndUpdate(carId, { status: 'available' });
    // Delete any notifications related to this booking (best-effort)
    try {
      await NotificationServices.deleteNotificationsByBookingId(deletedBooking._id.toString());
    } catch (notifyErr) {
      // Log but do not fail the deletion
      // eslint-disable-next-line no-console
      console.error('Failed to delete related notifications for booking:', notifyErr);
    }
    return deletedBooking; // return null if not found
  } catch (error) {
    throw new Error(`Error deleting booking: ${error}`);
  }
};
const updateBooking = async (bookingId: string, booking: Partial<TBooking>) => {
  try {
    // Update the booking with the given data
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { $set: booking },
      { new: true },
    ).populate('user'); // Ensure the user field is populated if it's a reference

    // Check if user exists
    const user = updatedBooking?.user;
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare payment data
    // Log payment session

    return updatedBooking;
  } catch (error) {
    // Log the error message and throw a more informative error
    console.error('Error:', error);
    throw new Error(`Error updating booking: ${(error as Error).message}`);
  }
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  getAllBookingsUser,
  returnCarService,
  deleteSingleBookingfromDb,
  updateBooking,
};
