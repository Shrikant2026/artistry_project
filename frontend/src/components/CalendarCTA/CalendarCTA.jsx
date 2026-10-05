import { Link } from "react-router-dom";

import "./CalendarCTA.css";

function CalendarCTA() {
    const today = new Date();

    const day = today.getDate();

    const month = today.toLocaleString("en-IN", {
        month: "short",
    });

    const year = today.getFullYear();

    return (
        <Link
            to="/booking"
            className="calendar-cta"
        >
            <div className="calendar-icon">

                <div className="calendar-top">
                    BOOKING
                </div>

                <div className="calendar-day">
                    {day}
                </div>

                <div className="calendar-month">
                    {month} {year}
                </div>

            </div>

            <div className="calendar-copy">
                <span>
                    YOUR DATE MATTERS
                </span>

                <strong>
                    Book Your Date Now
                </strong>

                <small>
                    Check availability →
                </small>
            </div>
        </Link>
    );
}

export default CalendarCTA;