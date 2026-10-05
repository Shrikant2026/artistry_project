import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

import "./Navbar.css";

function Navbar() {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    return (
        <header className="glass-navbar">
            <div className="navbar-inner">

                <Link
                    to="/"
                    className="brand"
                    onClick={close}
                >
                    <span>Rupanjali’s</span>
                    <small>MAKEUP ARTISTRY</small>
                </Link>

                <button
                    className="mobile-menu-button"
                    onClick={() => setOpen(!open)}
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