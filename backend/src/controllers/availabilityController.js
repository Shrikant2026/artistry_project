const availabilityService =
    require("../services/availabilityService");

const isValidDate = (value) => {

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00`);

    return !Number.isNaN(date.getTime());
};

const getAvailability = async (req, res, next) => {

    try {

        const {
            start_date: startDate,
            end_date: endDate
        } = req.query;

        if (!startDate || !endDate) {

            return res.status(400).json({
                success: false,
                message:
                    "start_date and end_date are required"
            });
        }

        if (
            !isValidDate(startDate) ||
            !isValidDate(endDate)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Dates must use YYYY-MM-DD format"
            });
        }

        if (startDate > endDate) {

            return res.status(400).json({
                success: false,
                message:
                    "start_date cannot be after end_date"
            });
        }

        const result =
            await availabilityService.getAvailability(
                startDate,
                endDate
            );

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {

        next(error);
    }
};

module.exports = {
    getAvailability
};