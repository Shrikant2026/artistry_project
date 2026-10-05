const supabase = require("../config/supabase");

const ACTIVE_BOOKING_STATUSES = [
    "pending",
    "confirmed"
];

const getAvailability = async (startDate, endDate) => {

    const { data: blockedDates, error: blockedError } =
        await supabase
            .from("blocked_dates")
            .select("blocked_date")
            .gte("blocked_date", startDate)
            .lte("blocked_date", endDate);

    if (blockedError) {
        throw blockedError;
    }

    const blockedSet = new Set(
        (blockedDates || []).map(
            item => item.blocked_date
        )
    );

    const { data: slots, error: slotsError } =
        await supabase
            .from("availability_slots")
            .select(`
                id,
                slot_date,
                start_time,
                end_time,
                is_available,
                notes
            `)
            .gte("slot_date", startDate)
            .lte("slot_date", endDate)
            .order("slot_date", { ascending: true })
            .order("start_time", { ascending: true });

    if (slotsError) {
        throw slotsError;
    }

    const slotIds = (slots || []).map(
        slot => slot.id
    );

    let bookings = [];

    if (slotIds.length > 0) {

        const { data: bookingData, error: bookingsError } =
            await supabase
                .from("bookings")
                .select(`
                    id,
                    slot_id,
                    status
                `)
                .in("slot_id", slotIds)
                .in("status", ACTIVE_BOOKING_STATUSES);

        if (bookingsError) {
            throw bookingsError;
        }

        bookings = bookingData || [];
    }

    const bookedSlotIds = new Set(
        bookings.map(
            booking => booking.slot_id
        )
    );

    const dates = {};

    for (const slot of slots || []) {

        const date = slot.slot_date;

        if (!dates[date]) {
            dates[date] = {
                available: false,
                blocked: blockedSet.has(date),
                slots: []
            };
        }

        const isBooked =
            bookedSlotIds.has(slot.id);

        const isAvailable =
            !dates[date].blocked &&
            slot.is_available &&
            !isBooked;

        dates[date].slots.push({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            available: isAvailable
        });

        if (isAvailable) {
            dates[date].available = true;
        }
    }

    return {
        dates
    };
};

module.exports = {
    getAvailability
};