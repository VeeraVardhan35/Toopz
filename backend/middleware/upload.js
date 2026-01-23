import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

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
        "text/plain",
        "application/zip"
    ];

    console.log("Uploaded file mimetype:", file.mimetype);

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = "posts/others";

        if (file.mimetype.startsWith("image/")) folder = "posts/images";
        else if (file.mimetype.startsWith("video/")) folder = "posts/videos";
        else if (file.mimetype.startsWith("audio/")) folder = "posts/audio";
        else folder = "posts/documents";

        return {
            folder,
            resource_type: "auto",
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`
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
