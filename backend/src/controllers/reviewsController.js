const reviewsService = require("../services/reviewsService");


const getPublishedReviews = async (req, res) => {
    try {
        const reviews =
            await reviewsService.getPublishedReviews();

        return res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error(
            "Get published reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load reviews."
        });
    }
};


const getAdminReviews = async (req, res) => {
    try {
        const reviews =
            await reviewsService.getAdminReviews();

        return res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error(
            "Get admin reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load reviews."
        });
    }
};


const createReview = async (req, res) => {
    try {
        const {
            customerName,
            rating,
            reviewText,
            customerImageUrl,
            displayOrder,
            isPublished
        } = req.body;

        if (
            !customerName ||
            rating === undefined ||
            !reviewText
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer name, rating and review text are required."
            });
        }

        const numericRating =
            Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be an integer between 1 and 5."
            });
        }

        const review =
            await reviewsService.createReview({
                customerName:
                    customerName.trim(),
                rating: numericRating,
                reviewText:
                    reviewText.trim(),
                customerImageUrl,
                displayOrder:
                    Number(displayOrder) || 0,
                isPublished:
                    isPublished === true
            });

        return res.status(201).json({
            success: true,
            message:
                "Review created successfully.",
            review
        });

    } catch (error) {
        console.error(
            "Create review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create review."
        });
    }
};


const updateReview = async (req, res) => {
    try {
        const {
            customerName,
            rating,
            reviewText,
            customerImageUrl,
            displayOrder,
            isPublished
        } = req.body;

        if (
            rating !== undefined
        ) {
            const numericRating =
                Number(rating);

            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Rating must be an integer between 1 and 5."
                });
            }
        }

        const review =
            await reviewsService.updateReview(
                req.params.id,
                {
                    customerName:
                        customerName !== undefined
                            ? customerName.trim()
                            : undefined,

                    rating:
                        rating !== undefined
                            ? Number(rating)
                            : undefined,

                    reviewText:
                        reviewText !== undefined
                            ? reviewText.trim()
                            : undefined,

                    customerImageUrl,

                    displayOrder:
                        displayOrder !== undefined
                            ? Number(displayOrder)
                            : undefined,

                    isPublished
                }
            );

        return res.json({
            success: true,
            message:
                "Review updated successfully.",
            review
        });

    } catch (error) {
        console.error(
            "Update review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update review."
        });
    }
};


const deleteReview = async (req, res) => {
    try {
        await reviewsService.deleteReview(
            req.params.id
        );

        return res.json({
            success: true,
            message:
                "Review deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete review."
        });
    }
};


module.exports = {
    getPublishedReviews,
    getAdminReviews,
    createReview,
    updateReview,
    deleteReview
};