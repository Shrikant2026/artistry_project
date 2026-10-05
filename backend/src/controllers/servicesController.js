const servicesService = require("../services/servicesService");

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

module.exports = {
    getServices
};