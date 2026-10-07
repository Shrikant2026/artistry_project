const multer = require("multer");


// ====================================
// MEMORY STORAGE
// ====================================

const storage = multer.memoryStorage();


// ====================================
// IMAGE FILTER
// ====================================

const fileFilter = (
    req,
    file,
    callback
) => {

    if (
        file.mimetype &&
        file.mimetype.startsWith("image/")
    ) {
        callback(null, true);
        return;
    }


    callback(
        new Error(
            "Only image files are allowed."
        ),
        false
    );
};


// ====================================
// UPLOAD CONFIG
// ====================================

const uploadImage = multer({
    storage,

    limits: {
        fileSize:
            5 * 1024 * 1024
    },

    fileFilter
});


module.exports = uploadImage;