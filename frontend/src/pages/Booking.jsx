import { useState } from "react";

import "./Booking.css";

function Booking() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const [date, setDate] = useState(today);

    const [submitted, setSubmitted] =
        useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        setSubmitted(true);
    };

    return (
        <section className="section booking-page">

            <div className="page-container">

                <div className="booking-heading">

                    <span className="eyebrow">
                        Your Moment
                    </span>

                    <h1 className="page-title">
                        Book Your <em>Date</em>
                    </h1>

                    <p className="page-description">
                        Tell us about your occasion and
                        preferred date. We’ll review your
                        request and get back to you.
                    </p>

                </div>

                <div className="booking-layout">

                    <div className="glass-card booking-calendar">

                        <div className="calendar-large">

                            <span>
                                YOUR DATE
                            </span>

                            <strong>
                                {new Date(date)
                                    .getDate()}
                            </strong>

                            <small>
                                {new Date(date)
                                    .toLocaleString(
                                        "en-IN",
                                        {
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}
                            </small>

                        </div>

                        <p>
                            Choose the date for your
                            makeup appointment.
                        </p>

                        <input
                            type="date"
                            min={today}
                            value={date}
                            onChange={(e) =>
                                setDate(e.target.value)
                            }
                        />

                    </div>

                    <form
                        className="glass-card booking-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">

                            <label>
                                Full Name
                                <input
                                    required
                                    type="text"
                                    placeholder="Your name"
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    required
                                    type="tel"
                                    placeholder="+91"
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label>
                                Event Type
                                <select required>
                                    <option value="">
                                        Select
                                    </option>

                                    <option>
                                        Bridal
                                    </option>

                                    <option>
                                        Reception
                                    </option>

                                    <option>
                                        Party
                                    </option>

                                    <option>
                                        Editorial
                                    </option>

                                    <option>
                                        Other
                                    </option>
                                </select>
                            </label>

                            <label className="full">
                                Location
                                <input
                                    type="text"
                                    placeholder="Event location"
                                />
                            </label>

                            <label className="full">
                                Message
                                <textarea
                                    rows="5"
                                    placeholder="Tell us about your event..."
                                />
                            </label>

                        </div>

                        <button
                            type="submit"
                            className="button button-primary"
                        >
                            Request Appointment →
                        </button>

                        {submitted && (
                            <div className="booking-success">
                                ✦ Your appointment request
                                has been received.
                            </div>
                        )}

                    </form>

                </div>

            </div>

        </section>
    );
}

export default Booking;