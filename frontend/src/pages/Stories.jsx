import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { storiesApi } from "../services/api";


function Stories() {

    const [stories, setStories] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadStories = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await storiesApi.getAll();

                setStories(
                    response.stories || []
                );

            } catch (err) {

                console.error(
                    "Load stories error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load stories."
                );

            } finally {

                setLoading(false);

            }

        };

        loadStories();

    }, []);


    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Journal
                </span>

                <h1 className="page-title">
                    Beauty <em>Stories</em>
                </h1>


                {loading && (
                    <p style={{ marginTop: "50px" }}>
                        Loading stories...
                    </p>
                )}


                {error && (
                    <p style={{ marginTop: "50px" }}>
                        {error}
                    </p>
                )}


                {!loading &&
                    !error &&
                    stories.length === 0 && (
                        <p style={{ marginTop: "50px" }}>
                            No stories available yet.
                        </p>
                    )}


                {!loading &&
                    !error &&
                    stories.length > 0 && (

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
                                key={story.id}
                                to={`/stories/${story.slug}`}
                                className="glass-card"
                                style={{
                                    minHeight: "330px",
                                    padding: "30px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    textDecoration: "none",

                                    backgroundImage:
                                        story.cover_image_url
                                            ? `linear-gradient(
                                                to top,
                                                rgba(0, 0, 0, 0.75),
                                                rgba(0, 0, 0, 0.15)
                                            ), url(${story.cover_image_url})`
                                            : undefined,

                                    backgroundSize: "cover",
                                    backgroundPosition: "center",

                                    color: story.cover_image_url
                                        ? "#fff"
                                        : undefined,
                                }}
                            >

                                <div
                                    style={{
                                        color: story.cover_image_url
                                            ? "#fff"
                                            : undefined,
                                    }}
                                >

                                    <span className="eyebrow">
                                        {story.category ||
                                            "Story"}
                                    </span>

                                    <h2
                                        style={{
                                            fontFamily:
                                                "'Cormorant Garamond',serif",
                                            fontSize: "34px",
                                            color: story.cover_image_url
                                                ? "#fff"
                                                : undefined,
                                        }}
                                    >
                                        {story.title}
                                    </h2>

                                    {story.excerpt && (
                                        <p
                                            style={{
                                                color: story.cover_image_url
                                                    ? "rgba(255,255,255,.9)"
                                                    : undefined,
                                            }}
                                        >
                                            {story.excerpt}
                                        </p>
                                    )}

                                    <span>
                                        Read story →
                                    </span>

                                </div>

                            </Link>

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}

export default Stories;