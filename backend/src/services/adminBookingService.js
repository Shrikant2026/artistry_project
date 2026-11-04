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

const getPaginatedBookings = async ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    service_id = "",
    start_date = "",
    end_date = "",
    sort = "event_asc"
}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
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
        `, {
            count: "exact"
        });

    // SEARCH
    const searchTerm = search.trim().replace(/[(),]/g, "");

    if (searchTerm) {
        const conditions = [
            `customer_name.ilike.%${searchTerm}%`,
            `email.ilike.%${searchTerm}%`,
            `phone.ilike.%${searchTerm}%`
        ];

        // UUID booking IDs can be searched exactly.
        const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                .test(searchTerm);

        if (isUUID) {
            conditions.push(`id.eq.${searchTerm}`);
        }

        query = query.or(conditions.join(","));
    }

    // STATUS FILTER
    if (status) {
        query = query.eq("status", status);
    }

    // SERVICE FILTER
    if (service_id) {
        query = query.eq("service_id", service_id);
    }

    // EVENT DATE FILTER
    if (start_date) {
        query = query.gte("event_date", start_date);
    }

    if (end_date) {
        query = query.lte("event_date", end_date);
    }

    // SORTING
    switch (sort) {
        case "event_desc":
            query = query
                .order("event_date", { ascending: false })
                .order("start_time", { ascending: false });
            break;

        case "created_desc":
            query = query
                .order("created_at", { ascending: false });
            break;

        case "created_asc":
            query = query
                .order("created_at", { ascending: true });
            break;

        case "event_asc":
        default:
            query = query
                .order("event_date", { ascending: true })
                .order("start_time", { ascending: true });
            break;
    }

    // STABLE SECONDARY ORDER
    query = query.order("id", { ascending: true });

    // PAGINATION
    const {
        data,
        error,
        count
    } = await query.range(from, to);

    if (error) {
        throw error;
    }

    const total = count || 0;

    return {
        bookings: data || [],
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    getBookings,
    getPaginatedBookings,
    updateBookingStatus,
    createManualBooking
};