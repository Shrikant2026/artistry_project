const express = require("express");

const adminAuth = require("../middleware/adminAuth");

const {
    getAdminDashboard,
    getAdminBookings,
    updateAdminBookingStatus,
    createAdminManualBooking,
    blockAdminDate,
    unblockAdminDate,
    getAdminBlockedDates,
    updateAdminSlotAvailability
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

router.post(
    "/bookings/manual",
    adminAuth,
    createAdminManualBooking
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

router.patch(
    "/availability/slots/:id",
    adminAuth,
    updateAdminSlotAvailability
);

module.exports = router;