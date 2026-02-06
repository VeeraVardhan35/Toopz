export const mapCloudinaryTypeToEnum = (resourceType, mimeType) => {
    if (resourceType === "image") {
        return "IMAGE";
    }

    if (resourceType === "video") {
        return "VIDEO";
    }

    if (resourceType === "raw") {
        if (mimeType?.startsWith("audio/")) {
            return "AUDIO";
        }
        return "DOCUMENT";
    }

    throw new Error(`Unsupported Cloudinary resource type: ${resourceType}`);
};
