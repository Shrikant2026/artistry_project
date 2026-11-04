import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";
import { APP_CONFIG } from "../config/app";
import { servicesApi } from "../services/api";

import "./AdminBookings.css";

const PAGE_SIZES = [10, 20, 50];

const STATUSES = [
    "pending",
    "confirmed",
    "rejected",
    "cancelled",
    "completed"
];

const AdminBookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    // Search and filters
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sort, setSort] = useState("event_asc");

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Load available services for the filter
    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await servicesApi.get();
                setServices(response.services || []);
            } catch (err) {
                console.error("Unable to load services:", err);
            }
        };

        loadServices();
    }, []);

    const getAdminToken = async () => {
        const {
            data: sessionData,
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session) {
            navigate("/admin/login", { replace: true });
            return null;
        }

        return sessionData.session.access_token;
    };

    // Load paginated bookings
    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data: { session },
                error: sessionError
            } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!session?.access_token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sort
            });

            if (search) params.set("search", search);
            if (status) params.set("status", status);
            if (serviceId) params.set("service_id", serviceId);
            if (startDate) params.set("start_date", startDate);
            if (endDate) params.set("end_date", endDate);

            const response = await fetch(
                `${APP_CONFIG.API_BASE_URL}/api/admin/bookings?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                }
            );

            const result = await response.json();

            console.log("BOOKINGS API RESPONSE:", result);

            if (!response.ok) {
                throw new Error(result.message || "Unable to load bookings.");
            }

            if (!Array.isArray(result.bookings)) {
                throw new Error("Invalid bookings response from backend.");
            }

            setBookings(result.bookings);

            setPagination(
                result.pagination || {
                    page,
                    limit,
                    total: result.bookings.length,
                    totalPages: 1
                }
            );

        } catch (err) {
            console.error("BOOKINGS LOADING ERROR:", err);
            setError(err.message || "Unable to load bookings.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [
        page,
        limit,
        search,
        status,
        serviceId,
        startDate,
        endDate,
        sort,
        navigate
    ]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    // Reset to page one whenever a filter changes
    const updateFilter = (setter, value) => {
        setter(value);
        setPage(1);
    };

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setServiceId("");
        setStartDate("");
        setEndDate("");
        setSort("event_asc");
        setPage(1);
    };

    const hasActiveFilters =
        Boolean(searchInput || status || serviceId ||
            startDate || endDate || sort !== "event_asc");

    // Update booking status
    const updateBookingStatus = async (bookingId, newStatus) => {
        const confirmed = window.confirm(
            `Are you sure you want to change this booking to ${newStatus}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(bookingId);
            setError("");

            const token = await getAdminToken();

            if (!token) return;

            const response = await fetch(
                `${APP_CONFIG.API_BASE_URL}/api/admin/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update booking."
                );
            }

            // Refresh current page and its pagination data
            await loadBookings();
        } catch (err) {
            console.error("Update booking status error:", err);
            setError(err.message || "Unable to update booking.");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "-";

        return new Date(`1970-01-01T${time}`).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const totalPages = pagination.totalPages || 0;
    const firstRecord = pagination.total === 0
        ? 0
        : (page - 1) * limit + 1;

    const lastRecord = Math.min(
        page * limit,
        pagination.total
    );

    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);

        for (let number = start; number <= end; number++) {
            pages.push(number);
        }

        return pages;
    };

    return (
        <main className="admin-bookings-page">

            <header className="admin-bookings-header">
                <div>
                    <p className="admin-bookings-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </p>

                    <h1>Bookings</h1>

                    <p>
                        Manage appointment requests and upcoming events.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>
            </header>

            {error && (
                <div className="admin-bookings-error">
                    {error}
                </div>
            )}

            {/* SEARCH AND FILTERS */}
            <section className="booking-filter-panel">

                <div className="booking-search-wrapper">
                    <span className="booking-search-icon">⌕</span>

                    <input
                        type="search"
                        placeholder="Search by customer name, email, phone or booking ID..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />

                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput("");
                                setSearch("");
                                setPage(1);
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="booking-filter-grid">

                    <label>
                        <span>Booking status</span>
                        <select
                            value={status}
                            onChange={(event) =>
                                updateFilter(setStatus, event.target.value)
                            }
                        >
                            <option value="">All statuses</option>

                            {STATUSES.map(item => (
                                <option key={item} value={item}>
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Service</span>
                        <select
                            value={serviceId}
                            onChange={(event) =>
                                updateFilter(setServiceId, event.target.value)
                            }
                        >
                            <option value="">All services</option>

                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Event date from</span>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(event) =>
                                updateFilter(setStartDate, event.target.value)
                            }
                        />
                    </label>

                    <label>
                        <span>Event date to</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) =>
                                updateFilter(setEndDate, event.target.value)
                            }
                        />
                    </label>

                    <label>
                        <span>Sort bookings</span>
                        <select
                            value={sort}
                            onChange={(event) =>
                                updateFilter(setSort, event.target.value)
                            }
                        >
                            <option value="event_asc">Upcoming events first</option>
                            <option value="event_desc">Latest events first</option>
                            <option value="created_desc">Recently requested</option>
                            <option value="created_asc">Oldest requests</option>
                        </select>
                    </label>

                    <label>
                        <span>Rows per page</span>
                        <select
                            value={limit}
                            onChange={(event) => {
                                setLimit(Number(event.target.value));
                                setPage(1);
                            }}
                        >
                            {PAGE_SIZES.map(size => (
                                <option key={size} value={size}>
                                    {size} per page
                                </option>
                            ))}
                        </select>
                    </label>

                </div>

                <div className="booking-filter-footer">
                    <span>
                        {pagination.total} booking
                        {pagination.total === 1 ? "" : "s"} found
                    </span>

                    <button
                        type="button"
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                    >
                        Reset filters ↺
                    </button>
                </div>
            </section>

            {/* BOOKINGS TABLE */}
            <section className="admin-bookings-results">

                <div className="booking-results-heading">
                    <div>
                        <span className="admin-bookings-eyebrow">
                            APPOINTMENT RECORDS
                        </span>
                        <h2>All Bookings</h2>
                    </div>

                    <span className="booking-result-count">
                        {loading ? "Loading..." : `${pagination.total} records`}
                    </span>
                </div>

                {loading ? (
                    <div className="admin-bookings-state">
                        Loading bookings...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="admin-bookings-empty">
                        <h3>No bookings found</h3>
                        <p>
                            Try changing your search or filters.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="admin-bookings-table-wrapper">

                            <table className="admin-bookings-table">

                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Event date</th>
                                        <th>Time</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>

                                            <td data-label="Customer">
                                                <div>
                                                    <strong>{booking.customer_name}</strong>
                                                    <small>{booking.phone}</small>
                                                    {booking.email && (
                                                        <small>{booking.email}</small>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                {booking.services?.name ||
                                                    booking.event_type || "-"}
                                            </td>

                                            <td>
                                                {formatDate(booking.event_date)}
                                            </td>

                                            <td>
                                                {formatTime(booking.start_time)}
                                                {" – "}
                                                {formatTime(booking.end_time)}
                                            </td>

                                            <td>{booking.location}</td>

                                            <td>
                                                <span
                                                    className={`booking-status booking-status-${booking.status}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`booking-payment booking-payment-${booking.payment_status}`}
                                                >
                                                    {booking.payment_status || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                {updatingId === booking.id ? (
                                                    <span className="booking-action-none">
                                                        Updating...
                                                    </span>
                                                ) : booking.status === "pending" ? (
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
                                                ) : booking.status === "confirmed" ? (
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
                                                ) : (
                                                    <span className="booking-action-none">
                                                        No actions
                                                    </span>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>

                        {/* PAGINATION */}
                        <div className="booking-pagination">

                            <div className="booking-pagination-info">
                                Showing <strong>{firstRecord}–{lastRecord}</strong>
                                {" "}of <strong>{pagination.total}</strong> bookings
                            </div>

                            <div className="booking-pagination-controls">

                                <button
                                    type="button"
                                    disabled={page <= 1 || loading}
                                    onClick={() => setPage(previous => previous - 1)}
                                >
                                    ← Previous
                                </button>

                                {getPageNumbers().map(number => (
                                    <button
                                        type="button"
                                        key={number}
                                        className={
                                            page === number ? "active" : ""
                                        }
                                        disabled={loading}
                                        onClick={() => setPage(number)}
                                    >
                                        {number}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={
                                        page >= totalPages || loading
                                    }
                                    onClick={() => setPage(previous => previous + 1)}
                                >
                                    Next →
                                </button>

                            </div>

                        </div>
                    </>
                )}

            </section>

        </main>
    );
};

export default AdminBookings;