const portfolioService =
    require("../services/portfolioService");

const storageService =
    require("../services/storageService");

const crypto =
    require("crypto");


// ====================================
// PUBLIC - GET PORTFOLIO
// ====================================

const getPortfolio = async (req, res) => {
    try {

        const portfolio =
            await portfolioService.getPortfolio();

        return res.status(200).json({
            success: true,
            portfolio
        });

    } catch (error) {

        console.error(
            "Get portfolio error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch portfolio."
        });
    }
};


// ====================================
// PUBLIC - GET CATEGORIES
// ====================================

const getPortfolioCategories = async (
    req,
    res
) => {
    try {

        const categories =
            await portfolioService
                .getPortfolioCategories();

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {

        console.error(
            "Get portfolio categories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch portfolio categories."
        });
    }
};


// ====================================
// ADMIN - GET ALL PORTFOLIO
// ====================================

const getAdminPortfolio = async (
    req,
    res
) => {
    try {

        const portfolio =
            await portfolioService
                .getAdminPortfolio();

        return res.status(200).json({
            success: true,
            portfolio
        });

    } catch (error) {

        console.error(
            "Get admin portfolio error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch admin portfolio."
        });
    }
};


// ====================================
// ADMIN - CREATE PORTFOLIO ITEM
// ====================================

const createPortfolioItem = async (
    req,
    res
) => {
    try {

        const {
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            category_id,
            display_order,
            is_featured,
            is_published
        } = req.body;


        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Portfolio title is required."
            });
        }


        const portfolioItem =
            await portfolioService
                .createPortfolioItem({
                    title,
                    description,
                    imageUrl:
                        image_url,
                    storagePath:
                        storage_path,
                    altText:
                        alt_text,
                    categoryId:
                        category_id,
                    displayOrder:
                        display_order,
                    isFeatured:
                        is_featured,
                    isPublished:
                        is_published
                });


        return res.status(201).json({
            success: true,
            message:
                "Portfolio item created successfully.",
            portfolioItem
        });

    } catch (error) {

        console.error(
            "Create portfolio item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create portfolio item."
        });
    }
};


// ====================================
// ADMIN - UPDATE PORTFOLIO ITEM
// ====================================

const updatePortfolioItem = async (
    req,
    res
) => {
    try {

        const {
            id
        } = req.params;


        const {
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            category_id,
            display_order,
            is_featured,
            is_published
        } = req.body;


        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Portfolio title is required."
            });
        }


        const portfolioItem =
            await portfolioService
                .updatePortfolioItem(
                    id,
                    {
                        title,
                        description,
                        imageUrl:
                            image_url,
                        storagePath:
                            storage_path,
                        altText:
                            alt_text,
                        categoryId:
                            category_id,
                        displayOrder:
                            display_order,
                        isFeatured:
                            is_featured,
                        isPublished:
                            is_published
                    }
                );


        return res.status(200).json({
            success: true,
            message:
                "Portfolio item updated successfully.",
            portfolioItem
        });

    } catch (error) {

        console.error(
            "Update portfolio item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update portfolio item."
        });
    }
};

// ====================================
// ADMIN - UPLOAD PORTFOLIO IMAGE
// ====================================

const uploadPortfolioImage = async (
    req,
    res
) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Portfolio image is required."
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
            `portfolio/${uniqueName}`;


        const uploaded =
            await storageService
                .uploadPortfolioImage(
                    req.file,
                    filePath
                );


        return res.status(201).json({
            success: true,
            message:
                "Portfolio image uploaded successfully.",

            image: {
                path:
                    uploaded.path,

                url:
                    uploaded.publicUrl
            }
        });

    } catch (error) {

        console.error(
            "Upload portfolio image error:",
            error
        );


        return res.status(
            Number(error.statusCode) || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to upload portfolio image."
        });
    }
};

const deletePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Portfolio item ID is required."
            });
        }

        const deletedItem =
            await portfolioService.deletePortfolioItem(id);

        return res.json({
            success: true,
            message:
                "Portfolio item deleted successfully.",
            item: deletedItem
        });

    } catch (error) {
        console.error(
            "Delete portfolio item error:",
            error
        );

        return res.status(
            Number(error.statusCode) || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to delete portfolio item."
        });
    }
};

module.exports = {
    getPortfolio,
    getPortfolioCategories,
    getAdminPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    uploadPortfolioImage,
    deletePortfolioItem
};