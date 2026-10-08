import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { storiesApi } from "../services/api";


function Story() {

    const { slug } = useParams();

    const [story, setStory] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadStory = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await storiesApi.getBySlug(
                        slug
                    );

                setStory(
                    response.story
                );

            } catch (err) {

                console.error(
                    "Load story error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load story."
                );

            } finally {

                setLoading(false);

            }
        };


        if (slug) {
            loadStory();
        }

    }, [slug]);


    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Beauty Journal
                </span>


                {loading && (
                    <p style={{ marginTop: "40px" }}>
                        Loading story...
                    </p>
                )}


                {error && (
                    <>
                        <h1 className="page-title">
                            Story <em>Not Found</em>
                        </h1>

                        <p
                            className="page-description"
                            style={{
                                marginTop: "30px"
                            }}
                        >
                            {error}
                        </p>

                        <Link
                            to="/stories"
                            className="button button-glass"
                        >
                            ← Back to Stories
                        </Link>
                    </>
                )}


                {!loading &&
                    !error &&
                    story && (

                    <>
                        <h1 className="page-title">
                            {story.title}
                        </h1>


                        {story.category && (
                            <span
                                className="eyebrow"
                                style={{
                                    display: "block",
                                    marginTop: "15px"
                                }}
                            >
                                {story.category}
                            </span>
                        )}


                        {story.cover_image_url && (
                            <img
                                src={
                                    story.cover_image_url
                                }
                                alt={story.title}
                                style={{
                                    width: "100%",
                                    maxWidth: "1000px",
                                    maxHeight: "600px",
                                    objectFit: "cover",
                                    borderRadius: "16px",
                                    marginTop: "40px",
                                }}
                            />
                        )}


                        <article
                            className="glass-card"
                            style={{
                                padding: "50px",
                                marginTop: "40px",
                                maxWidth: "850px",
                            }}
                        >

                            {story.excerpt && (
                                <p
                                    className="page-description"
                                >
                                    {story.excerpt}
                                </p>
                            )}


                            {story.content && (
                                <div
                                    style={{
                                        marginTop: "30px",
                                        lineHeight: 1.8,
                                        whiteSpace:
                                            "pre-wrap",
                                    }}
                                >
                                    {story.content}
                                </div>
                            )}


                            {story.author_name && (
                                <p
                                    style={{
                                        marginTop: "35px",
                                        fontSize: "14px",
                                    }}
                                >
                                    By {story.author_name}
                                </p>
                            )}


                            <Link
                                to="/stories"
                                className="button button-glass"
                                style={{
                                    display:
                                        "inline-block",
                                    marginTop: "30px",
                                }}
                            >
                                ← Back to Stories
                            </Link>

                        </article>

                    </>
                )}

            </div>

        </section>
    );
}

export default Story;