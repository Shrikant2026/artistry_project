import { Link } from "react-router-dom";

function Profile() {
    return (
        <section className="section">
            <div className="page-container">

                <span className="eyebrow">
                    The Artist
                </span>

                <h1 className="page-title">
                    Meet <em>Rupanjali</em>
                </h1>

                <div
                    className="glass-card"
                    style={{
                        padding: "50px",
                        marginTop: "40px",
                    }}
                >
                    <p className="page-description">
                        Makeup is more than transformation.
                        It is about bringing forward the
                        confidence, personality and beauty
                        that already exists within you.
                    </p>

                    <p className="page-description">
                        Rupanjali’s Makeup Artistry creates
                        personalised beauty experiences for
                        brides, celebrations, editorial work
                        and special occasions.
                    </p>

                    <Link
                        to="/booking"
                        className="button button-primary"
                    >
                        Book Your Date →
                    </Link>
                </div>

            </div>
        </section>
    );
}

export default Profile;