export const mapEnumToCloudinaryResourceType = (type) => {
    switch (type) {
        case "IMAGE":
            return "image";
        case "VIDEO":
            return "video";
        case "AUDIO":
        case "DOCUMENT":
            return "raw";
        default:
            throw new Error(`Unsupported media type: ${type}`);
    }
};
