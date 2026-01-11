import express from 'express';
import { UserControllers } from './user/user.controller';
import auth from '../Middlewar/auth';
import { multerUploadForUsers } from '../config/multer.config';

const router = express.Router();

router.post('/auth/signup', UserControllers.SignUp);
router.post('/auth/signin', UserControllers.SignIn);
router.post('/auth/forget-password', UserControllers.forgetPassword);
router.post('/auth/reset-password', UserControllers.resetPassword);
router.post('/auth/refresh-token', UserControllers.refreshToken);
router.get('/auth/all-users', auth('admin'), UserControllers.getAllUserFromDb);
router.get('/auth/admin', auth('admin'), UserControllers.getAdminFromDb);
router.get('/auth/user', auth('user'), UserControllers.getUserFromDb);
router.put('/auth/update-user', multerUploadForUsers.single('image'), auth('user'), UserControllers.updateUserinDb);
router.put(
  '/auth/update-role/:userId',
  auth('admin'),
  UserControllers.updateUserRoleInDb,
);

export const UserRoutes = router;
