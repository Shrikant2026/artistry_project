const express = require("express");
const router = express.Router();

const aboutController = require("../controllers/aboutController");
const adminAuth = require("../middleware/adminAuth");
const uploadImage = require("../middleware/uploadImage");

// Public About page
router.get("/", aboutController.getPublicAbout);

// Admin About page
router.get("/admin", adminAuth, aboutController.getAdminAbout);

router.patch("/admin", adminAuth, aboutController.updateAbout);

router.post(
    "/admin/upload",
    adminAuth,
    uploadImage.single("image"),
    aboutController.uploadAboutPhoto
);

module.exports = router;