export const mapCloudinaryTypeToEnum = (resourceType, mimeType) => {
    // Images
    if (resourceType === "image") {
        return "IMAGE";
    }

    // Videos
    if (resourceType === "video") {
        return "VIDEO";
    }

    // Raw files (documents, audio, etc.)
    if (resourceType === "raw") {
        if (mimeType?.startsWith("audio/")) {
            return "AUDIO";
        }
        return "DOCUMENT";
    }

    throw new Error(`Unsupported Cloudinary resource type: ${resourceType}`);
};
