const express = require("express");

const adminAuth = require("../middleware/adminAuth");

const {
    getAdminDashboard
} = require("../controllers/adminController");

const router = express.Router();

router.get(
    "/dashboard",
    adminAuth,
    getAdminDashboard
);

module.exports = router;