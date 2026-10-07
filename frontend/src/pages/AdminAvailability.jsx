import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";
import { availabilityApi, adminAvailabilityApi, adminBookingApi, servicesApi } from "../services/api";
import "./AdminAvailability.css";


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

    // Monday = first day
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


function AdminAvailability() {

    const navigate = useNavigate();

    const [services, setServices] =
        useState( [] );

    const [currentMonth, setCurrentMonth] =
        useState(new Date());


    const [availability, setAvailability] =
        useState({});


    const [selectedDate, setSelectedDate] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");

    const [
        showManualBookingForm,
        setShowManualBookingForm
    ] = useState(false);

    const [manualBookingForm, setManualBookingForm] = useState({
        slot_id: "",
        service_id: "",
        customer_name: "",
        email: "",
        phone: "",
        location: "",
        message: "",
        status: "confirmed",
        payment_status: "unpaid"
    });

    const [manualBookingLoading, setManualBookingLoading] =
    useState(false);

    // ==========================================
    // LOAD AVAILABILITY
    // ==========================================

    useEffect(() => {

        const loadAvailability = async () => {

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

                console.error(
                    "Admin availability error:",
                    err
                );

                setError(
                    "Unable to load availability."
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

                setServices(
                    response.services || []
                );

            } catch (err) {

                console.error(
                    "Load services error:",
                    err
                );

                setError(
                    "Unable to load services."
                );

            }

        };

        loadServices();

    }, []);

    // ==========================================
    // CALENDAR
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

    const handleDateSelect = (date) => {

        const dateKey = formatDate(date);

        setSelectedDate(
            previous =>
                previous === dateKey
                    ? null
                    : dateKey
        );

        setShowManualBookingForm(false);
    };

    const handleManualBookingChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setManualBookingForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );
    };

    const handleManualBookingSubmit = async (
        event
    ) => {

        event.preventDefault();

        try {

            setError("");
            setManualBookingLoading(true);

            const token =
                await getAdminToken();

            const selectedService =
                services.find(
                    service =>
                        service.id ===
                        manualBookingForm.service_id
                );

            if (!selectedService) {

                throw new Error(
                    "Please select a service."
                );

            }

            await adminBookingApi.createManualBooking(
                token,
                {
                    ...manualBookingForm,

                    service_id:
                        selectedService.id,

                    event_type:
                        selectedService.name
                }
            );

            setManualBookingForm({
                slot_id: "",
                service_id: "",
                customer_name: "",
                email: "",
                phone: "",
                location: "",
                message: "",
                status: "confirmed",
                payment_status: "unpaid"
            });

            setShowManualBookingForm(false);

            // Refresh current calendar
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

            console.error(
                "Manual booking error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create manual booking."
            );

        } finally {

            setManualBookingLoading(false);

        }
    };

    const getAdminToken = async () => {

        const {
            data,
            error
        } = await supabase.auth.getSession();

        if (
            error ||
            !data?.session?.access_token
        ) {
            navigate(
                "/admin/login",
                {
                    replace: true
                }
            );

            throw new Error(
                "Admin session expired."
            );
        }

        return data.session.access_token;
    };


    const handleBlockDate = async () => {

        if (!selectedDate) {
            return;
        }

        try {

            setError("");

            const token =
                await getAdminToken();

            await adminAvailabilityApi.blockDate(
                token,
                selectedDate,
                "Blocked by admin"
            );

            setSelectedDate(null);

            // Reload calendar data
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

            console.error(
                "Block date error:",
                err
            );

            setError(
                err.message ||
                "Unable to block date."
            );
        }
    };


    const handleUnblockDate = async () => {

        if (!selectedDate) {
            return;
        }

        try {

            setError("");

            const token =
                await getAdminToken();

            await adminAvailabilityApi.unblockDate(
                token,
                selectedDate
            );

            setSelectedDate(null);

            // Reload calendar data
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

            console.error(
                "Unblock date error:",
                err
            );

            setError(
                err.message ||
                "Unable to make date available."
            );
        }
    };

    const handleSlotAvailability = async (
        slotId,
        isAvailable
    ) => {
        try {
            setError("");

            const token =
                await getAdminToken();

            await adminAvailabilityApi
                .updateSlotAvailability(
                    token,
                    slotId,
                    isAvailable
                );

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

            console.error(
                "Update slot availability error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update slot."
            );
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

        setSelectedDate(null);

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

        setSelectedDate(null);

    };


    // ==========================================
    // SELECTED DATE
    // ==========================================

    const selectedDateData =
        selectedDate
            ? availability[selectedDate]
            : null;


            
    return (

        <main className="admin-availability-page">

            {/* ==================================
                HEADER
            ================================== */}

            <section className="admin-availability-intro">

                <div>

                    <span className="admin-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </span>

                    <h1>
                        Availability
                    </h1>

                    <p>
                        Manage which dates and
                        appointment slots are available
                        for bookings.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-back-button"
                    onClick={() =>
                        navigate("/admin")
                    }
                >
                    ← Dashboard
                </button>

            </section>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="admin-availability-alert error">
                    {error}
                </div>

            )}


            {/* ==================================
                CALENDAR
            ================================== */}

            <section className="admin-calendar-shell">

                <div className="admin-calendar-header">

                    <button
                        type="button"
                        onClick={goPreviousMonth}
                        aria-label="Previous month"
                        className="admin-calendar-nav"
                    >
                        ←
                    </button>


                    <h2>
                        {getMonthLabel(
                            currentMonth
                        )}
                    </h2>


                    <button
                        type="button"
                        onClick={goNextMonth}
                        aria-label="Next month"
                        className="admin-calendar-nav"
                    >
                        →
                    </button>

                </div>


                {loading ? (

                    <div className="admin-calendar-loading">
                        Loading availability…
                    </div>

                ) : (

                    <>

                        {/* WEEK DAYS */}

                        <div className="admin-calendar-weekdays">

                            {WEEK_DAYS.map(day => (

                                <span key={day}>
                                    {day}
                                </span>

                            ))}

                        </div>


                        {/* DATE GRID */}

                        <div className="admin-calendar-grid">

                            {calendarDays.map(
                                (date, index) => {

                                    if (!date) {

                                        return (

                                            <div
                                                key={`empty-${index}`}
                                                className="admin-calendar-empty"
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


                                    const slots =
                                        dateData?.slots || [];


                                    const availableSlots =
                                        slots.filter(
                                            slot =>
                                                slot.available
                                        );


                                    const bookedSlots =
                                        slots.filter(
                                            slot =>
                                                slot.booked
                                        );


                                    const selected =
                                        selectedDate ===
                                        dateKey;


                                    const available =
                                        !isPast &&
                                        !blocked &&
                                        availableSlots.length > 0;


                                    return (

                                        <article
                                            key={dateKey}

                                            className={[
                                                "admin-date-card",

                                                available
                                                    ? "available"
                                                    : "unavailable",

                                                blocked
                                                    ? "blocked"
                                                    : "",

                                                isPast
                                                    ? "past"
                                                    : "",

                                                selected
                                                    ? "selected"
                                                    : ""
                                            ].join(" ")}

                                            onClick={() =>
                                                handleDateSelect(
                                                    date
                                                )
                                            }
                                        >

                                            {/* DATE */}

                                            <div className="admin-date-top">

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


                                            {/* DATE STATUS */}

                                            <div
                                                className={[
                                                    "admin-date-status",

                                                    blocked
                                                        ? "blocked"
                                                        : available
                                                            ? "available"
                                                            : "unavailable"
                                                ].join(" ")}
                                            >

                                                {isPast
                                                    ? "PAST"
                                                    : blocked
                                                        ? "BLOCKED"
                                                        : available
                                                            ? `${availableSlots.length} SLOT${availableSlots.length > 1 ? "S" : ""} AVAILABLE`
                                                            : "FULLY BOOKED"}

                                            </div>


                                            {/* SLOTS */}

                                            <div className="admin-date-slots">

                                                {slots.length > 0 ? (

                                                    slots.map(slot => (

                                                        <div
                                                            key={slot.id}
                                                            className={[
                                                                "admin-slot",
                                                                slot.available
                                                                    ? "slot-available"
                                                                    : slot.booked
                                                                        ? "slot-booked"
                                                                        : "slot-unavailable"
                                                            ].join(" ")}
                                                        >

                                                            <div className="admin-slot-info">

                                                                <span>
                                                                    {formatSlot(slot)}
                                                                </span>

                                                                <small>
                                                                    {slot.booked
                                                                        ? "BOOKED"
                                                                        : slot.available
                                                                            ? "AVAILABLE"
                                                                            : "UNAVAILABLE"}
                                                                </small>

                                                            </div>

                                                            {!slot.booked && (
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        slot.available
                                                                            ? "admin-slot-action block"
                                                                            : "admin-slot-action available"
                                                                    }
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();

                                                                        handleSlotAvailability(
                                                                            slot.id,
                                                                            !slot.available
                                                                        );
                                                                    }}
                                                                >
                                                                    {slot.available
                                                                        ? "Block Slot"
                                                                        : "Make Available"}
                                                                </button>
                                                            )}

                                                        </div>

                                                    ))

                                                ) : (

                                                    <div className="admin-no-slots">
                                                        No slots
                                                    </div>

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
                SELECTED DATE PANEL
            ================================== */}

            {selectedDate && (

                <section className="admin-selected-date-panel">

                    <div>

                        <span className="admin-eyebrow">
                            SELECTED DATE
                        </span>

                        <h2>
                            {new Date(
                                `${selectedDate}T00:00:00`
                            ).toLocaleDateString(
                                "en-IN",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </h2>

                    </div>


                    <div className="admin-selected-date-info">

                        {selectedDateData?.blocked ? (

                            <span className="selected-status blocked">
                                Entire date is blocked
                            </span>

                        ) : (

                            <span className="selected-status available">
                                Date is available
                            </span>

                        )}


                        <p>
                            Select an action below.
                            No changes have been made yet.
                        </p>

                    </div>


                    {/* ACTIONS WILL BE ADDED IN NEXT STEP */}

                    <div className="admin-date-actions">

                        {selectedDateData?.blocked ? (

                            <button
                                type="button"
                                onClick={handleUnblockDate}
                                className="admin-action-primary"
                            >
                                Make Date Available
                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={handleBlockDate}
                                className="admin-action-danger"
                            >
                                Block Entire Date
                            </button>

                        )}


                        <button
                            type="button"
                            className="admin-action-secondary"
                            onClick={() => {
                                setShowManualBookingForm(true);
                            }}
                        >
                            Add Manual Booking
                        </button>

                    </div>
                    {showManualBookingForm && (
                        <form
                            className="admin-manual-booking-form"
                            onSubmit={handleManualBookingSubmit}
                        >

                            <div className="admin-form-header">

                                <div>
                                    <span className="admin-section-eyebrow">
                                        MANUAL BOOKING
                                    </span>

                                    <h3>
                                        Add Booking
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowManualBookingForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                            </div>


                            <div className="admin-form-grid">

                                <div className="admin-form-field">

                                    <label>
                                        Slot
                                    </label>

                                    <select
                                        name="slot_id"
                                        value={manualBookingForm.slot_id}
                                        onChange={handleManualBookingChange}
                                        required
                                    >
                                        <option value="">
                                            Select a slot
                                        </option>

                                        {selectedDateData?.slots
                                            ?.filter(slot => slot.available)
                                            .map(slot => (
                                                <option
                                                    key={slot.id}
                                                    value={slot.id}
                                                >
                                                    {formatSlot(slot)}
                                                </option>
                                            ))
                                        }

                                    </select>

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Service
                                    </label>

                                    <select
                                        name="service_id"
                                        value={manualBookingForm.service_id}
                                        onChange={handleManualBookingChange}
                                        required
                                    >
                                        <option value="">
                                            Select service
                                        </option>

                                        {services.map(service => (
                                            <option
                                                key={service.id}
                                                value={service.id}
                                            >
                                                {service.name}
                                            </option>
                                        ))}

                                    </select>

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Customer Name
                                    </label>

                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={manualBookingForm.customer_name}
                                        onChange={handleManualBookingChange}
                                        required
                                    />

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={manualBookingForm.phone}
                                        onChange={handleManualBookingChange}
                                        required
                                    />

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={manualBookingForm.email}
                                        onChange={handleManualBookingChange}
                                    />

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={manualBookingForm.location}
                                        onChange={handleManualBookingChange}
                                        required
                                    />

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Booking Status
                                    </label>

                                    <select
                                        name="status"
                                        value={manualBookingForm.status}
                                        onChange={handleManualBookingChange}
                                    >
                                        <option value="confirmed">
                                            Confirmed
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>
                                    </select>

                                </div>


                                <div className="admin-form-field">

                                    <label>
                                        Payment Status
                                    </label>

                                    <select
                                        name="payment_status"
                                        value={
                                            manualBookingForm.payment_status
                                        }
                                        onChange={handleManualBookingChange}
                                    >
                                        <option value="unpaid">
                                            Unpaid
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="paid">
                                            Paid
                                        </option>
                                    </select>

                                </div>


                                <div className="admin-form-field admin-form-field-full">

                                    <label>
                                        Message
                                    </label>

                                    <textarea
                                        name="message"
                                        value={manualBookingForm.message}
                                        onChange={handleManualBookingChange}
                                        rows="4"
                                    />

                                </div>

                            </div>


                            <div className="admin-form-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowManualBookingForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={manualBookingLoading}
                                    className="admin-action-primary"
                                >
                                    {manualBookingLoading
                                        ? "Creating..."
                                        : "Create Booking"}
                                </button>

                            </div>

                        </form>
                    )}
                </section>

            )}

        </main>

    );

}


export default AdminAvailability;