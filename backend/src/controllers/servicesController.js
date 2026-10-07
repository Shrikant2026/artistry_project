const servicesService =
    require("../services/servicesService");


// ====================================
// PUBLIC
// ====================================

const getServices = async (req, res) => {
    try {
        const services =
            await servicesService.getServices();

        return res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        console.error(
            "Get services error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch services."
        });
    }
};


// ====================================
// ADMIN - GET ALL SERVICES
// ====================================

const getAdminServices = async (req, res) => {
    try {
        const services =
            await servicesService.getAdminServices();

        return res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        console.error(
            "Get admin services error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch admin services."
        });
    }
};


// ====================================
// ADMIN - CREATE SERVICE
// ====================================

const createService = async (req, res) => {
    try {
        const {
            name,
            slug,
            short_description,
            description,
            starting_price,
            duration_minutes,
            includes,
            image_url,
            display_order,
            is_published
        } = req.body;


        if (
            !name?.trim() ||
            !slug?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Service name and slug are required."
            });
        }


        if (
            includes !== undefined &&
            !Array.isArray(includes)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Includes must be an array."
            });
        }


        const service =
            await servicesService.createService({
                name,
                slug,
                shortDescription:
                    short_description,
                description,
                startingPrice:
                    starting_price,
                durationMinutes:
                    duration_minutes,
                includes,
                imageUrl:
                    image_url,
                displayOrder:
                    display_order,
                isPublished:
                    is_published
            });


        return res.status(201).json({
            success: true,
            message:
                "Service created successfully.",
            service
        });

    } catch (error) {
        console.error(
            "Create service error:",
            error
        );


        if (
            error.code === "23505"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A service with this slug already exists."
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to create service."
        });
    }
};


// ====================================
// ADMIN - UPDATE SERVICE
// ====================================

const updateService = async (req, res) => {
    try {
        const { id } = req.params;


        const {
            name,
            slug,
            short_description,
            description,
            starting_price,
            duration_minutes,
            includes,
            image_url,
            display_order,
            is_published
        } = req.body;


        if (
            !name?.trim() ||
            !slug?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Service name and slug are required."
            });
        }


        if (
            includes !== undefined &&
            !Array.isArray(includes)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Includes must be an array."
            });
        }


        const service =
            await servicesService.updateService(
                id,
                {
                    name,
                    slug,
                    shortDescription:
                        short_description,
                    description,
                    startingPrice:
                        starting_price,
                    durationMinutes:
                        duration_minutes,
                    includes,
                    imageUrl:
                        image_url,
                    displayOrder:
                        display_order,
                    isPublished:
                        is_published
                }
            );


        return res.status(200).json({
            success: true,
            message:
                "Service updated successfully.",
            service
        });

    } catch (error) {
        console.error(
            "Update service error:",
            error
        );


        if (
            error.code === "23505"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A service with this slug already exists."
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to update service."
        });
    }
};


module.exports = {
    getServices,
    getAdminServices,
    createService,
    updateService
};