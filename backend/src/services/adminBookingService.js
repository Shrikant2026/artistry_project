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

module.exports = {
    getBookings,
    updateBookingStatus
};