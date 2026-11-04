import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aboutApi } from "../services/api";

function Profile() {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const response = await aboutApi.getPublic();
                setAbout(response.data.about);
            } catch (error) {
                console.error("Unable to load About page:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    if (loading) {
        return (
            <section className="section">
                <div className="page-container">
                    <p>Loading artist profile...</p>
                </div>
            </section>
        );
    }

    if (!about) {
        return (
            <section className="section">
                <div className="page-container">
                    <p>Artist profile is currently unavailable.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="page-container">
                <span className="eyebrow">The Artist</span>

                <h1 className="page-title">
                    {about.heading || "Meet Rupanjali"}
                </h1>

                <div className="glass-card" style={{
                    padding: "50px",
                    marginTop: "40px"
                }}>
                    {about.artist_image_url && (
                        <div style={{
                            maxWidth: "420px",
                            margin: "0 auto 35px"
                        }}>
                            <img
                                src={about.artist_image_url}
                                alt={about.artist_name}
                                style={{
                                    width: "100%",
                                    display: "block",
                                    borderRadius: "18px",
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    )}

                    <p className="eyebrow">
                        {about.professional_title}
                    </p>

                    <h2>{about.artist_name}</h2>

                    {about.introduction && (
                        <p className="page-description">
                            {about.introduction}
                        </p>
                    )}

                    {about.biography && (
                        <p className="page-description">
                            {about.biography}
                        </p>
                    )}

                    {about.philosophy && (
                        <p className="page-description">
                            {about.philosophy}
                        </p>
                    )}

                    {about.closing_message && (
                        <p className="page-description">
                            {about.closing_message}
                        </p>
                    )}

                    <Link to="/booking" className="button button-primary">
                        Book Your Date →
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default Profile;