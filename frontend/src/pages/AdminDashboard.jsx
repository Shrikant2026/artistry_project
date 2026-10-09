import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState(null);
    const [stats, setStats] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
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

                setUser(session.user);

                const response = await fetch(
                    `https://artistry-project.onrender.com/api/admin/dashboard`,
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
                        "Admin authorization failed."
                    );
                }

                setAdminData(result.admin);
                setStats(result.stats);
                setUpcomingBookings(
                    result.upcomingBookings || []
                );

                setLoading(false);

            } catch (error) {
                console.error(
                    "Admin dashboard authentication error:",
                    error
                );

                await supabase.auth.signOut();

                navigate("/admin/login", {
                    replace: true
                });
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();

        navigate("/admin/login", {
            replace: true
        });
    };

    if (loading) {
        return (
            <main className="admin-dashboard-loading">
                Loading admin dashboard...
            </main>
        );
    }

    return (
        <main className="admin-dashboard">

            <header className="admin-dashboard-header">

                <div>
                    <p className="admin-dashboard-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </p>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Welcome back
                        {adminData?.name
                            ? `, ${adminData.name}`
                            : "."}
                    </p>

                    <p>
                        Role: {adminData?.role}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Sign Out
                </button>

            </header>

            <section className="admin-dashboard-stats">

                <article>
                    <span>Pending</span>
                    <strong>{stats?.pending ?? 0}</strong>
                    <p>Awaiting your response</p>
                </article>

                <article>
                    <span>Confirmed</span>
                    <strong>{stats?.confirmed ?? 0}</strong>
                    <p>Confirmed appointments</p>
                </article>

                <article>
                    <span>Upcoming</span>
                    <strong>{stats?.upcoming ?? 0}</strong>
                    <p>Future active bookings</p>
                </article>

                <article>
                    <span>Today</span>
                    <strong>{stats?.today ?? 0}</strong>
                    <p>Appointments today</p>
                </article>

            </section>

            <section className="admin-dashboard-grid">

                <article
                    onClick={() =>
                        navigate("/admin/bookings")
                    }
                >
                    <span>01</span>
                    <h2>Bookings</h2>
                    <p>
                        View and manage appointment requests.
                    </p>
                </article>


                <article
                    onClick={() =>
                        navigate("/admin/availability")
                    }
                >
                    <span>02</span>
                    <h2>Availability</h2>
                    <p>
                        Manage available dates and time slots.
                    </p>
                </article>


                <article
                    onClick={() =>
                        navigate("/admin/services")
                    }
                >
                    <span>03</span>
                    <h2>Services</h2>
                    <p>
                        Add and manage makeup services.
                    </p>
                </article>


                <article
                    onClick={() =>
                        navigate("/admin/portfolio")
                    }
                >
                    <span>04</span>
                    <h2>Portfolio</h2>
                    <p>
                        Manage gallery and portfolio images.
                    </p>
                </article>


                <article
                    onClick={() =>
                        navigate("/admin/stories")
                    }
                >
                    <span>05</span>
                    <h2>Stories</h2>
                    <p>
                        Manage website stories and articles.
                    </p>
                </article>

                <article
                    onClick={() =>
                        navigate("/admin/reviews")
                    }
                >
                    <span>06</span>
                    <h2>Reviews</h2>
                    <p>
                        Manage client testimonials and reviews.
                    </p>
                </article>

            </section>

            <section className="admin-dashboard-upcoming">

                <div className="admin-dashboard-section-header">
                    <div>
                        <p className="admin-dashboard-eyebrow">
                            Schedule
                        </p>

                        <h2>Upcoming Appointments</h2>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/bookings")
                        }
                    >
                        View All
                    </button>
                </div>

                {upcomingBookings.length === 0 ? (
                    <div className="admin-dashboard-empty">
                        <p>No upcoming appointments.</p>
                    </div>
                ) : (
                    <div className="admin-dashboard-bookings">

                        {upcomingBookings.map((booking) => (
                            <article
                                key={booking.id}
                                className="admin-dashboard-booking"
                            >
                                <div className="admin-dashboard-booking-date">
                                    <strong>
                                        {booking.event_date}
                                    </strong>

                                    <span>
                                        {booking.start_time}
                                    </span>
                                </div>

                                <div className="admin-dashboard-booking-info">
                                    <h3>
                                        {booking.customer_name}
                                    </h3>

                                    <p>
                                        {booking.service?.name ||
                                            booking.event_type}
                                    </p>

                                    <span>
                                        {booking.location}
                                    </span>
                                </div>

                                <div
                                    className={`admin-dashboard-booking-status ${booking.status}`}
                                >
                                    {booking.status}
                                </div>
                            </article>
                        ))}

                    </div>
                )}

            </section>

        </main>
    );
};

export default AdminDashboard;