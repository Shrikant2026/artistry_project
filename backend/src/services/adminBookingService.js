const supabase = require("../config/supabase");

const getBookings = async () => {
    const {
        data,
        error
    } = await supabase
        .from("bookings")
        .select(`
            id,
            customer_name,
            email,
            phone,
            event_type,
            event_date,
            start_time,
            end_time,
            location,
            message,
            status,
            payment_status,
            payment_reference,
            created_at,
            updated_at,
            service_id,
            services (
                id,
                name,
                slug
            )
        `)
        .order("event_date", {
            ascending: true
        })
        .order("start_time", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
};

const ALLOWED_STATUS_TRANSITIONS = {
    pending: [
        "confirmed",
        "rejected",
        "cancelled"
    ],

    confirmed: [
        "cancelled",
        "completed"
    ],

    rejected: [],
    cancelled: [],
    completed: []
};

const updateBookingStatus = async (
    bookingId,
    newStatus
) => {
    const {
        data: booking,
        error: bookingError
    } = await supabase
        .from("bookings")
        .select(`
            id,
            status,
            slot_id
        `)
        .eq("id", bookingId)
        .maybeSingle();

    if (bookingError) {
        throw bookingError;
    }

    if (!booking) {
        const error = new Error(
            "Booking not found."
        );

        error.statusCode = 404;

        throw error;
    }

    const allowedTransitions =
        ALLOWED_STATUS_TRANSITIONS[
            booking.status
        ] || [];

    if (
        !allowedTransitions.includes(newStatus)
    ) {
        const error = new Error(
            `Cannot change booking from "${booking.status}" to "${newStatus}".`
        );

        error.statusCode = 409;

        throw error;
    }

    const {
        data: updatedBooking,
        error: updateError
    } = await supabase
        .from("bookings")
        .update({
            status: newStatus
        })
        .eq("id", bookingId)
        .eq("status", booking.status)
        .select(`
            id,
            customer_name,
            email,
            phone,
            event_type,
            event_date,
            start_time,
            end_time,
            location,
            message,
            status,
            payment_status,
            payment_reference,
            service_id,
            created_at,
            updated_at
        `)
        .single();

    if (updateError) {
        throw updateError;
    }

    return updatedBooking;
};

const createManualBooking = async ({
    slotId,
    serviceId,
    customerName,
    email,
    phone,
    eventType,
    location,
    message,
    status = "confirmed",
    paymentStatus = "unpaid"
}) => {

    // ==========================================
    // CHECK SLOT
    // ==========================================

    const {
        data: slot,
        error: slotError
    } = await supabase
        .from("availability_slots")
        .select(`
            id,
            slot_date,
            start_time,
            end_time,
            is_available
        `)
        .eq("id", slotId)
        .maybeSingle();

    if (slotError) {
        throw slotError;
    }

    if (!slot) {
        const error =
            new Error(
                "Availability slot not found."
            );

        error.statusCode = 404;

        throw error;
    }

    // ==========================================
    // CHECK SLOT AVAILABILITY
    // ==========================================

    if (!slot.is_available) {

        const error =
            new Error(
                "This slot is not available."
            );

        error.statusCode = 409;

        throw error;
    }

    // ==========================================
    // CHECK EXISTING ACTIVE BOOKING
    // ==========================================

    const {
        data: existingBooking,
        error: bookingCheckError
    } = await supabase
        .from("bookings")
        .select("id")
        .eq("slot_id", slotId)
        .in("status", [
            "pending",
            "confirmed"
        ])
        .maybeSingle();

    if (bookingCheckError) {
        throw bookingCheckError;
    }

    if (existingBooking) {

        const error =
            new Error(
                "This slot already has an active booking."
            );

        error.statusCode = 409;

        throw error;
    }

    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const {
        data: booking,
        error: insertError
    } = await supabase
        .from("bookings")
        .insert({
            slot_id: slot.id,
            service_id: serviceId || null,

            customer_name:
                customerName.trim(),

            email:
                email?.trim() || null,

            phone:
                phone.trim(),

            event_type:
                eventType.trim(),

            event_date:
                slot.slot_date,

            start_time:
                slot.start_time,

            end_time:
                slot.end_time,

            location:
                location.trim(),

            message:
                message?.trim() || null,

            status,
            payment_status: paymentStatus
        })
        .select(`
            id,
            slot_id,
            service_id,
            customer_name,
            email,
            phone,
            event_type,
            event_date,
            start_time,
            end_time,
            location,
            message,
            status,
            payment_status,
            created_at
        `)
        .single();

    if (insertError) {
        throw insertError;
    }

    return booking;
};

module.exports = {
    getBookings,
    updateBookingStatus,
    createManualBooking
};