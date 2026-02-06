import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",

        "video/mp4",
        "video/webm",
        "video/quicktime",

        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",

        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "application/zip"
    ];


    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        let baseFolder = "posts";
        if (req.originalUrl.includes("upload-profile") || req.originalUrl.includes("/users")) {
            baseFolder = "users";
        } else if (req.originalUrl.includes("upload-logo") || req.originalUrl.includes("university")) {
            baseFolder = "universities";
        } else if (req.originalUrl.includes("emails")) {
            baseFolder = "emails";
        }
        let folder = `${baseFolder}/others`;

        let resourceType = "auto";

        if (file.mimetype.startsWith("image/")) {
            if (baseFolder === "users") {
                folder = `${baseFolder}/profiles`;
            } else if (baseFolder === "universities") {
                folder = `${baseFolder}/logos`;
            } else {
                folder = `${baseFolder}/images`;
            }
            resourceType = "image";
        } else if (file.mimetype.startsWith("video/")) {
            folder = `${baseFolder}/videos`;
            resourceType = "video";
        } else if (file.mimetype.startsWith("audio/")) {
            folder = `${baseFolder}/audio`;
            resourceType = "video";
        } else {
            folder = `${baseFolder}/documents`;
            resourceType = "raw";
        }

        return {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname
                .split(".")
                .slice(0, -1)
                .join(".")}`
        };
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter
});

export default upload;
