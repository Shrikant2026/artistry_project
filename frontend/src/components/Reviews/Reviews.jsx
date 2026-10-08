import {
    useEffect,
    useState
} from "react";

import { reviewsApi } from "../../services/api";

import "./Reviews.css";


const Reviews = () => {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);


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


    /*
     * Desktop:
     * 3 reviews per slide
     *
     * Mobile:
     * 1 review per slide
     *
     * CSS controls the visible number,
     * while we calculate pages based
     * on desktop groups here.
     */

    const desktopPageSize = 3;

    const pages = [];

    for (
        let index = 0;
        index < reviews.length;
        index += desktopPageSize
    ) {
        pages.push(
            reviews.slice(
                index,
                index + desktopPageSize
            )
        );
    }


    /*
     * Automatically move to the
     * next slide every 5 seconds.
     */

    useEffect(() => {

        if (pages.length <= 1) {
            return;
        }

        const timer = setInterval(() => {

            setCurrentPage(
                (current) =>
                    (current + 1) % pages.length
            );

        }, 5000);


        return () => {
            clearInterval(timer);
        };

    }, [pages.length]);


    /*
     * Reset the page if reviews change
     * and the current page no longer exists.
     */

    useEffect(() => {

        if (
            pages.length > 0 &&
            currentPage >= pages.length
        ) {
            setCurrentPage(0);
        }

    }, [pages.length, currentPage]);


    if (
        loading ||
        reviews.length === 0
    ) {
        return null;
    }


    const currentReviews =
        pages[currentPage] || [];


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


                <div className="reviews-carousel">

                    <div className="reviews-grid" key={currentPage}>

                        {currentReviews.map(
                            (review) => (

                                <article
                                    key={review.id}
                                    className="review-card"
                                >

                                    <div className="review-rating">
                                        {"★".repeat(
                                            review.rating
                                        )}
                                    </div>


                                    <blockquote>
                                        “
                                        {review.review_text}
                                        ”
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
                                                {
                                                    review.customer_name
                                                }
                                            </strong>

                                            <span>
                                                Client
                                            </span>

                                        </div>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </div>


                {pages.length > 1 && (

                    <div className="reviews-dots">

                        {pages.map(
                            (_, index) => (

                                <button
                                    key={index}
                                    type="button"
                                    className={
                                        index === currentPage
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentPage(index)
                                    }
                                    aria-label={
                                        `Go to review group ${index + 1}`
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </div>

        </section>
    );
};


export default Reviews;