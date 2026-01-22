import { Request, Response } from 'express';
import { NotificationServices } from './notification.service';

const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const notifications = await NotificationServices.getNotificationsForUser(userId, req.query);
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};


const getAllNotificationfromDb = async (req: Request, res: Response) => {
    try {
        const notifications = await NotificationServices.getAllNotification();
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};

const markReadByUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const result = await NotificationServices.markReadByUser(userId);
        res.status(200).json({ success: true, message: 'Notifications marked as read', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};

const markReadSingle = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const result = await NotificationServices.markReadSingle(userId, notificationId);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Notification marked as read', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};

const markUnreadByUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const result = await NotificationServices.markUnreadByUser(userId, notificationId);
        res.status(200).json({ success: true, message: 'Notifications marked as unread', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};


const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = Array.isArray(req.params) ? req.params[0] : req.params;
        const result = await NotificationServices.deleteNotificationById(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Deleted', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};

const deleteNotificationByAdminFromDb = async (req: Request, res: Response) => {
    try {
        const { id } = Array.isArray(req.params) ? req.params[0] : req.params;
        const result = await NotificationServices.deleteNotificationByAdmin(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Deleted by admin', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Error' });
    }
};

export const NotificationController = {
    getNotifications,
    deleteNotification,
    markReadByUser,
    markReadSingle,
    markUnreadByUser,
    getAllNotificationfromDb,
    deleteNotificationByAdminFromDb
};
