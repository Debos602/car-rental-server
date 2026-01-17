
import { Types } from 'mongoose';
import { UserModel } from '../user/user.model';
import { getIo } from '../../socket';
import QueryBuilder from '../../builder/QueryBuilder';
import { NotificationModel } from './notification.model';

type CreateNotificationInput = {
    userId?: string;
    recipientEmail?: string;
    bookingId?: string;
    title: string;
    message: string;
};

const createNotification = async (input: CreateNotificationInput) => {
    const doc: any = {
        title: input.title,
        message: input.message,
    };

    if (input.userId) {
        doc.user = new Types.ObjectId(input.userId);
    }

    if (input.bookingId && Types.ObjectId.isValid(input.bookingId)) {
        doc.booking = new Types.ObjectId(input.bookingId);
    }

    if (input.recipientEmail) {
        doc.recipientEmail = input.recipientEmail;
        // try to attach a user if email belongs to a registered user
        try {
            const user = await UserModel.findOne({ email: input.recipientEmail }).exec();
            if (user) doc.user = user._id;
        } catch (err) {
            // ignore lookup errors
        }
    }

    const notification = await NotificationModel.create(doc);
    // emit via socket if available
    try {
        const io = getIo();
        if (io) {
            const room = notification.user ? notification.user.toString() : undefined;
            if (room) {
                io.to(room).emit('notification', notification);
            } else if (notification.recipientEmail) {
                // fallback: emit globally (clients can filter by email)
                io.emit('notification', notification);
            }
        }
    } catch (err) {
        // ignore socket errors
    }

    return notification;
};

const deleteNotificationsByBookingId = async (bookingId: string) => {
    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
        return { deletedCount: 0 } as any;
    }
    const result = await NotificationModel.deleteMany({ booking: new Types.ObjectId(bookingId) });
    return result;
};

const getNotificationsForUser = async (userId: string, query: any) => {
    const notifications = new QueryBuilder(NotificationModel.find({ user: userId }).sort({ createdAt: -1 }), query).search(['name'])
        .filter()
        .sort()
        .paginate();;

    const result = await notifications.modelQuery;
    const meta = await notifications.countTotal();

    return { result, meta };
};

const getAllNotification = async () => {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    return notifications;
};

const markReadByUser = async (userId: string) => {
    const result = await NotificationModel.updateMany(
        { user: userId, read: false },
        { read: true },
    );
    return result;
};
const markReadSingle = async (userId: string, notificationId: string) => {
    const result = await NotificationModel.findOneAndUpdate(
        { user: userId, _id: notificationId },
        { read: true },
        { new: true },
    ).exec();
    return result;
};
const markUnreadByUser = async (userId: string, notificationId: string) => {
    const result = await NotificationModel.updateMany(
        { user: userId, _id: notificationId, read: true },
        { read: false },
    );
    return result;
};

const deleteNotificationById = async (id: string) => {
    const result = await NotificationModel.findByIdAndDelete(id);
    return result;
};

export const NotificationServices = {
    createNotification,
    getNotificationsForUser,
    getAllNotification,
    deleteNotificationById,
    deleteNotificationsByBookingId,
    markReadByUser,
    markReadSingle,
    markUnreadByUser
};
