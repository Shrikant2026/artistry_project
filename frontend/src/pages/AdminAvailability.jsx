import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";
import "./AdminAvailability.css";

const getMonthRange = (year, month) => {
    const startDate = new Date(
        year,
        month,
        1
    );

    const endDate = new Date(
        year,
        month + 1,
        0
    );

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};

const AdminAvailability = () => {
    const navigate = useNavigate();

    const today = new Date();

    const [
        currentMonth,
        setCurrentMonth
    ] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );

    const [
        blockedDates,
        setBlockedDates
    ] = useState({});

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        actionDate,
        setActionDate
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");

    const monthLabel =
        currentMonth.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

    const daysInMonth = useMemo(() => {
        const year =
            currentMonth.getFullYear();

        const month =
            currentMonth.getMonth();

        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();

        const mondayOffset =
            firstDay === 0
                ? 6
                : firstDay - 1;

        const totalDays =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

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
            day <= totalDays;
            day++
        ) {
            days.push(day);
        }

        return days;
    }, [currentMonth]);

    const formatDate = (day) => {
        const year =
            currentMonth.getFullYear();

        const month = String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0");

        const date = String(day)
            .padStart(2, "0");

        return `${year}-${month}-${date}`;
    };

    const loadBlockedDates = async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data: sessionData,
                error: sessionError
            } = await supabase.auth.getSession();

            if (
                sessionError ||
                !sessionData?.session
            ) {
                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

                return;
            }

            const {
                startDate,
                endDate
            } = getMonthRange(
                currentMonth.getFullYear(),
                currentMonth.getMonth()
            );

            const response =
                await fetch(
                    `http://localhost:5500/api/admin/availability/blocked?start_date=${startDate}&end_date=${endDate}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${sessionData.session.access_token}`
                        }
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to load availability."
                );
            }

            const blockedMap = {};

            (
                result.blockedDates || []
            ).forEach((item) => {
                blockedMap[
                    item.blocked_date
                ] = item;
            });

            setBlockedDates(
                blockedMap
            );

        } catch (error) {
            console.error(
                "Load blocked dates error:",
                error
            );

            setError(
                error.message ||
                "Unable to load availability."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockedDates();
    }, [currentMonth]);

    const changeMonth = (offset) => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() +
                    offset,
                1
            )
        );
    };

    const toggleDate = async (date) => {
        try {
            setActionDate(date);
            setError("");
            setSuccess("");

            const {
                data: sessionData,
                error: sessionError
            } = await supabase.auth.getSession();

            if (
                sessionError ||
                !sessionData?.session
            ) {
                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

                return;
            }

            const token =
                sessionData.session
                    .access_token;

            const isBlocked =
                Boolean(
                    blockedDates[date]
                );

            const response =
                await fetch(
                    isBlocked
                        ? `http://localhost:5500/api/admin/availability/block/${date}`
                        : "http://localhost:5500/api/admin/availability/block",
                    {
                        method:
                            isBlocked
                                ? "DELETE"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        ...(isBlocked
                            ? {}
                            : {
                                body:
                                    JSON.stringify({
                                        date,
                                        reason:
                                            "Blocked by admin"
                                    })
                            })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to update date."
                );
            }

            if (isBlocked) {
                setBlockedDates(
                    (current) => {
                        const updated = {
                            ...current
                        };

                        delete updated[date];

                        return updated;
                    }
                );

                setSuccess(
                    `${date} is available again.`
                );
            } else {
                setBlockedDates(
                    (current) => ({
                        ...current,
                        [date]: {
                            blocked_date: date,
                            reason:
                                "Blocked by admin"
                        }
                    })
                );

                setSuccess(
                    `${date} has been blocked.`
                );
            }

        } catch (error) {
            console.error(
                "Toggle availability error:",
                error
            );

            setError(
                error.message ||
                "Unable to update date."
            );

        } finally {
            setActionDate(null);
        }
    };

    return (
        <main className="admin-availability-page">

            <header className="admin-availability-header">

                <div>
                    <p className="admin-availability-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </p>

                    <h1>
                        Availability
                    </h1>

                    <p>
                        Manage which dates are
                        available for bookings.
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

            </header>

            {error && (
                <div className="admin-availability-message error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-availability-message success">
                    {success}
                </div>
            )}

            <section className="admin-calendar-card">

                <div className="admin-calendar-top">

                    <button
                        type="button"
                        onClick={() =>
                            changeMonth(-1)
                        }
                    >
                        ←
                    </button>

                    <h2>
                        {monthLabel}
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            changeMonth(1)
                        }
                    >
                        →
                    </button>

                </div>

                <div className="admin-calendar-weekdays">
                    {[
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ].map((day) => (
                        <div key={day}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="admin-calendar-grid">

                    {daysInMonth.map(
                        (day, index) => {

                            if (!day) {
                                return (
                                    <div
                                        key={
                                            `empty-${index}`
                                        }
                                        className="admin-calendar-empty"
                                    />
                                );
                            }

                            const date =
                                formatDate(day);

                            const isBlocked =
                                Boolean(
                                    blockedDates[
                                        date
                                    ]
                                );

                            const isAction =
                                actionDate ===
                                date;

                            return (
                                <button
                                    key={date}
                                    type="button"
                                    className={`admin-calendar-day ${
                                        isBlocked
                                            ? "blocked"
                                            : "available"
                                    }`}
                                    disabled={
                                        isAction ||
                                        loading
                                    }
                                    onClick={() =>
                                        toggleDate(
                                            date
                                        )
                                    }
                                >
                                    <span className="admin-calendar-day-number">
                                        {day}
                                    </span>

                                    <span className="admin-calendar-day-status">
                                        {isAction
                                            ? "Updating..."
                                            : isBlocked
                                                ? "Blocked"
                                                : "Available"}
                                    </span>

                                    {isBlocked &&
                                        blockedDates[
                                            date
                                        ]?.reason && (
                                            <span className="admin-calendar-day-reason">
                                                {
                                                    blockedDates[
                                                        date
                                                    ].reason
                                                }
                                            </span>
                                        )}
                                </button>
                            );
                        }
                    )}

                </div>

                <div className="admin-calendar-legend">

                    <span>
                        <i className="legend-dot available-dot" />
                        Available
                    </span>

                    <span>
                        <i className="legend-dot blocked-dot" />
                        Blocked
                    </span>

                </div>

            </section>

        </main>
    );
};

export default AdminAvailability;