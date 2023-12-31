const cloudinary = require('cloudinary').v2;

exports.videoUploadToCloudinary = async (file, folder, resourceType, options) => {
    try {
        // Set up the initial options
        const uploadOptions = { folder };
        
        // Merge additional options if provided
        if (options) {
            Object.assign(uploadOptions, options);
        }

        // Set the resource type (auto, video, raw, etc.)
        uploadOptions.resource_type = resourceType || "auto";

        // Upload the video to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);

        return result;
    } catch (error) {
        return {
            success: false,
            message: "Cloudinary error while uploading video.",
            error: error.message || error
        };
    }
};
