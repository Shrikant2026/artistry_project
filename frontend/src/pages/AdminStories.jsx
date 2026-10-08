import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";
import { adminStoriesApi } from "../services/api";

import "./AdminStories.css";


const emptyForm = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    cover_storage_path: "",
    category: "",
    author_name: "",
    status: "draft",
    published_at: ""
};


function AdminStories() {

    const navigate = useNavigate();

    const [stories, setStories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [editingStory, setEditingStory] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [uploadingImage, setUploadingImage] =
        useState(false);

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
                { replace: true }
            );

            throw new Error(
                "Admin session expired."
            );
        }

        return data.session.access_token;
    };


    const loadStories = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                await getAdminToken();

            const response =
                await adminStoriesApi.getAll(
                    token
                );

            setStories(
                response.stories || []
            );

        } catch (err) {

            console.error(
                "Load admin stories error:",
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


    useEffect(() => {
        loadStories();
    }, []);


    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value
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

            const token =
                await getAdminToken();

            const result =
                await adminStoriesApi.uploadImage(
                    token,
                    selectedImage
                );

            setForm((previous) => ({
                ...previous,
                cover_image_url:
                    result.image.url,
                cover_storage_path:
                    result.image.path
            }));

            setSelectedImage(null);

            alert(
                "Story cover image uploaded successfully."
            );

        } catch (error) {

            console.error(
                "Story cover image upload error:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to upload story cover image."
            );

        } finally {

            setUploadingImage(false);
        }
    };

    const handleEdit = (story) => {

        setEditingStory(story);

        setForm({
            title:
                story.title || "",

            slug:
                story.slug || "",

            excerpt:
                story.excerpt || "",

            content:
                story.content || "",

            cover_image_url:
                story.cover_image_url || "",

            cover_storage_path:
                story.cover_storage_path || "",

            category:
                story.category || "",

            author_name:
                story.author_name || "",

            status:
                story.status || "draft",

            published_at:
                story.published_at
                    ? story.published_at
                        .slice(0, 16)
                    : ""
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    const resetForm = () => {

        setEditingStory(null);
        setForm(emptyForm);

        setError("");
        setSuccess("");
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const token =
                await getAdminToken();

            const storyData = {
                title:
                    form.title.trim(),

                slug:
                    form.slug.trim(),

                excerpt:
                    form.excerpt.trim(),

                content:
                    form.content.trim(),

                cover_image_url:
                    form.cover_image_url.trim() ||
                    null,

                cover_storage_path:
                    form.cover_storage_path.trim() ||
                    null,

                category:
                    form.category.trim() ||
                    null,

                author_name:
                    form.author_name.trim() ||
                    null,

                status:
                    form.status,

                published_at:
                    form.status === "published"
                        ? (
                            form.published_at
                                ? new Date(
                                    form.published_at
                                ).toISOString()
                                : new Date().toISOString()
                        )
                        : null
            };


            if (editingStory) {

                const response =
                    await adminStoriesApi.update(
                        token,
                        editingStory.id,
                        storyData
                    );

                setSuccess(
                    response.message ||
                    "Story updated successfully."
                );

            } else {

                const response =
                    await adminStoriesApi.create(
                        token,
                        storyData
                    );

                setSuccess(
                    response.message ||
                    "Story created successfully."
                );
            }


            resetForm();

            await loadStories();

        } catch (err) {

            console.error(
                "Save story error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save story."
            );

        } finally {

            setSaving(false);
        }
    };


    const handleDelete = async (story) => {

        const confirmed =
            window.confirm(
                `Delete "${story.title}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            setSaving(true);

            const token =
                await getAdminToken();

            await adminStoriesApi.remove(
                token,
                story.id
            );

            setSuccess(
                "Story deleted successfully."
            );

            if (
                editingStory?.id ===
                story.id
            ) {
                resetForm();
            }

            await loadStories();

        } catch (err) {

            console.error(
                "Delete story error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to delete story."
            );

        } finally {

            setSaving(false);
        }
    };


    return (
        <main className="admin-stories-page">

            <section className="admin-stories-header">

                <div>

                    <span className="admin-section-eyebrow">
                        STORIES
                    </span>

                    <h1>
                        Beauty Stories
                    </h1>

                    <p>
                        Manage the stories
                        published on the website.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={resetForm}
                    className="admin-stories-new-button"
                >
                    + Add Story
                </button>

            </section>


            {error && (
                <div className="admin-stories-message error">
                    {error}
                </div>
            )}


            {success && (
                <div className="admin-stories-message success">
                    {success}
                </div>
            )}


            <section className="admin-stories-form-section">

                <div className="admin-stories-form-header">

                    <div>

                        <span className="admin-section-eyebrow">
                            {editingStory
                                ? "EDIT STORY"
                                : "NEW STORY"}
                        </span>

                        <h2>
                            {editingStory
                                ? "Edit Story"
                                : "Create a Story"}
                        </h2>

                    </div>

                    {editingStory && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="admin-stories-cancel"
                        >
                            Cancel Edit
                        </button>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="admin-stories-form"
                >

                    <div className="admin-stories-form-grid">

                        <div className="admin-stories-field">
                            <label>
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="A Bride's Beauty Journey"
                                required
                            />
                        </div>


                        <div className="admin-stories-field">
                            <label>
                                Slug
                            </label>

                            <input
                                type="text"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder="bridal-beauty"
                                required
                            />
                        </div>


                        <div className="admin-stories-field">
                            <label>
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Bridal"
                            />
                        </div>


                        <div className="admin-stories-field">
                            <label>
                                Author
                            </label>

                            <input
                                type="text"
                                name="author_name"
                                value={form.author_name}
                                onChange={handleChange}
                                placeholder="Rupanjali Banerjee"
                            />
                        </div>


                        <div className="admin-stories-field">
                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>

                                <option value="archived">
                                    Archived
                                </option>
                            </select>
                        </div>


                        <div className="admin-stories-field">
                            <label>
                                Published At
                            </label>

                            <input
                                type="datetime-local"
                                name="published_at"
                                value={form.published_at}
                                onChange={handleChange}
                                disabled={
                                    form.status !==
                                    "published"
                                }
                            />
                        </div>


                        <div className="admin-stories-field admin-stories-field-full">

                            <label>
                                Excerpt
                            </label>

                            <textarea
                                name="excerpt"
                                value={form.excerpt}
                                onChange={handleChange}
                                placeholder="A short introduction to the story..."
                                rows="3"
                            />

                        </div>

                        <div className="admin-stories-field admin-stories-field-full">

                            <label>
                                Upload Cover Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setSelectedImage(
                                        event.target.files?.[0] ||
                                        null
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

                        <div className="admin-stories-field admin-stories-field-full">

                            <label>
                                Cover Image URL
                            </label>

                            <input
                                type="url"
                                name="cover_image_url"
                                value={
                                    form.cover_image_url
                                }
                                onChange={handleChange}
                                placeholder="https://..."
                            />

                        </div>


                        <div className="admin-stories-field admin-stories-field-full">

                            <label>
                                Content
                            </label>

                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder="Write the full story..."
                                rows="12"
                            />

                        </div>

                    </div>


                    <div className="admin-stories-form-actions">

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="admin-stories-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingStory
                                    ? "Update Story"
                                    : "Create Story"}
                        </button>

                    </div>

                </form>

            </section>


            <section className="admin-stories-list-section">

                <div className="admin-stories-list-header">

                    <div>

                        <span className="admin-section-eyebrow">
                            STORY CATALOG
                        </span>

                        <h2>
                            All Stories
                        </h2>

                    </div>

                    <span className="admin-stories-count">
                        {stories.length} stories
                    </span>

                </div>


                {loading ? (

                    <div className="admin-stories-empty">
                        Loading stories...
                    </div>

                ) : stories.length === 0 ? (

                    <div className="admin-stories-empty">
                        No stories have been created yet.
                    </div>

                ) : (

                    <div className="admin-stories-list">

                        {stories.map((story) => (

                            <article
                                key={story.id}
                                className="admin-stories-card"
                            >

                                <div>

                                    <span className="admin-section-eyebrow">
                                        {story.category ||
                                            "Story"}
                                    </span>

                                    <h3>
                                        {story.title}
                                    </h3>

                                    <p>
                                        {story.excerpt ||
                                            "No excerpt."}
                                    </p>

                                    <small>
                                        /stories/{story.slug}
                                    </small>

                                </div>


                                <div className="admin-stories-card-meta">

                                    <span>
                                        {story.status}
                                    </span>

                                    {story.author_name && (
                                        <span>
                                            By{" "}
                                            {story.author_name}
                                        </span>
                                    )}

                                </div>


                                <div className="admin-stories-card-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(story)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(story)
                                        }
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
}

export default AdminStories;