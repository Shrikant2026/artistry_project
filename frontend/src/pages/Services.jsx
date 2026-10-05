import { Link } from "react-router-dom";

function Services() {

    const services = [
        {
            title: "Bridal Makeup",
            text: "Complete bridal beauty designed around your personality, outfit and ceremony.",
        },
        {
            title: "Reception Glam",
            text: "Elegant, sophisticated looks created for your reception and evening celebrations.",
        },
        {
            title: "Party Makeup",
            text: "Modern glam for birthdays, celebrations, events and nights to remember.",
        },
        {
            title: "Editorial",
            text: "Creative makeup for shoots, campaigns, fashion and editorial work.",
        },
    ];

    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    What I Create
                </span>

                <h1 className="page-title">
                    Beauty <em>Services</em>
                </h1>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(260px,1fr))",
                        gap: "20px",
                        marginTop: "50px",
                    }}
                >

                    {services.map((service) => (
                        <article
                            key={service.title}
                            className="glass-card"
                            style={{
                                padding: "35px",
                            }}
                        >
                            <span
                                style={{
                                    color:
                                        "var(--rose-600)",
                                    fontSize: "28px",
                                }}
                            >
                                ✦
                            </span>

                            <h2
                                style={{
                                    fontFamily:
                                        "'Cormorant Garamond',serif",
                                    fontSize: "32px",
                                    color:
                                        "var(--rose-950)",
                                }}
                            >
                                {service.title}
                            </h2>

                            <p className="page-description">
                                {service.text}
                            </p>
                        </article>
                    ))}

                </div>

                <div style={{ marginTop: "45px" }}>
                    <Link
                        to="/booking"
                        className="button button-primary"
                    >
                        Request Appointment →
                    </Link>
                </div>

            </div>

        </section>
    );
}

export default Services;