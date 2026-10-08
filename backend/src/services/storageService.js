const supabase = require("../config/supabase");


// ====================================
// PORTFOLIO IMAGE UPLOAD
// ====================================

const uploadPortfolioImage = async (
    file,
    filePath
) => {

    if (!file) {
        const error =
            new Error("Image file is required.");

        error.statusCode = 400;

        throw error;
    }


    const {
        data,
        error
    } = await supabase.storage
        .from("portfolio-images")
        .upload(
            filePath,
            file.buffer,
            {
                contentType:
                    file.mimetype,

                upsert: false
            }
        );


    if (error) {
        throw error;
    }


    const {
        data: publicUrlData
    } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);


    return {
        path: data.path,
        publicUrl:
            publicUrlData.publicUrl
    };
};

const uploadStoryCoverImage = async (
    file,
    filePath
) => {

    if (!file) {
        const error =
            new Error(
                "Story cover image is required."
            );

        error.statusCode = 400;

        throw error;
    }


    const {
        data,
        error
    } = await supabase.storage
        .from("portfolio-images")
        .upload(
            filePath,
            file.buffer,
            {
                contentType:
                    file.mimetype,

                upsert: false
            }
        );


    if (error) {
        throw error;
    }


    const {
        data: publicUrlData
    } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(
            filePath
        );


    return {
        path: data.path,

        publicUrl:
            publicUrlData.publicUrl
    };
};

module.exports = {
    uploadPortfolioImage,
    uploadStoryCoverImage
};