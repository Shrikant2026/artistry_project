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
                        Makeup has always been more than just a transformation to me. It is an art of enhancing natural beauty, expressing individuality and bringing out the confidence that already exists within.
                    </p>

                    <p className="page-description">
                        Through Rupanjali’s Makeup Artistry, I aim to create beautiful, personalised makeup experiences. From timeless bridal looks to elegant makeup for celebrations and special occasions, my approach is rooted in artistry, attention to detail and an understanding of what makes every individual unique.
                    </p>

                    <p className="page-description">
                        Creating beauty that feels as unique as you are.
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