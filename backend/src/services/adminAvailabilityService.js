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

module.exports = {
    blockDate,
    unblockDate,
    getBlockedDates
};