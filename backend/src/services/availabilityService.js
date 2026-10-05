const supabase = require("../config/supabase");

const ACTIVE_BOOKING_STATUSES = [
    "pending",
    "confirmed"
];

const DEFAULT_TIME_SLOTS = [
    {
        start_time: "09:00",
        end_time: "11:00"
    },
    {
        start_time: "12:00",
        end_time: "14:00"
    },
    {
        start_time: "15:00",
        end_time: "18:00"
    }
];

const getDatesBetween = (startDate, endDate) => {
    const dates = [];

    const current = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (current <= end) {
        dates.push(
            current.toISOString().slice(0, 10)
        );

        current.setDate(current.getDate() + 1);
    }

    return dates;
};

const getAvailability = async (startDate, endDate) => {

    // ==========================================
    // 1. ALL DATES IN REQUESTED RANGE
    // ==========================================

    const calendarDates = getDatesBetween(
        startDate,
        endDate
    );


    // ==========================================
    // 2. GET ADMIN BLOCKED DATES
    // ==========================================

    const {
        data: blockedDates,
        error: blockedError
    } = await supabase
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


    // ==========================================
    // 3. GET EXISTING SLOTS
    // ==========================================

    const {
        data: existingSlots,
        error: existingSlotsError
    } = await supabase
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
        .order("slot_date", {
            ascending: true
        })
        .order("start_time", {
            ascending: true
        });

    if (existingSlotsError) {
        throw existingSlotsError;
    }


    // ==========================================
    // 4. CREATE MISSING DEFAULT SLOTS
    //
    // IMPORTANT:
    // We only INSERT missing slots.
    //
    // We do NOT update existing slots because
    // an admin may have manually disabled one.
    // ==========================================

    const existingSlotKeys = new Set(
        (existingSlots || []).map(slot =>
            `${slot.slot_date}|${slot.start_time}|${slot.end_time}`
        )
    );

    const slotsToCreate = [];

    for (const date of calendarDates) {

        // Blocked dates don't need public slots.
        if (blockedSet.has(date)) {
            continue;
        }

        for (const defaultSlot of DEFAULT_TIME_SLOTS) {

            const key =
                `${date}|${defaultSlot.start_time}|${defaultSlot.end_time}`;

            if (!existingSlotKeys.has(key)) {
                slotsToCreate.push({
                    slot_date: date,
                    start_time: defaultSlot.start_time,
                    end_time: defaultSlot.end_time,
                    is_available: true
                });
            }
        }
    }


    // ==========================================
    // 5. INSERT MISSING SLOTS
    // ==========================================

    if (slotsToCreate.length > 0) {

        const {
            error: insertError
        } = await supabase
            .from("availability_slots")
            .insert(slotsToCreate);

        // Another request may have created the same
        // slot at the same time. Our unique index
        // protects against duplicates.
        //
        // If that happens, we'll simply fetch the
        // slots again below.
        if (
            insertError &&
            insertError.code !== "23505"
        ) {
            throw insertError;
        }
    }


    // ==========================================
    // 6. FETCH SLOTS AGAIN
    // ==========================================

    const {
        data: slots,
        error: slotsError
    } = await supabase
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
        .order("slot_date", {
            ascending: true
        })
        .order("start_time", {
            ascending: true
        });

    if (slotsError) {
        throw slotsError;
    }


    // ==========================================
    // 7. GET ACTIVE BOOKINGS
    // ==========================================

    const slotIds = (slots || []).map(
        slot => slot.id
    );

    let bookings = [];

    if (slotIds.length > 0) {

        const {
            data: bookingData,
            error: bookingsError
        } = await supabase
            .from("bookings")
            .select(`
                id,
                slot_id,
                status
            `)
            .in("slot_id", slotIds)
            .in(
                "status",
                ACTIVE_BOOKING_STATUSES
            );

        if (bookingsError) {
            throw bookingsError;
        }

        bookings = bookingData || [];
    }


    // ==========================================
    // 8. BOOKED SLOT IDS
    // ==========================================

    const bookedSlotIds = new Set(
        bookings.map(
            booking => booking.slot_id
        )
    );


    // ==========================================
    // 9. BUILD PUBLIC CALENDAR
    // ==========================================

    const dates = {};

    for (const date of calendarDates) {

        const blocked =
            blockedSet.has(date);

        dates[date] = {
            available: !blocked,
            blocked,
            slots: []
        };
    }


    // ==========================================
    // 10. ADD SLOT STATUS
    // ==========================================

    for (const slot of slots || []) {

        const date = slot.slot_date;

        if (!dates[date]) {
            continue;
        }

        const booked =
            bookedSlotIds.has(slot.id);

        const available =
            !dates[date].blocked &&
            slot.is_available &&
            !booked;

        dates[date].slots.push({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            available,
            booked
        });
    }


    // ==========================================
    // 11. DATE AVAILABILITY
    // ==========================================

    for (const date of calendarDates) {

        if (dates[date].blocked) {

            dates[date].available = false;

            continue;
        }

        dates[date].available =
            dates[date].slots.some(
                slot => slot.available
            );
    }


    return {
        dates
    };
};

module.exports = {
    getAvailability
};