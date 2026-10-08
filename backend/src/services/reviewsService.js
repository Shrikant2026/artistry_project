const supabase = require("../config/supabase");

const getPublishedReviews = async () => {
    const {
        data,
        error
    } = await supabase
        .from("reviews")
        .select(`
            id,
            customer_name,
            rating,
            review_text,
            customer_image_url,
            display_order,
            created_at
        `)
        .eq("is_published", true)
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


const getAdminReviews = async () => {
    const {
        data,
        error
    } = await supabase
        .from("reviews")
        .select(`
            id,
            customer_name,
            rating,
            review_text,
            customer_image_url,
            is_published,
            display_order,
            created_at,
            updated_at
        `)
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


const createReview = async ({
    customerName,
    rating,
    reviewText,
    customerImageUrl,
    displayOrder = 0,
    isPublished = false
}) => {

    const {
        data,
        error
    } = await supabase
        .from("reviews")
        .insert({
            customer_name: customerName,
            rating,
            review_text: reviewText,
            customer_image_url:
                customerImageUrl || null,
            display_order: displayOrder,
            is_published: isPublished
        })
        .select(`
            id,
            customer_name,
            rating,
            review_text,
            customer_image_url,
            is_published,
            display_order,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};


const updateReview = async (
    reviewId,
    {
        customerName,
        rating,
        reviewText,
        customerImageUrl,
        displayOrder,
        isPublished
    }
) => {

    const updates = {};

    if (customerName !== undefined) {
        updates.customer_name = customerName;
    }

    if (rating !== undefined) {
        updates.rating = rating;
    }

    if (reviewText !== undefined) {
        updates.review_text = reviewText;
    }

    if (customerImageUrl !== undefined) {
        updates.customer_image_url =
            customerImageUrl || null;
    }

    if (displayOrder !== undefined) {
        updates.display_order = displayOrder;
    }

    if (isPublished !== undefined) {
        updates.is_published = isPublished;
    }

    const {
        data,
        error
    } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", reviewId)
        .select(`
            id,
            customer_name,
            rating,
            review_text,
            customer_image_url,
            is_published,
            display_order,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};


const deleteReview = async (reviewId) => {

    const {
        error
    } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

    if (error) {
        throw error;
    }

    return true;
};


module.exports = {
    getPublishedReviews,
    getAdminReviews,
    createReview,
    updateReview,
    deleteReview
};