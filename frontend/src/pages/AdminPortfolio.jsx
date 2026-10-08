import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import {
    adminPortfolioApi,
    portfolioApi
} from "../services/api";

import "./AdminPortfolio.css";


const emptyForm = {
    title: "",
    description: "",
    image_url: "",
    storage_path: "",
    alt_text: "",
    category_id: "",
    display_order: 0,
    is_featured: false,
    is_published: true
};


const AdminPortfolio = () => {

    const navigate = useNavigate();

    const [portfolio, setPortfolio] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [editingItem, setEditingItem] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // ====================================
    // ADMIN TOKEN
    // ====================================

    const getAdminToken = async () => {

        const {
            data,
            error
        } = await supabase.auth.getSession();

        if (
            error ||
            !data?.session?.access_token
        ) {
            navigate(
                "/admin/login",
                {
                    replace: true
                }
            );

            throw new Error(
                "Admin session expired."
            );
        }

        return data.session.access_token;
    };


    // ====================================
    // LOAD PORTFOLIO
    // ====================================

    const loadPortfolio = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                await getAdminToken();

            const [
                portfolioResponse,
                categoriesResponse
            ] = await Promise.all([
                adminPortfolioApi.getAll(
                    token
                ),
                portfolioApi.getCategories()
            ]);


            setPortfolio(
                portfolioResponse.portfolio || []
            );

            setCategories(
                categoriesResponse.categories || []
            );

        } catch (err) {

            console.error(
                "Load admin portfolio error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load portfolio."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadPortfolio();
    }, []);


    // ====================================
    // FORM CHANGE
    // ====================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value
            })
        );
    };

    const handleImageUpload = async () => {
        if (!selectedImage) {
            alert("Please select an image first.");
            return;
        }

        try {
            setUploadingImage(true);

            const {
                data
            } = await supabase.auth.getSession();

            const token =
                data?.session?.access_token;

            if (!token) {
                throw new Error(
                    "Admin session expired."
                );
            }

            const result =
                await adminPortfolioApi.uploadImage(
                    token,
                    selectedImage
                );

            setForm((previous) => ({
                ...previous,
                image_url: result.image.url,
                storage_path: result.image.path
            }));

            alert(
                "Image uploaded successfully."
            );

            setSelectedImage(null);
        } catch (error) {
            console.error(
                "Portfolio image upload error:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to upload image."
            );
    } finally {
            setUploadingImage(false);
        }
    };

    // ====================================
    // EDIT ITEM
    // ====================================

    const handleEdit = (item) => {

        setEditingItem(item);

        setForm({
            title:
                item.title || "",

            description:
                item.description || "",

            image_url:
                item.image_url || "",

            storage_path:
                item.storage_path || "",

            alt_text:
                item.alt_text || "",

            category_id:
                item.category_id || "",

            display_order:
                item.display_order ?? 0,

            is_featured:
                item.is_featured ?? false,

            is_published:
                item.is_published ?? true
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ====================================
    // RESET FORM
    // ====================================

    const resetForm = () => {

        setEditingItem(null);
        setForm(emptyForm);

        setError("");
        setSuccess("");
    };


    // ====================================
    // SAVE ITEM
    // ====================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const token =
                await getAdminToken();


            const portfolioData = {
                title:
                    form.title.trim(),

                description:
                    form.description.trim(),

                image_url:
                    form.image_url.trim(),

                storage_path:
                    form.storage_path.trim(),

                alt_text:
                    form.alt_text.trim(),

                category_id:
                    form.category_id || null,

                display_order:
                    Number(
                        form.display_order || 0
                    ),

                is_featured:
                    form.is_featured,

                is_published:
                    form.is_published
            };


            if (editingItem) {

                const response =
                    await adminPortfolioApi.update(
                        token,
                        editingItem.id,
                        portfolioData
                    );

                setSuccess(
                    response.message ||
                    "Portfolio item updated successfully."
                );

            } else {

                const response =
                    await adminPortfolioApi.create(
                        token,
                        portfolioData
                    );

                setSuccess(
                    response.message ||
                    "Portfolio item created successfully."
                );
            }


            resetForm();

            await loadPortfolio();

        } catch (err) {

            console.error(
                "Save portfolio item error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save portfolio item."
            );

        } finally {

            setSaving(false);

        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Delete "${item.title}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            const token = await getAdminToken();

            await adminPortfolioApi.remove(
                token,
                item.id
            );

            alert("Portfolio item deleted successfully.");

            await loadPortfolio();

            if (editingItem?.id === item.id) {
                setEditingItem(null);
                setForm(emptyForm);
            }

        } catch (error) {

            console.error(
                "Delete portfolio item error:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to delete portfolio item."
            );

        } finally {
            setSaving(false);
        }
    };

    // ====================================
    // TOGGLE PUBLISHED / FEATURED
    // ====================================

    const handleToggle = async (
        item,
        field
    ) => {

        try {

            setError("");
            setSuccess("");

            const token =
                await getAdminToken();


            await adminPortfolioApi.update(
                token,
                item.id,
                {
                    title:
                        item.title,

                    description:
                        item.description,

                    image_url:
                        item.image_url,

                    storage_path:
                        item.storage_path,

                    alt_text:
                        item.alt_text,

                    category_id:
                        item.category_id,

                    display_order:
                        item.display_order,

                    is_featured:
                        field === "is_featured"
                            ? !item.is_featured
                            : item.is_featured,

                    is_published:
                        field === "is_published"
                            ? !item.is_published
                            : item.is_published
                }
            );


            setSuccess(
                field === "is_published"
                    ? item.is_published
                        ? "Portfolio item unpublished."
                        : "Portfolio item published."
                    : item.is_featured
                        ? "Removed from featured."
                        : "Added to featured."
            );


            await loadPortfolio();

        } catch (err) {

            console.error(
                "Toggle portfolio item error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update portfolio item."
            );
        }
    };


    return (
        <main className="admin-portfolio-page">

            {/* ====================================
                HEADER
            ==================================== */}

            <section className="admin-portfolio-header">

                <div>

                    <span className="admin-section-eyebrow">
                        PORTFOLIO
                    </span>

                    <h1>
                        Selected Work
                    </h1>

                    <p>
                        Manage the makeup looks
                        displayed on the public website.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-portfolio-new-button"
                    onClick={resetForm}
                >
                    + Add Portfolio Item
                </button>

            </section>


            {/* ====================================
                MESSAGES
            ==================================== */}

            {error && (
                <div className="admin-portfolio-message error">
                    {error}
                </div>
            )}


            {success && (
                <div className="admin-portfolio-message success">
                    {success}
                </div>
            )}


            {/* ====================================
                FORM
            ==================================== */}

            <section className="admin-portfolio-form-section">

                <div className="admin-portfolio-form-header">

                    <div>

                        <span className="admin-section-eyebrow">
                            {editingItem
                                ? "EDIT PORTFOLIO ITEM"
                                : "NEW PORTFOLIO ITEM"}
                        </span>

                        <h2>
                            {editingItem
                                ? "Edit Portfolio Item"
                                : "Add a Portfolio Item"}
                        </h2>

                    </div>


                    {editingItem && (
                        <button
                            type="button"
                            className="admin-portfolio-cancel"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="admin-portfolio-form"
                >

                    <div className="admin-portfolio-form-grid">

                        <div className="admin-portfolio-field">
                            <label>
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Bridal Look"
                                required
                            />
                        </div>


                        <div className="admin-portfolio-field">
                            <label>
                                Category
                            </label>

                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map(
                                    category => (
                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
                                                category.id
                                            }
                                        >
                                            {category.name}
                                        </option>
                                    )
                                )}

                            </select>
                        </div>


                        <div className="admin-portfolio-field admin-portfolio-field-full">
                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={handleChange}
                                placeholder="Describe this look..."
                            />
                        </div>

                        <div className="admin-form-group">
                            <label>
                                Upload Portfolio Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setSelectedImage(
                                        event.target.files?.[0] || null
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={handleImageUpload}
                                disabled={
                                    !selectedImage ||
                                    uploadingImage
                                }
                            >
                                {uploadingImage
                                    ? "Uploading..."
                                    : "Upload Image"}
                            </button>
                        </div>

                        <div className="admin-portfolio-field admin-portfolio-field-full">
                            <label>
                                Image URL
                            </label>

                            <input
                                type="url"
                                name="image_url"
                                value={
                                    form.image_url
                                }
                                onChange={handleChange}
                                placeholder="https://..."
                            />

                            <small>
                                Image upload/storage will be
                                connected later.
                            </small>
                        </div>


                        <div className="admin-portfolio-field">
                            <label>
                                Storage Path
                            </label>

                            <input
                                type="text"
                                name="storage_path"
                                value={
                                    form.storage_path
                                }
                                onChange={handleChange}
                                placeholder="portfolio/bridal/image.jpg"
                            />
                        </div>


                        <div className="admin-portfolio-field">
                            <label>
                                Alt Text
                            </label>

                            <input
                                type="text"
                                name="alt_text"
                                value={
                                    form.alt_text
                                }
                                onChange={handleChange}
                                placeholder="Bridal makeup look"
                            />
                        </div>


                        <div className="admin-portfolio-field">
                            <label>
                                Display Order
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="display_order"
                                value={
                                    form.display_order
                                }
                                onChange={handleChange}
                            />
                        </div>


                        <div className="admin-portfolio-options">

                            <label>
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={
                                        form.is_featured
                                    }
                                    onChange={handleChange}
                                />

                                <span>
                                    Featured
                                </span>
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    name="is_published"
                                    checked={
                                        form.is_published
                                    }
                                    onChange={handleChange}
                                />

                                <span>
                                    Published
                                </span>
                            </label>

                        </div>

                    </div>


                    <div className="admin-portfolio-form-actions">

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Clear
                        </button>


                        <button
                            type="submit"
                            className="admin-portfolio-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingItem
                                    ? "Update Item"
                                    : "Create Item"}
                        </button>

                    </div>

                </form>

            </section>


            {/* ====================================
                PORTFOLIO LIST
            ==================================== */}

            <section className="admin-portfolio-list-section">

                <div className="admin-portfolio-list-header">

                    <div>

                        <span className="admin-section-eyebrow">
                            PORTFOLIO CATALOG
                        </span>

                        <h2>
                            All Portfolio Items
                        </h2>

                    </div>


                    <span className="admin-portfolio-count">
                        {portfolio.length} items
                    </span>

                </div>


                {loading ? (

                    <div className="admin-portfolio-empty">
                        Loading portfolio...
                    </div>

                ) : portfolio.length === 0 ? (

                    <div className="admin-portfolio-empty">
                        No portfolio items have been added yet.
                    </div>

                ) : (

                    <div className="admin-portfolio-list">

                        {portfolio.map(item => (

                            <article
                                key={item.id}
                                className="admin-portfolio-card"
                            >

                                <div className="admin-portfolio-preview">

                                    {item.image_url ? (
                                        <img
                                            src={
                                                item.image_url
                                            }
                                            alt={
                                                item.alt_text ||
                                                item.title
                                            }
                                        />
                                    ) : (
                                        <div>
                                            No Image
                                        </div>
                                    )}

                                </div>


                                <div className="admin-portfolio-card-main">

                                    <div className="admin-portfolio-card-title">

                                        <span className="admin-portfolio-order">
                                            #{item.display_order}
                                        </span>

                                        <div>

                                            <h3>
                                                {item.title}
                                            </h3>

                                            <span>
                                                {item
                                                    .portfolio_categories
                                                    ?.name ||
                                                    "Uncategorized"}
                                            </span>

                                        </div>

                                    </div>


                                    <p>
                                        {item.description ||
                                            "No description."}
                                    </p>


                                    <div className="admin-portfolio-meta">

                                        <span
                                            className={
                                                item.is_published
                                                    ? "published"
                                                    : "unpublished"
                                            }
                                        >
                                            {item.is_published
                                                ? "Published"
                                                : "Unpublished"}
                                        </span>


                                        <span
                                            className={
                                                item.is_featured
                                                    ? "featured"
                                                    : ""
                                            }
                                        >
                                            {item.is_featured
                                                ? "Featured"
                                                : "Not Featured"}
                                        </span>

                                    </div>

                                </div>


                                <div className="admin-portfolio-card-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(
                                                item
                                            )
                                        }
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggle(
                                                item,
                                                "is_published"
                                            )
                                        }
                                    >
                                        {item.is_published
                                            ? "Unpublish"
                                            : "Publish"}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggle(
                                                item,
                                                "is_featured"
                                            )
                                        }
                                    >
                                        {item.is_featured
                                            ? "Unfeature"
                                            : "Feature"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item)}
                                        disabled={saving}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </main>
    );
};


export default AdminPortfolio;