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

const getAdminServices = async () => {

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
            image_url,
            display_order,
            is_published,
            created_at,
            updated_at
        `)
        .order("display_order", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
};


const createService = async ({
    name,
    slug,
    shortDescription,
    description,
    startingPrice,
    durationMinutes,
    includes,
    imageUrl,
    displayOrder,
    isPublished
}) => {

    const {
        data,
        error
    } = await supabase
        .from("services")
        .insert({
            name: name.trim(),
            slug: slug.trim(),
            short_description:
                shortDescription?.trim() || null,
            description:
                description?.trim() || null,
            starting_price:
                startingPrice ?? null,
            duration_minutes:
                durationMinutes ?? null,
            includes:
                includes || [],
            image_url:
                imageUrl?.trim() || null,
            display_order:
                displayOrder ?? 0,
            is_published:
                isPublished ?? true
        })
        .select(`
            id,
            name,
            slug,
            short_description,
            description,
            starting_price,
            duration_minutes,
            includes,
            image_url,
            display_order,
            is_published,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};


const updateService = async (
    id,
    {
        name,
        slug,
        shortDescription,
        description,
        startingPrice,
        durationMinutes,
        includes,
        imageUrl,
        displayOrder,
        isPublished
    }
) => {

    const {
        data,
        error
    } = await supabase
        .from("services")
        .update({
            name: name.trim(),
            slug: slug.trim(),
            short_description:
                shortDescription?.trim() || null,
            description:
                description?.trim() || null,
            starting_price:
                startingPrice ?? null,
            duration_minutes:
                durationMinutes ?? null,
            includes:
                includes || [],
            image_url:
                imageUrl?.trim() || null,
            display_order:
                displayOrder ?? 0,
            is_published:
                isPublished ?? true
        })
        .eq("id", id)
        .select(`
            id,
            name,
            slug,
            short_description,
            description,
            starting_price,
            duration_minutes,
            includes,
            image_url,
            display_order,
            is_published,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    getServices,
    getAdminServices,
    createService,
    updateService
};