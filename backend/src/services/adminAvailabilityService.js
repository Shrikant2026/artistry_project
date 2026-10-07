const supabase = require("../config/supabase");

const blockDate = async (date, reason = null) => {
    const {
        data,
        error
    } = await supabase
        .from("blocked_dates")
        .insert({
            blocked_date: date,
            reason
        })
        .select(`
            blocked_date,
            reason,
            created_at
        `)
        .single();

    if (error) {
        if (error.code === "23505") {
            const duplicateError =
                new Error(
                    "This date is already blocked."
                );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }

        throw error;
    }

    return data;
};

const unblockDate = async (date) => {
    const {
        data,
        error
    } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("blocked_date", date)
        .select(`
            blocked_date
        `)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        const notFoundError =
            new Error(
                "This date is not blocked."
            );

        notFoundError.statusCode = 404;

        throw notFoundError;
    }

    return data;
};

const getBlockedDates = async (
    startDate,
    endDate
) => {
    const {
        data,
        error
    } = await supabase
        .from("blocked_dates")
        .select(`
            blocked_date,
            reason,
            created_at
        `)
        .gte("blocked_date", startDate)
        .lte("blocked_date", endDate)
        .order("blocked_date", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
};

const updateSlotAvailability = async (
    slotId,
    isAvailable
) => {

    const {
        data: slot,
        error: findError
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

    if (findError) {
        throw findError;
    }

    if (!slot) {

        const error =
            new Error(
                "Availability slot not found."
            );

        error.statusCode = 404;

        throw error;
    }


    // Don't allow manually disabling
    // a slot that already has an active booking.
    if (!isAvailable) {

        const {
            data: activeBooking,
            error: bookingError
        } = await supabase
            .from("bookings")
            .select("id")
            .eq("slot_id", slotId)
            .in("status", [
                "pending",
                "confirmed"
            ])
            .maybeSingle();

        if (bookingError) {
            throw bookingError;
        }

        if (activeBooking) {

            const error =
                new Error(
                    "This slot has an active booking and cannot be blocked."
                );

            error.statusCode = 409;

            throw error;
        }
    }


    const {
        data: updatedSlot,
        error: updateError
    } = await supabase
        .from("availability_slots")
        .update({
            is_available: isAvailable
        })
        .eq("id", slotId)
        .select(`
            id,
            slot_date,
            start_time,
            end_time,
            is_available
        `)
        .single();

    if (updateError) {
        throw updateError;
    }

    return updatedSlot;
};

module.exports = {
    blockDate,
    unblockDate,
    getBlockedDates,
    updateSlotAvailability
};