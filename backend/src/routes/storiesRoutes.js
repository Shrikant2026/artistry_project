const express = require("express");

const storiesController =
    require("../controllers/storiesController");

const adminAuth =
    require("../middleware/adminAuth");

const uploadImage =
    require("../middleware/uploadImage");

const router = express.Router();


// ====================================
// PUBLIC STORIES
// ====================================

router.get(
    "/",
    storiesController.getStories
);

router.get(
    "/slug/:slug",
    storiesController.getStoryBySlug
);


// ====================================
// ADMIN STORIES
// ====================================

router.post(
    "/admin/upload",
    adminAuth,
    uploadImage.single("image"),
    storiesController.uploadStoryCoverImage
);

router.get(
    "/admin",
    adminAuth,
    storiesController.getAdminStories
);

router.post(
    "/admin",
    adminAuth,
    storiesController.createStory
);

router.patch(
    "/admin/:id",
    adminAuth,
    storiesController.updateStory
);

router.delete(
    "/admin/:id",
    adminAuth,
    storiesController.deleteStory
);


module.exports = router;