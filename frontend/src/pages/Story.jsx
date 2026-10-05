import { Link, useParams } from "react-router-dom";

function Story() {

    const { slug } = useParams();

    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Beauty Journal
                </span>

                <h1 className="page-title">
                    {slug
                        ?.split("-")
                        .map(
                            word =>
                                word
                                    .charAt(0)
                                    .toUpperCase() +
                                word.slice(1)
                        )
                        .join(" ")
                    }
                </h1>

                <article
                    className="glass-card"
                    style={{
                        padding: "50px",
                        marginTop: "40px",
                        maxWidth: "850px",
                    }}
                >
                    <p className="page-description">
                        Every face tells a different story.
                        Every occasion deserves a look that
                        feels uniquely yours.
                    </p>

                    <p className="page-description">
                        This story will become part of
                        Rupanjali’s beauty journal as we
                        continue building the editorial
                        experience.
                    </p>

                    <Link
                        to="/stories"
                        className="button button-glass"
                    >
                        ← Back to Stories
                    </Link>
                </article>

            </div>

        </section>
    );
}

export default Story;