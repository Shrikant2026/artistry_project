const express = require("express");

const portfolioController =
    require("../controllers/portfolioController");

const adminAuth =
    require("../middleware/adminAuth");

const uploadImage =
    require("../middleware/uploadImage");

const router = express.Router();


// ====================================
// PUBLIC
// ====================================

router.get(
    "/",
    portfolioController.getPortfolio
);

router.get(
    "/categories",
    portfolioController.getPortfolioCategories
);


// ====================================
// ADMIN
// ====================================

router.get(
    "/admin",
    adminAuth,
    portfolioController.getAdminPortfolio
);

router.post(
    "/admin",
    adminAuth,
    portfolioController.createPortfolioItem
);

router.patch(
    "/admin/:id",
    adminAuth,
    portfolioController.updatePortfolioItem
);

router.post(
    "/admin/upload",
    adminAuth,
    uploadImage.single("image"),
    portfolioController.uploadPortfolioImage
);

module.exports = router;