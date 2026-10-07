const adminBookingService =
    require("../services/adminBookingService");
const adminAvailabilityService =
    require("../services/adminAvailabilityService");

const getAdminDashboard = async (req, res) => {
    return res.json({
        success: true,
        message: "Admin authentication successful.",
        admin: {
            id: req.admin.id,
            name: req.admin.full_name,
            role: req.admin.role
        }
    });
};

const getAdminBookings = async (
    req,
    res
) => {
    try {
        const bookings =
            await adminBookingService.getBookings();

        return res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error(
            "Get admin bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load bookings."
        });
    }
};

const updateAdminBookingStatus = async (
    req,
    res
) => {
    try {
        const {
            id
        } = req.params;

        const {
            status
        } = req.body;

        const allowedStatuses = [
            "confirmed",
            "rejected",
            "cancelled",
            "completed"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid booking status."
            });
        }

        const booking =
            await adminBookingService
                .updateBookingStatus(
                    id,
                    status
                );

        return res.json({
            success: true,
            message:
                "Booking status updated successfully.",
            booking
        });

    } catch (error) {
        console.error(
            "Update booking status error:",
            error
        );

        if (error.statusCode) {
            return res.status(
                error.statusCode
            ).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to update booking status."
        });
    }
};

const createAdminManualBooking = async (
    req,
    res
) => {

    try {

        const {
            slot_id,
            service_id,
            customer_name,
            email,
            phone,
            event_type,
            location,
            message,
            status,
            payment_status
        } = req.body;


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !slot_id ||
            !customer_name?.trim() ||
            !phone?.trim() ||
            !event_type?.trim() ||
            !location?.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Slot, customer name, phone, event type and location are required."
            });

        }


        const allowedStatuses = [
            "pending",
            "confirmed"
        ];

        const bookingStatus =
            status || "confirmed";

        if (
            !allowedStatuses.includes(
                bookingStatus
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid booking status."
            });

        }


        const allowedPaymentStatuses = [
            "unpaid",
            "pending",
            "paid"
        ];

        const bookingPaymentStatus =
            payment_status || "unpaid";

        if (
            !allowedPaymentStatuses.includes(
                bookingPaymentStatus
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment status."
            });

        }


        // ==========================================
        // CREATE MANUAL BOOKING
        // ==========================================

        const booking =
            await adminBookingService
                .createManualBooking({

                    slotId:
                        slot_id,

                    serviceId:
                        service_id || null,

                    customerName:
                        customer_name,

                    email:
                        email || null,

                    phone,

                    eventType:
                        event_type,

                    location,

                    message:
                        message || null,

                    status:
                        bookingStatus,

                    paymentStatus:
                        bookingPaymentStatus

                });


        return res.status(201).json({

            success: true,

            message:
                "Manual booking created successfully.",

            booking

        });

    } catch (error) {

        console.error(
            "Create manual booking error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to create manual booking."

        });

    }
};

const blockAdminDate = async (
    req,
    res
) => {
    try {
        const {
            date,
            reason
        } = req.body;

        if (
            !date ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date."
            });
        }

        const blockedDate =
            await adminAvailabilityService
                .blockDate(
                    date,
                    reason?.trim() || null
                );

        return res.status(201).json({
            success: true,
            message:
                "Date blocked successfully.",
            blockedDate
        });

    } catch (error) {
        console.error(
            "Block date error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to block date."
        });
    }
};

const unblockAdminDate = async (
    req,
    res
) => {
    try {
        const {
            date
        } = req.params;

        if (
            !date ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date."
            });
        }

        const unblockedDate =
            await adminAvailabilityService
                .unblockDate(date);

        return res.json({
            success: true,
            message:
                "Date unblocked successfully.",
            unblockedDate
        });

    } catch (error) {
        console.error(
            "Unblock date error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to unblock date."
        });
    }
};

const getAdminBlockedDates = async (
    req,
    res
) => {
    try {
        const {
            start_date,
            end_date
        } = req.query;

        if (
            !start_date ||
            !end_date
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "start_date and end_date are required."
            });
        }

        const blockedDates =
            await adminAvailabilityService
                .getBlockedDates(
                    start_date,
                    end_date
                );

        return res.json({
            success: true,
            blockedDates
        });

    } catch (error) {
        console.error(
            "Get blocked dates error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load blocked dates."
        });
    }
};

const updateAdminSlotAvailability = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {
            is_available
        } = req.body;


        if (
            typeof is_available !==
            "boolean"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "is_available must be true or false."
            });

        }


        const slot =
            await adminAvailabilityService
                .updateSlotAvailability(
                    id,
                    is_available
                );


        return res.json({

            success: true,

            message:
                is_available
                    ? "Slot made available."
                    : "Slot blocked successfully.",

            slot

        });

    } catch (error) {

        console.error(
            "Update slot availability error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to update slot."

        });

    }
};

module.exports = {
    getAdminDashboard,
    getAdminBookings,
    updateAdminBookingStatus,
    createAdminManualBooking,
    blockAdminDate,
    unblockAdminDate,
    getAdminBlockedDates,
    updateAdminSlotAvailability
};