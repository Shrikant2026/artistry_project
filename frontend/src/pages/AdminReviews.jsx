import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";
import { adminReviewsApi } from "../services/api";

import "./AdminReviews.css";


const AdminReviews = () => {

    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        customerName: "",
        rating: 5,
        reviewText: "",
        customerImageUrl: "",
        displayOrder: 0,
        isPublished: false
    });

    const getToken = async () => {

        const {
            data,
            error
        } = await supabase.auth.getSession();

        if (
            error ||
            !data?.session?.access_token
        ) {
            navigate("/admin/login", {
                replace: true
            });

            throw new Error(
                "Admin session expired."
            );
        }

        return data.session.access_token;
    };


    const loadReviews = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                await getToken();

            const response =
                await adminReviewsApi.getAll(
                    token
                );

            setReviews(
                response.reviews || []
            );

        } catch (error) {

            console.error(
                "Unable to load admin reviews:",
                error
            );

            setError(
                error.message ||
                "Unable to load reviews."
            );

        } finally {

            setLoading(false);

        }
    };

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };


    const handleCreateReview = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const token =
                await getToken();

            const response =
                await adminReviewsApi.create(
                    token,
                    {
                        customerName:
                            form.customerName,
                        rating:
                            Number(form.rating),
                        reviewText:
                            form.reviewText,
                        customerImageUrl:
                            form.customerImageUrl,
                        displayOrder:
                            Number(form.displayOrder),
                        isPublished:
                            form.isPublished
                    }
                );

            setReviews((current) => [
                ...current,
                response.review
            ]);

            setForm({
                customerName: "",
                rating: 5,
                reviewText: "",
                customerImageUrl: "",
                displayOrder: 0,
                isPublished: false
            });

        } catch (error) {

            console.error(
                "Unable to create review:",
                error
            );

            setError(
                error.message ||
                "Unable to create review."
            );

        } finally {

            setSaving(false);

        }
    };

    useEffect(() => {
        loadReviews();
    }, []);


    if (loading) {
        return (
            <main className="admin-reviews-loading">
                Loading reviews...
            </main>
        );
    }


    return (
        <main className="admin-reviews">

            <header className="admin-reviews-header">

                <div>

                    <p className="admin-reviews-eyebrow">
                        RUPANJALI'S MAKEUP ARTISTRY
                    </p>

                    <h1>
                        Client Reviews
                    </h1>

                    <p>
                        Manage the testimonials
                        displayed on your website.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin")
                    }
                >
                    ← Dashboard
                </button>

            </header>


            {error && (
                <div className="admin-reviews-error">
                    {error}
                </div>
            )}

            <form
                className="admin-review-form"
                onSubmit={handleCreateReview}
            >

                <div className="admin-review-form-header">
                    <div>
                        <p className="admin-reviews-eyebrow">
                            New Testimonial
                        </p>

                        <h2>
                            Add Client Review
                        </h2>
                    </div>
                </div>


                <div className="admin-review-form-grid">

                    <label>
                        Client Name

                        <input
                            type="text"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleChange}
                            required
                        />
                    </label>


                    <label>
                        Rating

                        <select
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            required
                        >
                            <option value="5">★★★★★ — 5</option>
                            <option value="4">★★★★☆ — 4</option>
                            <option value="3">★★★☆☆ — 3</option>
                            <option value="2">★★☆☆☆ — 2</option>
                            <option value="1">★☆☆☆☆ — 1</option>
                        </select>
                    </label>


                    <label className="admin-review-form-full">
                        Review

                        <textarea
                            name="reviewText"
                            value={form.reviewText}
                            onChange={handleChange}
                            rows="5"
                            required
                        />
                    </label>


                    <label>
                        Client Image URL

                        <input
                            type="url"
                            name="customerImageUrl"
                            value={form.customerImageUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </label>


                    <label>
                        Display Order

                        <input
                            type="number"
                            name="displayOrder"
                            value={form.displayOrder}
                            onChange={handleChange}
                            min="0"
                        />
                    </label>

                </div>


                <label className="admin-review-publish">

                    <input
                        type="checkbox"
                        name="isPublished"
                        checked={form.isPublished}
                        onChange={handleChange}
                    />

                    Publish this review immediately

                </label>


                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Add Review"}
                </button>

            </form>

            {reviews.length === 0 ? (

                <div className="admin-reviews-empty">
                    <h2>
                        No reviews yet
                    </h2>

                    <p>
                        Add your first client
                        review to display it
                        on the website.
                    </p>
                </div>

            ) : (

                <section className="admin-reviews-list">

                    {reviews.map((review) => (

                        <article
                            key={review.id}
                            className="admin-review-card"
                        >

                            <div className="admin-review-card-top">

                                <div>

                                    <h2>
                                        {review.customer_name}
                                    </h2>

                                    <div className="admin-review-rating">
                                        {"★".repeat(
                                            review.rating
                                        )}
                                    </div>

                                </div>

                                <span
                                    className={
                                        review.is_published
                                            ? "published"
                                            : "draft"
                                    }
                                >
                                    {review.is_published
                                        ? "Published"
                                        : "Hidden"}
                                </span>

                            </div>


                            <p className="admin-review-text">
                                “{review.review_text}”
                            </p>


                            <div className="admin-review-meta">

                                <span>
                                    Display order:
                                    {" "}
                                    {review.display_order}
                                </span>

                            </div>

                        </article>

                    ))}

                </section>

            )}

        </main>
    );
};


export default AdminReviews;