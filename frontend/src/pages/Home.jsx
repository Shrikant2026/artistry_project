import { Link } from "react-router-dom";

import CalendarCTA from "../components/CalendarCTA/CalendarCTA";
import Reviews from "../components/Reviews/Reviews";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            {/* HERO */}

            <section className="home-hero">

                <div className="hero-orb orb-one"></div>
                <div className="hero-orb orb-two"></div>

                <div className="page-container hero-grid">

                    <div className="hero-content">

                        <span className="eyebrow">
                            Beauty Beyond Trends
                        </span>

                        <h1>
                            Rupanjali’s
                            <em>
                                Makeup Artistry
                            </em>
                        </h1>

                        <h2>
                            Bridal · Party · Editorial ·
                            Special Occasions
                        </h2>

                        <p>
                            Enhancing your natural beauty
                            with elegance, grace and a
                            touch of artistry — for your
                            most special moments.
                        </p>

                        <div className="hero-actions">

                            <Link
                                to="/booking"
                                className="button button-primary"
                            >
                                Book Appointment →
                            </Link>

                            <Link
                                to="/portfolio"
                                className="button button-glass"
                            >
                                ◉ Watch My Work
                            </Link>

                        </div>

                        <CalendarCTA />

                    </div>

                    <div className="hero-visual">

                        <div className="portrait-glass">

                            <div className="portrait-placeholder">
                                <span>
                                    R
                                </span>
                            </div>

                            <div className="hero-stat-card">

                                <strong>
                                    500+
                                </strong>

                                <span>
                                    Happy Clients
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* SERVICES */}

            <section className="section">

                <div className="page-container">

                    <div className="home-section-heading">

                        <span className="eyebrow">
                            Signature Looks
                        </span>

                        <h2>
                            Beauty designed
                            <em> for you.</em>
                        </h2>

                    </div>

                    <div className="service-glass-grid">

                        {[
                            [
                                "✦",
                                "Bridal Makeup",
                                "Look radiant on your big day."
                            ],
                            [
                                "◈",
                                "Party Glam",
                                "Turn every celebration into a statement."
                            ],
                            [
                                "✧",
                                "Editorial Looks",
                                "Creative, modern and timeless."
                            ],
                            [
                                "♡",
                                "Special Occasions",
                                "Personalised looks for every celebration."
                            ],
                        ].map(
                            ([icon, title, description]) => (
                                <div
                                    className="service-glass-card"
                                    key={title}
                                >
                                    <span className="service-icon">
                                        {icon}
                                    </span>

                                    <h3>
                                        {title}
                                    </h3>

                                    <p>
                                        {description}
                                    </p>
                                </div>
                            )
                        )}

                    </div>

                </div>

            </section>

            {/* CTA */}

            <section className="home-booking-section">

                <div className="page-container">

                    <div className="booking-glass">

                        <div>

                            <span className="eyebrow">
                                Your Moment
                            </span>

                            <h2>
                                Your date.
                                <br />
                                Your beauty.
                                <br />
                                <em>Your story.</em>
                            </h2>

                        </div>

                        <CalendarCTA />

                    </div>

                </div>

            </section>

             {/* REVIEWS */}

            <Reviews />

        </div>
    );
}

export default Home;