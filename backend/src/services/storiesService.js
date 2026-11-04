
const supabase = require("../config/supabase");

const storyFields = `
    id,
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    cover_storage_path,
    category,
    author_name,
    status,
    display_order,
    published_at,
    created_at,
    updated_at
`;


// Validate display order before saving.
const prepareStoryData = (storyData) => {
    const preparedData = {
        ...storyData
    };

    if (
        Object.prototype.hasOwnProperty.call(
            preparedData,
            "display_order"
        )
    ) {
        const displayOrder = Number(
            preparedData.display_order
        );

        if (
            !Number.isSafeInteger(displayOrder) ||
            displayOrder < 0
        ) {
            throw new Error(
                "Display order must be a non-negative whole number."
            );
        }

        preparedData.display_order = displayOrder;
    }

    return preparedData;
};


// ====================================
// PUBLIC STORIES
// ====================================

const getStories = async () => {
    const { data, error } = await supabase
        .from("stories")
        .select(storyFields)
        .eq("status", "published")
        .order("display_order", {
            ascending: true
        })
        .order("published_at", {
            ascending: false,
            nullsFirst: false
        });

    if (error) {
        throw error;
    }

    return data || [];
};


// ====================================
// PUBLIC STORY BY SLUG
// ====================================

const getStoryBySlug = async (slug) => {
    const { data, error } = await supabase
        .from("stories")
        .select(storyFields)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) {
        throw error;
    }

    return data;
};


// ====================================
// ADMIN STORIES
// ====================================

const getAdminStories = async () => {
    const { data, error } = await supabase
        .from("stories")
        .select(storyFields)
        .order("display_order", {
            ascending: true
        })
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data || [];
};


// ====================================
// CREATE STORY
// ====================================

const createStory = async (storyData) => {
    const preparedData =
        prepareStoryData(storyData);

    const { data, error } = await supabase
        .from("stories")
        .insert(preparedData)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


// ====================================
// UPDATE STORY
// ====================================

const updateStory = async (
    id,
    storyData
) => {
    const preparedData =
        prepareStoryData(storyData);

    const { data, error } = await supabase
        .from("stories")
        .update(preparedData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


// ====================================
// DELETE STORY
// ====================================

const deleteStory = async (id) => {
    const { data, error } = await supabase
        .from("stories")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


module.exports = {
    getStories,
    getStoryBySlug,
    getAdminStories,
    createStory,
    updateStory,
    deleteStory
};
