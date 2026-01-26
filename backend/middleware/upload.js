import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// 🔹 File filter
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        // Images
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",

        // Videos
        "video/mp4",
        "video/webm",
        "video/quicktime",

        // Audio
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",

        // Documents
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

    console.log("📁 Uploaded file mimetype:", file.mimetype);

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

// 🔹 Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        // Detect context (posts / emails)
        const baseFolder = req.originalUrl.includes("emails")
            ? "emails"
            : "posts";

        let folder = `${baseFolder}/others`;

        if (file.mimetype.startsWith("image/")) {
            folder = `${baseFolder}/images`;
        } else if (file.mimetype.startsWith("video/")) {
            folder = `${baseFolder}/videos`;
        } else if (file.mimetype.startsWith("audio/")) {
            folder = `${baseFolder}/audio`;
        } else {
            folder = `${baseFolder}/documents`;
        }

        return {
            folder,
            resource_type: "auto",
            public_id: `${Date.now()}-${file.originalname
                .split(".")
                .slice(0, -1)
                .join(".")}`
        };
    }
});

// 🔹 Multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter
});

export default upload;
