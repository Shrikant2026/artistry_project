
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import "./AdminBookings.css";

const AdminBookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
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
                    navigate("/admin/login", {
                        replace: true
                    });

                    return;
                }

                const session =
                    sessionData.session;

                const response = await fetch(
                    `https://artistry-project.onrender.com/api/admin/bookings`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${session.access_token}`
                        }
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Unable to load bookings."
                    );
                }

                setBookings(
                    result.bookings || []
                );

            } catch (error) {
                console.error(
                    "Load bookings error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load bookings."
                );

            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, [navigate]);

    const updateBookingStatus = async (
            bookingId,
            newStatus
        ) => {
            try {
                setError("");

                const {
                    data: sessionData,
                    error: sessionError
                } = await supabase.auth.getSession();

                if (
                    sessionError ||
                    !sessionData?.session
                ) {
                    navigate("/admin/login", {
                        replace: true
                    });

                    return;
                }

                const response = await fetch(
                    `https://artistry-project.onrender.com/api/admin/bookings/${bookingId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${sessionData.session.access_token}`
                        },
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Unable to update booking."
                    );
                }

                setBookings((currentBookings) =>
                    currentBookings.map((booking) =>
                        booking.id === bookingId
                            ? {
                                ...booking,
                                status:
                                    result.booking.status
                            }
                            : booking
                    )
                );

            } catch (error) {
                console.error(
                    "Update booking status error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to update booking."
                );
            }
        };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        return new Date(
            `1970-01-01T${time}`
        ).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    if (loading) {
        return (
            <main className="admin-bookings-page">
                <div className="admin-bookings-state">
                    Loading bookings...
                </div>
            </main>
        );
    }

    return (
        <main className="admin-bookings-page">

            <header className="admin-bookings-header">

                <div>
                    <p className="admin-bookings-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </p>

                    <h1>
                        Bookings
                    </h1>

                    <p>
                        Manage appointment requests
                        and upcoming events.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin")
                    }
                >
                    ← Dashboard
                </button>

            </header>

            {error && (
                <div className="admin-bookings-error">
                    {error}
                </div>
            )}

            {!error && bookings.length === 0 && (
                <div className="admin-bookings-empty">
                    No bookings found.
                </div>
            )}

            {bookings.length > 0 && (
                <div className="admin-bookings-table-wrapper">

                    <table className="admin-bookings-table">

                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {bookings.map(
                                (booking) => (
                                    <tr
                                        key={
                                            booking.id
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {
                                                    booking.customer_name
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    booking.phone
                                                }

                                                {booking.email && (
                                                    <>
                                                        <br />
                                                        {
                                                            booking.email
                                                        }
                                                    </>
                                                )}
                                            </small>
                                        </td>

                                        <td>
                                            {
                                                booking.services?.name ||
                                                booking.event_type ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {formatDate(
                                                booking.event_date
                                            )}
                                        </td>

                                        <td>
                                            {formatTime(
                                                booking.start_time
                                            )}

                                            {" – "}

                                            {formatTime(
                                                booking.end_time
                                            )}
                                        </td>

                                        <td>
                                            {
                                                booking.location
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`booking-status booking-status-${booking.status}`}
                                            >
                                                {
                                                    booking.status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`booking-payment booking-payment-${booking.payment_status}`}
                                            >
                                                {
                                                    booking.payment_status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            {booking.status === "pending" && (
                                                <div className="booking-actions">

                                                    <button
                                                        type="button"
                                                        className="booking-action-confirm"
                                                        onClick={() =>
                                                            updateBookingStatus(
                                                                booking.id,
                                                                "confirmed"
                                                            )
                                                        }
                                                    >
                                                        Confirm
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="booking-action-reject"
                                                        onClick={() =>
                                                            updateBookingStatus(
                                                                booking.id,
                                                                "rejected"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>

                                                </div>
                                            )}

                                            {booking.status === "confirmed" && (
                                                <div className="booking-actions">

                                                    <button
                                                        type="button"
                                                        className="booking-action-complete"
                                                        onClick={() =>
                                                            updateBookingStatus(
                                                                booking.id,
                                                                "completed"
                                                            )
                                                        }
                                                    >
                                                        Complete
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="booking-action-reject"
                                                        onClick={() =>
                                                            updateBookingStatus(
                                                                booking.id,
                                                                "cancelled"
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>
                                            )}

                                            {(
                                                booking.status === "rejected" ||
                                                booking.status === "cancelled" ||
                                                booking.status === "completed"
                                            ) && (
                                                <span className="booking-action-none">
                                                    No actions
                                                </span>
                                            )}
                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </main>
    );
};

export default AdminBookings;