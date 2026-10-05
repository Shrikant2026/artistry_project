const supabase = require("../config/supabase");

const ACTIVE_BOOKING_STATUSES = [
    "pending",
    "confirmed"
];

const createBooking = async ({
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
    message
}) => {

    const {
        data: service,
        error: serviceError
    } = await supabase
        .from("services")
        .select("id, name, is_published")
        .eq("id", service_id)
        .eq("is_published", true)
        .maybeSingle();

    if (serviceError) {
        throw serviceError;
    }

    if (!service) {
        const error = new Error(
            "The selected service is unavailable."
        );

        error.statusCode = 400;

        throw error;
    }

    // ==========================================
    // 1. RESOLVE SLOT
    // ==========================================

    let slotQuery = supabase
        .from("availability_slots")
        .select(`
            id,
            slot_date,
            start_time,
            end_time,
            is_available
        `);

    if (slot_id) {

        slotQuery = slotQuery.eq(
            "id",
            slot_id
        );

    } else {

        slotQuery = slotQuery
            .eq("slot_date", event_date)
            .eq("start_time", start_time)
            .eq("end_time", end_time);
    }

    const {
        data: slot,
        error: slotError
    } = await slotQuery.maybeSingle();

    if (slotError) {
        throw slotError;
    }


    // ==========================================
    // 2. SLOT MUST EXIST
    // ==========================================

    if (!slot) {

        const {
            data: newSlot,
            error: createSlotError
        } = await supabase
            .from("availability_slots")
            .insert({
                slot_date: event_date,
                start_time,
                end_time,
                is_available: true
            })
            .select(`
                id,
                slot_date,
                start_time,
                end_time,
                is_available
            `)
            .single();

        if (
            createSlotError &&
            createSlotError.code !== "23505"
        ) {
            throw createSlotError;
        }

        if (newSlot) {
            slotQuery = supabase
                .from("availability_slots")
                .select(`
                    id,
                    slot_date,
                    start_time,
                    end_time,
                    is_available
                `)
                .eq("slot_date", event_date)
                .eq("start_time", start_time)
                .eq("end_time", end_time);

            const {
                data: resolvedSlot,
                error: resolvedSlotError
            } = await slotQuery.maybeSingle();

            if (resolvedSlotError) {
                throw resolvedSlotError;
            }

            if (resolvedSlot) {
                return createBooking({
                    slot_id: resolvedSlot.id,
                    customer_name,
                    email,
                    phone,
                    event_type,
                    event_date,
                    start_time,
                    end_time,
                    location,
                    message
                });
            }
        }

        throw new Error(
            "Appointment slot could not be created."
        );
    }


    // ==========================================
    // 3. CHECK ADMIN BLOCKED DATE
    // ==========================================

    const {
        data: blockedDate,
        error: blockedError
    } = await supabase
        .from("blocked_dates")
        .select("blocked_date")
        .eq("blocked_date", event_date)
        .maybeSingle();

    if (blockedError) {
        throw blockedError;
    }

    if (blockedDate) {
        const error = new Error(
            "This date is blocked."
        );

        error.statusCode = 409;

        throw error;
    }


    // ==========================================
    // 4. CHECK SLOT AVAILABILITY
    // ==========================================

    if (!slot.is_available) {

        const error = new Error(
            "This appointment slot is unavailable."
        );

        error.statusCode = 409;

        throw error;
    }


    // ==========================================
    // 5. CHECK EXISTING BOOKING
    // ==========================================

    const {
        data: existingBooking,
        error: bookingCheckError
    } = await supabase
        .from("bookings")
        .select("id")
        .eq("slot_id", slot.id)
        .in(
            "status",
            ACTIVE_BOOKING_STATUSES
        )
        .maybeSingle();

    if (bookingCheckError) {
        throw bookingCheckError;
    }

    if (existingBooking) {

        const error = new Error(
            "This appointment slot is no longer available."
        );

        error.statusCode = 409;

        throw error;
    }


    // ==========================================
    // 6. CREATE BOOKING
    // ==========================================

    const {
        data: booking,
        error: createError
    } = await supabase
        .from("bookings")
        .insert({
            slot_id: slot.id,
            service_id: service.id,
            customer_name,
            email: email || null,
            phone,
            event_type,
            event_date,
            start_time,
            end_time,
            location,
            message: message || null,
            status: "pending",
            payment_status: "unpaid"
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

    if (createError) {

        // PostgreSQL unique constraint:
        // one active booking per slot.
        if (createError.code === "23505") {

            const error = new Error(
                "This appointment slot is no longer available."
            );

            error.statusCode = 409;

            throw error;
        }

        throw createError;
    }

    return booking;
};

module.exports = {
    createBooking
};