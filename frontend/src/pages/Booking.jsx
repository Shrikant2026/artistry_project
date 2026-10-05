import { useEffect, useMemo, useState } from "react";
import { availabilityApi, servicesApi, bookingApi } from "../services/api";
import "./Booking.css";

const WEEK_DAYS = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN"
];

const pad = (value) =>
    String(value).padStart(2, "0");

const formatDate = (date) => {
    return `${date.getFullYear()}-${pad(
        date.getMonth() + 1
    )}-${pad(date.getDate())}`;
};

const getMonthLabel = (date) => {
    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
};

const getCalendarDays = (monthDate) => {

    const year =
        monthDate.getFullYear();

    const month =
        monthDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    // Convert Sunday=0 into Monday=0
    const mondayOffset =
        (firstDay.getDay() + 6) % 7;

    const days = [];

    for (
        let i = 0;
        i < mondayOffset;
        i++
    ) {
        days.push(null);
    }

    for (
        let day = 1;
        day <= lastDay.getDate();
        day++
    ) {

        days.push(
            new Date(
                year,
                month,
                day
            )
        );
    }

    return days;
};

const formatSlot = (slot) => {
    const start =
        slot.start_time.slice(0, 5);

    const end =
        slot.end_time.slice(0, 5);

    return `${start} — ${end}`;
};

function Booking() {

    const [currentMonth, setCurrentMonth] =
        useState(new Date());

    const [availability, setAvailability] =
        useState({});

    const [services, setServices] =
        useState([]);

    const [selectedDate, setSelectedDate] =
        useState(null);

    const [selectedSlot, setSelectedSlot] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [success, setSuccess] =
        useState(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        event_type: "",
        location: "",
        message: ""
    });

    // ==========================================
    // LOAD AVAILABILITY
    // ==========================================

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response =
                    await servicesApi.get();

                if (response.success) {
                    setServices(
                        response.services || []
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to load services:",
                    err
                );
            }
        };

        loadServices();
    }, []);

    // ==========================================
    // LOAD AVAILABILITY
    // ==========================================

    useEffect(() => {

        const loadAvailability =
            async () => {

                try {

                    setLoading(true);
                    setError("");

                    const year =
                        currentMonth.getFullYear();

                    const month =
                        currentMonth.getMonth();

                    const startDate =
                        formatDate(
                            new Date(
                                year,
                                month,
                                1
                            )
                        );

                    const endDate =
                        formatDate(
                            new Date(
                                year,
                                month + 1,
                                0
                            )
                        );

                    const response =
                        await availabilityApi.get(
                            startDate,
                            endDate
                        );

                    setAvailability(
                        response.dates || {}
                    );

                } catch (err) {

                    console.error(err);

                    setError(
                        "We couldn't load availability. Please try again."
                    );

                } finally {

                    setLoading(false);
                }
            };

        loadAvailability();

    }, [currentMonth]);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response =
                    await servicesApi.get();

                if (response.success) {
                    setServices(
                        response.services || []
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to load services:",
                    err
                );
            }
        };

        loadServices();
    }, []);

    // ==========================================
    // CALENDAR DAYS
    // ==========================================

    const calendarDays =
        useMemo(
            () =>
                getCalendarDays(
                    currentMonth
                ),
            [currentMonth]
        );


    // ==========================================
    // TODAY
    // ==========================================

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // ==========================================
    // SELECT DATE
    // ==========================================

    const handleDateSelect = (
        date,
        dateData
    ) => {

        if (!dateData) {
            return;
        }

        const dateKey =
            formatDate(date);

        const isPast =
            date < today;

        if (
            isPast ||
            dateData.blocked ||
            !dateData.available
        ) {
            return;
        }

        setSelectedDate(dateKey);
        setSuccess(null);

        const firstAvailableSlot =
            dateData.slots?.find(
                slot => slot.available
            );

        setSelectedSlot(
            firstAvailableSlot || null
        );
    };


    // ==========================================
    // SELECT SLOT
    // ==========================================

    const handleSlotSelect = (
        event,
        date,
        slot
    ) => {

        event.stopPropagation();

        if (!slot.available) {
            return;
        }

        const dateKey =
            formatDate(date);

        setSelectedDate(dateKey);
        setSelectedSlot(slot);
        setSuccess(null);
    };


    // ==========================================
    // FORM
    // ==========================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );
    };


    // ==========================================
    // SUBMIT BOOKING
    // ==========================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        if (
            !selectedDate ||
            !selectedSlot
        ) {
            return;
        }

        try {

            setSubmitting(true);
            setError("");
            setSuccess(null);

            const response =
                await bookingApi.create({
                    slot_id:
                        selectedSlot.id,

                    name:
                        form.name,

                    phone:
                        form.phone,

                    email:
                        form.email || null,

                    event_type:
                        form.event_type,

                    event_date:
                        selectedDate,

                    start_time:
                        selectedSlot.start_time,

                    end_time:
                        selectedSlot.end_time,

                    location:
                        form.location,

                    message:
                        form.message || null
                });

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to submit booking."
                );
            }

            setSuccess(
                response.booking
            );

            setSelectedSlot(null);

            setForm({
                name: "",
                phone: "",
                email: "",
                event_type: "",
                location: "",
                message: ""
            });

            // Refresh current month so the
            // newly booked slot immediately
            // becomes unavailable.

            const year =
                currentMonth.getFullYear();

            const month =
                currentMonth.getMonth();

            const startDate =
                formatDate(
                    new Date(
                        year,
                        month,
                        1
                    )
                );

            const endDate =
                formatDate(
                    new Date(
                        year,
                        month + 1,
                        0
                    )
                );

            const refreshed =
                await availabilityApi.get(
                    startDate,
                    endDate
                );

            setAvailability(
                refreshed.dates || {}
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "We couldn't submit your booking. Please try again."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // ==========================================
    // MONTH NAVIGATION
    // ==========================================

    const goPreviousMonth = () => {

        setCurrentMonth(
            previous =>
                new Date(
                    previous.getFullYear(),
                    previous.getMonth() - 1,
                    1
                )
        );
    };

    const goNextMonth = () => {

        setCurrentMonth(
            previous =>
                new Date(
                    previous.getFullYear(),
                    previous.getMonth() + 1,
                    1
                )
        );
    };


    // ==========================================
    // SELECTED DATE DATA
    // ==========================================

    const selectedDateData =
        selectedDate
            ? availability[selectedDate]
            : null;


    return (
        <main className="booking-page">

            {/* ==================================
                HERO
            ================================== */}

            <section className="booking-intro">

                <span className="booking-eyebrow">
                    APPOINTMENT
                </span>

                <h1>
                    Reserve Your Date
                </h1>

                <p>
                    Choose your preferred date and
                    time for your makeup appointment.
                    We'll take care of the rest.
                </p>

                <div className="booking-steps">

                    <div className="booking-step active">
                        <span>1</span>
                        <label>Date</label>
                    </div>

                    <i />

                    <div
                        className={
                            `booking-step ${
                                selectedSlot
                                    ? "active"
                                    : ""
                            }`
                        }
                    >
                        <span>2</span>
                        <label>Time</label>
                    </div>

                    <i />

                    <div
                        className={
                            `booking-step ${
                                selectedSlot
                                    ? "active"
                                    : ""
                            }`
                        }
                    >
                        <span>3</span>
                        <label>Details</label>
                    </div>

                </div>

            </section>


            {/* ==================================
                CALENDAR
            ================================== */}

            <section className="booking-calendar-shell">

                <div className="booking-calendar-header">

                    <div>
                        <span>
                            STEP 1
                        </span>

                        <h2>
                            Choose your date
                        </h2>
                    </div>

                    <div className="calendar-navigation">

                        <button
                            type="button"
                            onClick={
                                goPreviousMonth
                            }
                            aria-label="Previous month"
                        >
                            ←
                        </button>

                        <strong>
                            {getMonthLabel(
                                currentMonth
                            )}
                        </strong>

                        <button
                            type="button"
                            onClick={
                                goNextMonth
                            }
                            aria-label="Next month"
                        >
                            →
                        </button>

                    </div>

                </div>


                {error && (
                    <div className="booking-alert">
                        {error}
                    </div>
                )}


                {loading ? (

                    <div className="calendar-loading">
                        Loading availability…
                    </div>

                ) : (

                    <>

                        <div className="calendar-weekdays">

                            {WEEK_DAYS.map(day => (
                                <span key={day}>
                                    {day}
                                </span>
                            ))}

                        </div>


                        <div className="calendar-grid">

                            {calendarDays.map(
                                (date, index) => {

                                    if (!date) {

                                        return (
                                            <div
                                                key={
                                                    `empty-${index}`
                                                }
                                                className="calendar-empty"
                                            />
                                        );
                                    }

                                    const dateKey =
                                        formatDate(date);

                                    const dateData =
                                        availability[
                                            dateKey
                                        ];

                                    const isPast =
                                        date < today;

                                    const blocked =
                                        dateData?.blocked;

                                    const available =
                                        dateData?.available &&
                                        !isPast;

                                    const selected =
                                        selectedDate ===
                                        dateKey;

                                    const slots =
                                        dateData?.slots ||
                                        [];

                                    return (

                                        <article
                                            key={dateKey}
                                            className={[
                                                "calendar-date-card",

                                                available
                                                    ? "available"
                                                    : "unavailable",

                                                selected
                                                    ? "selected"
                                                    : "",

                                                blocked
                                                    ? "blocked"
                                                    : "",

                                                isPast
                                                    ? "past"
                                                    : ""
                                            ].join(" ")}
                                            onClick={() =>
                                                handleDateSelect(
                                                    date,
                                                    dateData
                                                )
                                            }
                                        >

                                            <div className="date-card-top">

                                                <strong>
                                                    {date.getDate()}
                                                </strong>

                                                <span>
                                                    {date.toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            weekday:
                                                                "short"
                                                        }
                                                    )}
                                                </span>

                                            </div>


                                            <div className="date-card-slots">

                                                {slots.length > 0 ? (

                                                    slots.map(
                                                        slot => (

                                                            <button
                                                                key={
                                                                    slot.id ||
                                                                    `${dateKey}-${slot.start_time}`
                                                                }
                                                                type="button"
                                                                disabled={
                                                                    !slot.available
                                                                }
                                                                className={[
                                                                    "mini-slot",

                                                                    slot.available
                                                                        ? "slot-open"
                                                                        : "",

                                                                    slot.booked
                                                                        ? "slot-booked"
                                                                        : "",

                                                                    selected &&
                                                                    selectedSlot?.id ===
                                                                        slot.id
                                                                        ? "slot-selected"
                                                                        : ""
                                                                ].join(" ")}
                                                                onClick={event =>
                                                                    handleSlotSelect(
                                                                        event,
                                                                        date,
                                                                        slot
                                                                    )
                                                                }
                                                            >

                                                                <span>
                                                                    {formatSlot(
                                                                        slot
                                                                    )}
                                                                </span>

                                                                <em>
                                                                    {
                                                                        slot.booked
                                                                            ? "Booked"
                                                                            : slot.available
                                                                                ? "Open"
                                                                                : "Unavailable"
                                                                    }
                                                                </em>

                                                            </button>

                                                        )
                                                    )

                                                ) : (

                                                    <span className="no-slots">
                                                        Unavailable
                                                    </span>

                                                )}

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    </>

                )}

            </section>


            {/* ==================================
                SELECTED SLOT / FORM
            ================================== */}

            {selectedDate &&
                selectedSlot && (

                    <section className="booking-details">

                        <div className="booking-details-heading">

                            <span>
                                STEP 2
                            </span>

                            <h2>
                                Your appointment
                            </h2>

                            <p>
                                {new Date(
                                    `${selectedDate}T00:00:00`
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        weekday:
                                            "long",
                                        day:
                                            "numeric",
                                        month:
                                            "long",
                                        year:
                                            "numeric"
                                    }
                                )}
                            </p>

                            <div className="selected-slot-display">

                                <span>
                                    Selected time
                                </span>

                                <strong>
                                    {formatSlot(
                                        selectedSlot
                                    )}
                                </strong>

                            </div>

                        </div>


                        <form
                            className="booking-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-step-label">
                                STEP 3 · YOUR DETAILS
                            </div>

                            <div className="form-grid">

                                <label>
                                    <span>
                                        Your name *
                                    </span>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Your full name"
                                        required
                                    />
                                </label>


                                <label>
                                    <span>
                                        Phone *
                                    </span>

                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="98765 43210"
                                        required
                                    />
                                </label>


                                <label>
                                    <span>
                                        Email
                                    </span>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="you@example.com"
                                    />
                                </label>


                                <label>
                                    <span>
                                        Event type *
                                    </span>

                                    <select
                                        name="event_type"
                                        value={form.event_type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select event
                                        </option>

                                        {services.map((service) => (
                                            <option
                                                key={service.id}
                                                value={service.name}
                                            >
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>


                                <label className="form-full">
                                    <span>
                                        Location *
                                    </span>

                                    <input
                                        name="location"
                                        value={
                                            form.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Event location"
                                        required
                                    />
                                </label>


                                <label className="form-full">
                                    <span>
                                        Message
                                    </span>

                                    <textarea
                                        name="message"
                                        value={
                                            form.message
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Tell us anything you'd like us to know..."
                                        rows="4"
                                    />

                                </label>

                            </div>


                            <button
                                type="submit"
                                className="booking-submit"
                                disabled={
                                    submitting
                                }
                            >

                                {submitting
                                    ? "Submitting…"
                                    : "Request This Appointment →"}

                            </button>

                        </form>

                    </section>
                )}


            {/* ==================================
                SUCCESS
            ================================== */}

            {success && (

                <section className="booking-success">

                    <span>
                        BOOKING REQUEST
                    </span>

                    <h2>
                        Your date is reserved
                        for review.
                    </h2>

                    <p>
                        We've received your booking
                        request. Rupanjali will review
                        the appointment and confirm it.
                    </p>

                    <div>

                        <strong>
                            {success.event_date}
                        </strong>

                        <span>
                            {success.start_time}
                            {" — "}
                            {success.end_time}
                        </span>

                    </div>

                </section>

            )}

        </main>
    );
}

export default Booking;