function Portfolio() {

    const looks = [
        "Bridal",
        "Reception",
        "Party Glam",
        "Editorial",
        "Traditional",
        "Soft Glam",
    ];

    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Selected Work
                </span>

                <h1 className="page-title">
                    The <em>Portfolio</em>
                </h1>

                <p className="page-description">
                    A collection of looks created for
                    different faces, celebrations and
                    unforgettable moments.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(240px,1fr))",
                        gap: "20px",
                        marginTop: "50px",
                    }}
                >
                    {looks.map((look, index) => (
                        <div
                            key={look}
                            className="glass-card"
                            style={{
                                height: "300px",
                                padding: "25px",
                                display: "flex",
                                alignItems: "flex-end",
                                background:
                                    `linear-gradient(
                                        145deg,
                                        rgba(255,255,255,.5),
                                        rgba(${index % 2 ? "220,113,141" : "249,221,213"},.55)
                                    )`,
                            }}
                        >
                            <h2
                                style={{
                                    fontFamily:
                                        "'Cormorant Garamond',serif",
                                    color:
                                        "var(--rose-950)",
                                }}
                            >
                                {look}
                            </h2>
                        </div>
                    ))}
                </div>

            </div>

        </section>
    );
}

export default Portfolio;