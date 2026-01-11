import { Types } from "mongoose";

export interface INotification {
    _id?: Types.ObjectId;

    user?: Types.ObjectId;
    recipientEmail?: string;
    booking?: Types.ObjectId;

    title: string;
    message: string;

    read: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}
