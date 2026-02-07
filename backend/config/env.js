import {config} from 'dotenv';

config( {path : `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {PORT,
    NODE_ENV,
<<<<<<< HEAD
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
    JWT_SECRET,
    JWT_EXPIRESIN,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    DB_SSL,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET,
    CLOUNINARY_URL
} = process.env;
=======
    JWT_SECRET,
    JWT_EXPIRESIN,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET,
    CLOUNINARY_URL, 
    SUPABASE_DATABASE_URL,
} = process.env;
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
