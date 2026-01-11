import { Schema, model, Types } from "mongoose";
import { INotification } from "./notification.interface";

const NotificationSchema = new Schema<INotification>(
    {
        user: { type: Types.ObjectId, ref: "User" },
        recipientEmail: { type: String },
        booking: { type: Types.ObjectId, ref: 'Booking' },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>(
    "Notification",
    NotificationSchema
);
