const bookingService = require("../services/bookingService");

const createBooking = async (req, res) => {

    try {

        const {
            slot_id,
            customer_name,
            name,
            email,
            phone,
            event_type,
            event_date,
            start_time,
            end_time,
            location,
            message
        } = req.body;

        const finalName =
            customer_name || name;


        // ==========================================
        // REQUIRED FIELDS
        // ==========================================

        if (
            !finalName ||
            !phone ||
            !event_type ||
            !event_date ||
            !start_time ||
            !end_time ||
            !location
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, phone, event type, date, time and location are required."
            });
        }


        // ==========================================
        // NAME
        // ==========================================

        if (
            typeof finalName !== "string" ||
            finalName.trim().length < 2
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid name."
            });
        }


        // ==========================================
        // PHONE
        // ==========================================

        if (
            typeof phone !== "string" ||
            !/^[0-9+\-\s()]{7,20}$/.test(phone)
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number."
            });
        }


        // ==========================================
        // EMAIL
        // ==========================================

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }


        // ==========================================
        // DATE
        // ==========================================

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(event_date)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid event date."
            });
        }


        const selectedDate =
            new Date(`${event_date}T00:00:00`);

        const today =
            new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {

            return res.status(400).json({
                success: false,
                message:
                    "You cannot book a date in the past."
            });
        }


        // ==========================================
        // TIME
        // ==========================================

        const timeRegex =
            /^\d{2}:\d{2}$/;

        if (
            !timeRegex.test(start_time) ||
            !timeRegex.test(end_time)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid appointment time."
            });
        }


        if (start_time >= end_time) {

            return res.status(400).json({
                success: false,
                message:
                    "Start time must be before end time."
            });
        }


        // ==========================================
        // CREATE BOOKING
        // ==========================================

        const booking =
            await bookingService.createBooking({
                slot_id,
                customer_name: finalName.trim(),
                email: email?.trim() || null,
                phone: phone.trim(),
                event_type: event_type.trim(),
                event_date,
                start_time,
                end_time,
                location: location.trim(),
                message: message?.trim() || null
            });


        return res.status(201).json({
            success: true,
            message:
                "Booking request submitted successfully.",
            booking
        });

    } catch (error) {

        console.error(
            "Create booking error:",
            error
        );

        if (error.statusCode === 409) {

            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to create booking."
        });
    }
};

module.exports = {
    createBooking
};