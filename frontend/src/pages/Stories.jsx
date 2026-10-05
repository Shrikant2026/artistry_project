import { Link } from "react-router-dom";

function Stories() {

    const stories = [
        {
            slug: "bridal-beauty",
            title: "A Bride's Beauty Journey",
        },
        {
            slug: "soft-glam",
            title: "The Art of Soft Glam",
        },
        {
            slug: "behind-the-scenes",
            title: "Behind the Brush",
        },
    ];

    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Journal
                </span>

                <h1 className="page-title">
                    Beauty <em>Stories</em>
                </h1>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(280px,1fr))",
                        gap: "20px",
                        marginTop: "50px",
                    }}
                >

                    {stories.map((story) => (
                        <Link
                            key={story.slug}
                            to={`/stories/${story.slug}`}
                            className="glass-card"
                            style={{
                                minHeight: "330px",
                                padding: "30px",
                                display: "flex",
                                alignItems: "flex-end",
                            }}
                        >
                            <div>
                                <span className="eyebrow">
                                    Story
                                </span>

                                <h2
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond',serif",
                                        fontSize: "34px",
                                    }}
                                >
                                    {story.title}
                                </h2>

                                <span>
                                    Read story →
                                </span>
                            </div>
                        </Link>
                    ))}

                </div>

            </div>

        </section>
    );
}

export default Stories;