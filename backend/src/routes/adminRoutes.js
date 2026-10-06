const express = require("express");

const adminAuth = require("../middleware/adminAuth");

const {
    getAdminDashboard,
    getAdminBookings,
    updateAdminBookingStatus,
    blockAdminDate,
    unblockAdminDate,
    getAdminBlockedDates
} = require("../controllers/adminController");



const router = express.Router();

router.get(
    "/dashboard",
    adminAuth,
    getAdminDashboard
);

router.get(
    "/bookings",
    adminAuth,
    getAdminBookings
);

router.patch(
    "/bookings/:id/status",
    adminAuth,
    updateAdminBookingStatus
);

router.get(
    "/availability/blocked",
    adminAuth,
    getAdminBlockedDates
);

router.post(
    "/availability/block",
    adminAuth,
    blockAdminDate
);

router.delete(
    "/availability/block/:date",
    adminAuth,
    unblockAdminDate
);
module.exports = router;