
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { aboutApi } from "../../services/api";
import "./Navbar.css";

function Navbar() {
    const [open, setOpen] = useState(false);
    const [brandLogo, setBrandLogo] = useState("");

    const close = () => setOpen(false);

    useEffect(() => {
        const loadBrandLogo = async () => {
            try {
                const response = await aboutApi.getPublic();

                setBrandLogo(
                    response.data?.about?.brand_logo_url || ""
                );
            } catch (error) {
                console.error("Unable to load brand logo:", error);
            }
        };

        loadBrandLogo();
    }, []);

    return (
        <header className="glass-navbar">
            <div className="navbar-inner">
                <Link
                    to="/"
                    className="brand"
                    onClick={close}
                >
                    <img
                        src={brandLogo || "/rupanjali-logo.jpg"}
                        alt="Rupanjali's Makeup Artistry"
                        className="brand-logo"
                    />
                </Link>

                <button
                    className="mobile-menu-button"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle navigation menu"
                >
                    ☰
                </button>

                <nav
                    className={`nav-menu ${
                        open ? "nav-open" : ""
                    }`}
                >
                    <NavLink to="/" onClick={close}>
                        Home
                    </NavLink>

                    <NavLink to="/profile" onClick={close}>
                        About
                    </NavLink>

                    <NavLink to="/portfolio" onClick={close}>
                        Portfolio
                    </NavLink>

                    <NavLink to="/services" onClick={close}>
                        Services
                    </NavLink>

                    <NavLink to="/stories" onClick={close}>
                        Stories
                    </NavLink>

                    <Link
                        to="/booking"
                        className="nav-book"
                        onClick={close}
                    >
                        Book Appointment →
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
