import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../Middlewar/auth';

const router = express.Router();

router.get('/notifications', auth('user'), NotificationController.getNotifications);
router.get('/notifications/admin', auth('admin'), NotificationController.getAllNotificationfromDb);
router.delete('/notifications/:id', auth('user'), NotificationController.deleteNotification);
router.patch('/notifications/mark-read', auth('user'), NotificationController.markReadByUser);
router.patch('/notifications/mark-unread/:id', auth('user'), NotificationController.markUnreadByUser);

export const NotificationRoutes = router;
