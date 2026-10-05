import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
    return (
        <footer className="glass-footer">

            <div className="footer-glass">

                <div>
                    <div className="footer-logo">
                        Rupanjali’s
                    </div>

                    <p>
                        Makeup artistry crafted for
                        your most unforgettable moments.
                    </p>
                </div>

                <div>
                    <h4>Explore</h4>

                    <Link to="/profile">About</Link>
                    <Link to="/portfolio">Portfolio</Link>
                    <Link to="/services">Services</Link>
                    <Link to="/stories">Stories</Link>
                </div>

                <div>
                    <h4>Bookings</h4>

                    <Link to="/booking">
                        Book Your Date
                    </Link>

                    <span>
                        Kolkata · India
                    </span>

                    <span>
                        Available across India
                    </span>
                </div>

                <div>
                    <h4>Follow</h4>

                    <span>Instagram</span>
                    <span>WhatsApp</span>
                    <span>Facebook</span>
                </div>

            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()}
                {" "}RUPANJALI’S MAKEUP ARTISTRY
            </div>

        </footer>
    );
}

export default Footer;