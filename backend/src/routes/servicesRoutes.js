const express = require("express");

const servicesController =
    require("../controllers/servicesController");

const adminAuth =
    require("../middleware/adminAuth");

const router = express.Router();


// ====================================
// PUBLIC
// ====================================

router.get(
    "/",
    servicesController.getServices
);


// ====================================
// ADMIN
// ====================================

router.get(
    "/admin",
    adminAuth,
    servicesController.getAdminServices
);

router.post(
    "/admin",
    adminAuth,
    servicesController.createService
);

router.patch(
    "/admin/:id",
    adminAuth,
    servicesController.updateService
);


module.exports = router;