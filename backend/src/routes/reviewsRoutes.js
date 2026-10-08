const express = require("express");

const {
    getPublishedReviews,
    getAdminReviews,
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/reviewsController");

const adminAuth =
    require("../middleware/adminAuth");

const router = express.Router();


// ====================================
// PUBLIC
// ====================================

router.get(
    "/",
    getPublishedReviews
);


// ====================================
// ADMIN
// ====================================

router.get(
    "/admin",
    adminAuth,
    getAdminReviews
);

router.post(
    "/admin",
    adminAuth,
    createReview
);

router.patch(
    "/admin/:id",
    adminAuth,
    updateReview
);

router.delete(
    "/admin/:id",
    adminAuth,
    deleteReview
);


module.exports = router;