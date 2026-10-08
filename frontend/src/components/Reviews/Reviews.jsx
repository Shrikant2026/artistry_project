import { useEffect, useState } from "react";

import { reviewsApi } from "../../services/api";

import "./Reviews.css";


const Reviews = () => {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadReviews = async () => {
            try {

                const response =
                    await reviewsApi.get();

                setReviews(
                    response.reviews || []
                );

            } catch (error) {

                console.error(
                    "Unable to load reviews:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadReviews();

    }, []);


    if (
        loading ||
        reviews.length === 0
    ) {
        return null;
    }


    return (
        <section className="reviews-section">

            <div className="reviews-container">

                <div className="reviews-heading">

                    <p className="reviews-eyebrow">
                        Kind Words
                    </p>

                    <h2>
                        What Our Clients Say
                    </h2>

                    <p>
                        A few words from the people
                        who trusted us with their
                        special moments.
                    </p>

                </div>


                <div className="reviews-grid">

                    {reviews.map((review) => (

                        <article
                            key={review.id}
                            className="review-card"
                        >

                            <div className="review-rating">
                                {"★".repeat(review.rating)}
                            </div>


                            <blockquote>
                                “{review.review_text}”
                            </blockquote>


                            <div className="review-author">

                                {review.customer_image_url ? (
                                    <img
                                        src={
                                            review.customer_image_url
                                        }
                                        alt={
                                            review.customer_name
                                        }
                                    />
                                ) : (
                                    <div className="review-avatar">
                                        {review.customer_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <strong>
                                        {review.customer_name}
                                    </strong>

                                    <span>
                                        Client
                                    </span>
                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            </div>

        </section>
    );
};


export default Reviews;