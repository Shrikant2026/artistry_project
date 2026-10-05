const supabase = require("../config/supabase");

const getServices = async () => {
    const {
        data,
        error
    } = await supabase
        .from("services")
        .select(`
            id,
            name,
            slug,
            short_description,
            description,
            starting_price,
            duration_minutes,
            includes,
            image_url
        `)
        .eq("is_published", true)
        .order("display_order", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
};

module.exports = {
    getServices
};