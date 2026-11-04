const supabase = require("../config/supabase");

const getAboutPage = async () => {
    const { data, error } = await supabase
        .from("about_page")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) throw error;

    return data;
};

const updateAboutPage = async (updates) => {
    const { data, error } = await supabase
        .from("about_page")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1)
        .select()
        .single();

    if (error) throw error;

    return data;
};

module.exports = {
    getAboutPage,
    updateAboutPage
};