// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary credentials in environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perfumes',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto:best', fetch_format: 'auto' }
    ],
    format: 'webp', // prefer WebP format for better quality/size ratio
    resource_type: 'auto'
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // increased to 10MB to allow for higher quality images
  }
}).single('image');

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    }
    next();
  });
};

export default uploadMiddleware;
