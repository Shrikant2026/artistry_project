import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState(null);

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
                    "http://localhost:5500/api/admin/dashboard",
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


                <article>
                    <span>05</span>
                    <h2>Stories</h2>
                    <p>
                        Manage website stories and articles.
                    </p>
                </article>

            </section>

        </main>
    );
};

export default AdminDashboard;