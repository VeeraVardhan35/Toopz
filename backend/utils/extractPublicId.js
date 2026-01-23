export const extractPublicId = (url) => {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex(p => p === "upload");
    const publicPath = parts.slice(uploadIndex + 2).join("/");
    return publicPath.replace(/\.[^/.]+$/, ""); // remove extension
};
