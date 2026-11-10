
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
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    const [form, setForm] = useState({
        customerName: "",
        rating: 5,
        reviewText: "",
        customerImageUrl: "",
        displayOrder: 0,
        isPublished: false
    });

    // ====================================
    // GET ADMIN TOKEN
    // ====================================

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

            throw new Error("Admin session expired.");
        }

        return data.session.access_token;
    };


    // ====================================
    // LOAD REVIEWS
    // ====================================

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const token = await getToken();

            const response = await adminReviewsApi.getAll(token);

            console.log("Admin reviews API response:", response);

            setReviews(response.reviews || []);

        } catch (error) {
            console.error(
                "Unable to load admin reviews:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to load reviews."
            );

        } finally {
            setLoading(false);
        }
    };


    // ====================================
    // FORM CHANGE HANDLER
    // ====================================

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


    // ====================================
    // RESET FORM
    // ====================================

    const resetForm = () => {
        setEditingReviewId(null);

        setForm({
            customerName: "",
            rating: 5,
            reviewText: "",
            customerImageUrl: "",
            displayOrder: 0,
            isPublished: false
        });
    };


    // ====================================
    // CREATE / UPDATE REVIEW
    // ====================================

    const handleCreateReview = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const token = await getToken();

            const reviewData = {
                customerName: form.customerName.trim(),
                rating: Number(form.rating),
                reviewText: form.reviewText.trim(),
                customerImageUrl: form.customerImageUrl.trim(),
                displayOrder: Number(form.displayOrder),
                isPublished: form.isPublished
            };

            if (editingReviewId) {

                // UPDATE EXISTING REVIEW

                const response = await adminReviewsApi.update(
                    token,
                    editingReviewId,
                    reviewData
                );

                setReviews((current) =>
                    current.map((review) =>
                        review.id === editingReviewId
                            ? response.review
                            : review
                    )
                );

            } else {

                // CREATE NEW REVIEW

                const response = await adminReviewsApi.create(
                    token,
                    reviewData
                );

                setReviews((current) => [
                    ...current,
                    response.review
                ]);
            }

            resetForm();

        } catch (error) {
            console.error(
                "Unable to save review:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to save review."
            );

        } finally {
            setSaving(false);
        }
    };


    // ====================================
    // EDIT REVIEW
    // ====================================

    const handleEditReview = (review) => {
        setEditingReviewId(review.id);

        setForm({
            customerName: review.customer_name || "",
            rating: review.rating || 5,
            reviewText: review.review_text || "",
            customerImageUrl: review.customer_image_url || "",
            displayOrder: review.display_order ?? 0,
            isPublished: review.is_published ?? false
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ====================================
    // DELETE REVIEW
    // ====================================

    const handleDeleteReview = async (review) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete the review from ${review.customer_name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingReviewId(review.id);
            setError("");

            const token = await getToken();

            await adminReviewsApi.delete(
                token,
                review.id
            );

            setReviews((current) =>
                current.filter(
                    (item) => item.id !== review.id
                )
            );

            if (editingReviewId === review.id) {
                resetForm();
            }

        } catch (error) {
            console.error(
                "Unable to delete review:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to delete review."
            );

        } finally {
            setDeletingReviewId(null);
        }
    };


    // ====================================
    // INITIAL LOAD
    // ====================================

    useEffect(() => {
        loadReviews();
    }, []);


    // ====================================
    // LOADING STATE
    // ====================================

    if (loading) {
        return (
            <main className="admin-reviews-loading">
                Loading reviews...
            </main>
        );
    }


    // ====================================
    // PAGE
    // ====================================

    return (
        <main className="admin-reviews">

            {/* PAGE HEADER */}

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
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>

            </header>


            {/* ERROR MESSAGE */}

            {error && (
                <div className="admin-reviews-error">
                    {error}
                </div>
            )}


            {/* ADD / EDIT REVIEW FORM */}

            <form
                className="admin-review-form"
                onSubmit={handleCreateReview}
            >

                <div className="admin-review-form-header">

                    <div>

                        <p className="admin-reviews-eyebrow">
                            {editingReviewId
                                ? "Edit Testimonial"
                                : "New Testimonial"}
                        </p>

                        <h2>
                            {editingReviewId
                                ? "Edit Client Review"
                                : "Add Client Review"}
                        </h2>

                    </div>

                </div>


                <div className="admin-review-form-grid">

                    {/* CUSTOMER NAME */}

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


                    {/* RATING */}

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


                    {/* REVIEW TEXT */}

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


                    {/* CUSTOMER IMAGE */}

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


                    {/* DISPLAY ORDER */}

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


                {/* PUBLISH OPTION */}

                <label className="admin-review-publish">

                    <input
                        type="checkbox"
                        name="isPublished"
                        checked={form.isPublished}
                        onChange={handleChange}
                    />

                    Publish this review immediately

                </label>


                {/* FORM BUTTONS */}

                <div className="admin-review-form-actions">

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingReviewId
                                ? "Update Review"
                                : "Add Review"}
                    </button>

                    {editingReviewId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                            className="admin-review-cancel"
                        >
                            Cancel Editing
                        </button>
                    )}

                </div>

            </form>


            {/* REVIEW LIST */}

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

                            {/* REVIEW HEADER */}

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


                            {/* REVIEW CONTENT */}

                            <p className="admin-review-text">
                                “{review.review_text}”
                            </p>


                            {/* REVIEW META */}

                            <div className="admin-review-meta">

                                <span>
                                    Display order:{" "}
                                    {review.display_order}
                                </span>

                            </div>


                            {/* EDIT / DELETE ACTIONS */}

                            <div className="admin-review-actions">

                                <button
                                    type="button"
                                    onClick={() => handleEditReview(review)}
                                >
                                    Edit Review
                                </button>

                                <button
                                    type="button"
                                    className="admin-review-delete"
                                    onClick={() => handleDeleteReview(review)}
                                    disabled={
                                        deletingReviewId === review.id
                                    }
                                >
                                    {deletingReviewId === review.id
                                        ? "Deleting..."
                                        : "Delete Review"}
                                </button>

                            </div>

                        </article>

                    ))}

                </section>

            )}

        </main>
    );
};

export default AdminReviews;
