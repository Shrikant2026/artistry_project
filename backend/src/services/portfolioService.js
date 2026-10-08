const supabase = require("../config/supabase");


// ====================================
// PUBLIC - GET PORTFOLIO
// ====================================

const getPortfolio = async () => {

    const {
        data,
        error
    } = await supabase
        .from("portfolio_items")
        .select(`
            id,
            category_id,
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            display_order,
            is_featured,
            is_published,
            created_at,
            updated_at,
            portfolio_categories (
                id,
                name,
                slug
            )
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


// ====================================
// PUBLIC - GET CATEGORIES
// ====================================

const getPortfolioCategories = async () => {

    const {
        data,
        error
    } = await supabase
        .from("portfolio_categories")
        .select(`
            id,
            name,
            slug,
            display_order
        `)
        .order("display_order", {
            ascending: true
        });


    if (error) {
        throw error;
    }


    return data || [];
};


// ====================================
// ADMIN - GET ALL PORTFOLIO ITEMS
// ====================================

const getAdminPortfolio = async () => {

    const {
        data,
        error
    } = await supabase
        .from("portfolio_items")
        .select(`
            id,
            category_id,
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            display_order,
            is_featured,
            is_published,
            created_at,
            updated_at,
            portfolio_categories (
                id,
                name,
                slug
            )
        `)
        .order("display_order", {
            ascending: true
        });


    if (error) {
        throw error;
    }


    return data || [];
};


// ====================================
// ADMIN - CREATE PORTFOLIO ITEM
// ====================================

const createPortfolioItem = async ({
    title,
    description,
    imageUrl,
    storagePath,
    altText,
    categoryId,
    displayOrder,
    isFeatured,
    isPublished
}) => {

    const {
        data,
        error
    } = await supabase
        .from("portfolio_items")
        .insert({
            title: title.trim(),
            description:
                description?.trim() || null,
            image_url:
                imageUrl?.trim() || null,
            storage_path:
                storagePath?.trim() || null,
            alt_text:
                altText?.trim() || null,
            category_id:
                categoryId || null,
            display_order:
                displayOrder ?? 0,
            is_featured:
                isFeatured ?? false,
            is_published:
                isPublished ?? true
        })
        .select(`
            id,
            category_id,
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            display_order,
            is_featured,
            is_published,
            created_at,
            updated_at,
            portfolio_categories (
                id,
                name,
                slug
            )
        `)
        .single();


    if (error) {
        throw error;
    }


    return data;
};


// ====================================
// ADMIN - UPDATE PORTFOLIO ITEM
// ====================================

const updatePortfolioItem = async (
    id,
    {
        title,
        description,
        imageUrl,
        storagePath,
        altText,
        categoryId,
        displayOrder,
        isFeatured,
        isPublished
    }
) => {

    const {
        data,
        error
    } = await supabase
        .from("portfolio_items")
        .update({
            title: title.trim(),
            description:
                description?.trim() || null,
            image_url:
                imageUrl?.trim() || null,
            storage_path:
                storagePath?.trim() || null,
            alt_text:
                altText?.trim() || null,
            category_id:
                categoryId || null,
            display_order:
                displayOrder ?? 0,
            is_featured:
                isFeatured ?? false,
            is_published:
                isPublished ?? true
        })
        .eq("id", id)
        .select(`
            id,
            category_id,
            title,
            description,
            image_url,
            storage_path,
            alt_text,
            display_order,
            is_featured,
            is_published,
            created_at,
            updated_at,
            portfolio_categories (
                id,
                name,
                slug
            )
        `)
        .single();


    if (error) {
        throw error;
    }


    return data;
};

const deletePortfolioItem = async (id) => {

    // First get the portfolio item
    const {
        data: item,
        error: fetchError
    } = await supabase
        .from("portfolio_items")
        .select(`
            id,
            storage_path
        `)
        .eq("id", id)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    // Delete database record
    const {
        error: deleteError
    } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw deleteError;
    }

    return item;
};

module.exports = {
    getPortfolio,
    getPortfolioCategories,
    getAdminPortfolio,
    deletePortfolioItem,
    createPortfolioItem,
    updatePortfolioItem
};