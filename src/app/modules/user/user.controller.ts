import { Request, Response } from 'express';
import { TSignIn, TUser } from './user.interface';
import { UserServices } from './user.service';
import { UserModel } from './user.model';
import catchAsync from '../../utils/catcgAsync';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { userValidationSchema } from './user.validation';
import config from '../../config';

const SignUp = async (req: Request, res: Response) => {
  try {
    const user: TUser = req.body; // Correctly assigning `user` to be of type `TUser`
    const zodParsedata = userValidationSchema.parse(user);

    // Check if a user with the same email already exists
    const isExistuser = await UserModel.findOne({ email: user.email });

    if (isExistuser) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User already exists with this email',
      });
    }

    const result = await UserServices.createUser(zodParsedata);

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No data found',
        data: {},
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the user',
      error: err instanceof Error ? err.message : 'Unknown error', // Include error message
    });
  }
};

const SignIn = async (req: Request, res: Response) => {
  try {
    const { email, password }: TSignIn = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 404,
        message: 'Invalid email or password',
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        statusCode: 404,
        message: 'Invalid email or password',
      });
    }

    // Call signIn with user information to get the access token
    const { accessToken, refreshToken } = await UserServices.signIn(email, password);

    // Generate refresh token


    // Set the refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'none', // Allow cross-origin requests
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Expire in 1 year
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsPasswordChange: user.needsPasswordChange,
        passwordChangedAt: user.passwordChangedAt,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken, // Include access token in response
    });
  } catch (err) {
    console.error('Error during sign-in:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred during sign-in',
    });
  }
};

const forgetPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await UserServices.forgetPassword(email);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Reset link is genarated succesfully',
    data: result,
  });
};
const resetPassword = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const result = await UserServices.resetPassword(req.body, token as string);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Password is reset succesfully',
    data: result,
  });
};

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  // Extract the refreshToken from cookies
  const { refreshToken } = req.cookies;
  console.log('refreshToken', refreshToken);
  if (!refreshToken) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Refresh token not found. Please login again.',
    });
  }

  try {
    // Call the service to refresh the token
    const result = await UserServices.refreshToken(refreshToken);

    // Send the new access token
    return res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Refresh token is retrieved successfully!',
      data: result,
    });
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Invalid or expired refresh token. Please login again.',
    });
  }
});

const getAllUserFromDb = async (req: Request, res: Response) => {
  try {
    const users = await UserServices.getAllUser();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while retrieving the users',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

const getUserFromDb = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming you're attaching user ID to req.user after authentication
    const user = await UserServices.getUser(userId);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while retrieving the user',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
const getAdminFromDb = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming you're attaching user ID to req.user after authentication
    const user = await UserServices.getAdmin(userId);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while retrieving the user',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

const updateUserinDb = async (req: Request, res: Response) => {
  try {
    // Support multipart/form-data where the client may send a JSON string in `user` or fields directly
    let user: TUser = req.body.user ? JSON.parse(req.body.user) : req.body;
    const userId = req.user._id;

    // If an image was uploaded via multer + Cloudinary, the URL is in req.file.path
    if (req.file?.path) {
      user.image = req.file.path;
    }

    // Ensure the user ID (string) is passed first, then the user object
    const result = await UserServices.updateUser(userId, user);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while updating the user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const updateUserRoleInDb = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId; // Ensure this corresponds to your route definition

    const { role } = req.body;

    // Ensure role is valid or defined as per your application's requirements
    if (!role) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Role is required',
      });
    }

    const result = await UserServices.updateUserRole(userId, role);

    // Check if the user was found and updated
    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User role updated successfully',
      data: result, // This will contain the updated user details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'An error occurred while updating the user role',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const UserControllers = {
  SignUp,
  SignIn,
  forgetPassword,
  refreshToken,
  getUserFromDb,
  updateUserinDb,
  getAdminFromDb,
  getAllUserFromDb,
  updateUserRoleInDb,
  resetPassword,
};
