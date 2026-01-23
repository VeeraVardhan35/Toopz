import {config} from 'dotenv';

config( {path : `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {PORT,
    NODE_ENV,
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    JWT_SECRET,
    JWT_EXPIRESIN,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET,
    CLOUNINARY_URL
} = process.env;