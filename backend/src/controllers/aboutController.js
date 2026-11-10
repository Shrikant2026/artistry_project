const aboutService = require("../services/aboutService");
const { uploadAboutImage, uploadBrandLogo } = require("../services/storageService");

const getPublicAbout = async (req, res) => {
    try {
        const about = await aboutService.getAboutPage();

        res.json({
            success: true,
            about
        });
    } catch (error) {
        console.error("Get public about error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch About page."
        });
    }
};

const getAdminAbout = async (req, res) => {
    try {
        const about = await aboutService.getAboutPage();

        res.json({
            success: true,
            about
        });
    } catch (error) {
        console.error("Get admin about error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch About page."
        });
    }
};

const updateAbout = async (req, res) => {
    try {
        const allowedFields = [
            "artist_name",
            "professional_title",
            "heading",
            "introduction",
            "biography",
            "philosophy",
            "closing_message"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No About page fields provided."
            });
        }

        const about = await aboutService.updateAboutPage(updates);

        res.json({
            success: true,
            message: "About page updated successfully.",
            about
        });
    } catch (error) {
        console.error("Update about error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update About page."
        });
    }
};

const uploadAboutPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const extension = req.file.originalname
            .split(".")
            .pop()
            .toLowerCase();

        const filePath = `about/artist-${Date.now()}.${extension}`;

        const uploaded = await uploadAboutImage(req.file, filePath);

        const about = await aboutService.updateAboutPage({
            artist_image_url: uploaded.publicUrl,
            artist_image_path: uploaded.path
        });

        res.json({
            success: true,
            message: "Artist photograph uploaded successfully.",
            about
        });
    } catch (error) {
        console.error("Upload about photo error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to upload artist photograph."
        });
    }
};

const uploadBrandLogoImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a logo image."
            });
        }

        const extension = req.file.originalname
            .split(".")
            .pop()
            .toLowerCase();

        const filePath = `about/brand-logo-${Date.now()}.${extension}`;

        const uploaded = await uploadBrandLogo(req.file, filePath);

        const about = await aboutService.updateAboutPage({
            brand_logo_url: uploaded.publicUrl,
            brand_logo_path: uploaded.path
        });

        res.json({
            success: true,
            message: "Brand logo uploaded successfully.",
            about
        });
    } catch (error) {
        console.error("Upload brand logo error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to upload brand logo."
        });
    }
};

module.exports = {
    getPublicAbout,
    getAdminAbout,
    updateAbout,
    uploadAboutPhoto,
    uploadBrandLogoImage
};