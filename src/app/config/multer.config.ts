import { CloudinaryStorage, Options } from 'multer-storage-cloudinary';
import { cloudinaryUpload } from './cloudinary.config'; // Assuming you have a proper config here
import multer from 'multer';

// Extend Options to include folder and allowedFormats
interface CloudinaryParams extends Options {
  folder: string; // This is now required
  allowedFormats: string[];
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload, // This is mandatory
  params: {
    folder: 'car-images', // specify the folder name in Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'], // specify allowed file formats
  } as CloudinaryParams, // Cast to your custom type
});

const storageUser = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    folder: 'user-avatars',
    allowedFormats: ['jpg', 'png', 'jpeg'],
  } as CloudinaryParams,
});

export const multerUpload = multer({ storage });
export const multerUploadForUsers = multer({ storage: storageUser });
