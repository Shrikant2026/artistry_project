const supabase = require("../config/supabase");

const getStories = async () => {
    const { data, error } = await supabase
        .from("stories")
        .select(`
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
            published_at,
            created_at,
            updated_at
        `)
        .eq("status", "published")
        .order("published_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data || [];
};


const getStoryBySlug = async (slug) => {
    const { data, error } = await supabase
        .from("stories")
        .select(`
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
            published_at,
            created_at,
            updated_at
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) {
        throw error;
    }

    return data;
};


const getAdminStories = async () => {
    const { data, error } = await supabase
        .from("stories")
        .select(`
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
            published_at,
            created_at,
            updated_at
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data || [];
};


const createStory = async (storyData) => {
    const { data, error } = await supabase
        .from("stories")
        .insert(storyData)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


const updateStory = async (
    id,
    storyData
) => {
    const { data, error } = await supabase
        .from("stories")
        .update(storyData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


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