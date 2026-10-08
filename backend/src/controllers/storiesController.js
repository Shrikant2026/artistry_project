const crypto = require("crypto");

const storiesService =
    require("../services/storiesService");

const storageService =
    require("../services/storageService");

const uploadStoryCoverImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Story cover image is required."
            });
        }


        const extension =
            req.file.originalname
                .split(".")
                .pop()
                .toLowerCase();


        const uniqueName =
            `${crypto.randomUUID()}.${extension}`;


        const filePath =
            `stories/${uniqueName}`;


        const uploaded =
            await storageService
                .uploadStoryCoverImage(
                    req.file,
                    filePath
                );


        return res.status(201).json({

            success: true,

            message:
                "Story cover image uploaded successfully.",

            image: {
                path: uploaded.path,
                url: uploaded.publicUrl
            }

        });

    } catch (error) {

        console.error(
            "Upload story cover image error:",
            error
        );


        return res.status(
            Number(error.statusCode) || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to upload story cover image."

        });
    }
};

const getStories = async (req, res) => {
    try {
        const stories =
            await storiesService.getStories();

        return res.json({
            success: true,
            stories
        });

    } catch (error) {
        console.error(
            "Get stories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load stories."
        });
    }
};


const getStoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Story slug is required."
            });
        }

        const story =
            await storiesService.getStoryBySlug(
                slug
            );

        return res.json({
            success: true,
            story
        });

    } catch (error) {
        console.error(
            "Get story error:",
            error
        );

        return res.status(404).json({
            success: false,
            message: "Story not found."
        });
    }
};


const getAdminStories = async (req, res) => {
    try {
        const stories =
            await storiesService.getAdminStories();

        return res.json({
            success: true,
            stories
        });

    } catch (error) {
        console.error(
            "Get admin stories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load stories."
        });
    }
};


const createStory = async (req, res) => {
    try {
        const story =
            await storiesService.createStory(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Story created successfully.",
            story
        });

    } catch (error) {
        console.error(
            "Create story error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to create story."
        });
    }
};


const updateStory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Story ID is required."
            });
        }

        const story =
            await storiesService.updateStory(
                id,
                req.body
            );

        return res.json({
            success: true,
            message:
                "Story updated successfully.",
            story
        });

    } catch (error) {
        console.error(
            "Update story error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to update story."
        });
    }
};


const deleteStory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Story ID is required."
            });
        }

        const story =
            await storiesService.deleteStory(id);

        return res.json({
            success: true,
            message:
                "Story deleted successfully.",
            story
        });

    } catch (error) {
        console.error(
            "Delete story error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to delete story."
        });
    }
};


module.exports = {
    getStories,
    getStoryBySlug,
    getAdminStories,
    createStory,
    updateStory,
    deleteStory,
    uploadStoryCoverImage
};