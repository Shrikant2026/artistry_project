import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { aboutApi } from "../services/api";
import "./AdminAbout.css";

const emptyAbout = {
    artist_name: "",
    professional_title: "",
    heading: "",
    introduction: "",
    biography: "",
    philosophy: "",
    closing_message: "",
    artist_image_url: "",
    brand_logo_url: "",
    brand_logo_path: ""
};

function AdminAbout() {
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyAbout);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        loadAbout();

        return () => {
            if (preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }

            if (logoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }

        };
        // Load once when the page opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (logoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const loadAbout = async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            if (!accessToken) {
                navigate("/admin/login");
                return;
            }

            setToken(accessToken);

            const response = await aboutApi.getAdmin(accessToken);
            setForm({
                ...emptyAbout,
                ...response.data.about
            });
        } catch (err) {
            console.error("About page loading error:", err);
            setError(
                err.response?.data?.message || "Unable to load About page."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            return;
        }

        if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
        setError("");
        setMessage("");
    };

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid logo image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Logo size must be less than 5 MB.");
            return;
        }

        if (logoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
        }

        setSelectedLogo(file);
        setLogoPreview(URL.createObjectURL(file));
        setError("");
        setMessage("");
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setUploading(true);
        setError("");
        setMessage("");

        try {
            const response = await aboutApi.uploadImage(token, selectedImage);
            const updatedAbout = response.data.about;

            setForm((previous) => ({
                ...previous,
                artist_image_url: updatedAbout.artist_image_url
            }));

            setSelectedImage(null);
            setPreview("");
            setMessage("Artist photograph uploaded successfully.");
        } catch (err) {
            console.error("About image upload error:", err);
            setError(
                err.response?.data?.message || "Image upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleLogoUpload = async () => {
        if (!selectedLogo) return;

        setUploadingLogo(true);
        setError("");
        setMessage("");

        try {
            const response = await aboutApi.uploadBrandLogo(
                token,
                selectedLogo
            );

            const updatedAbout = response.data.about;

            setForm((previous) => ({
                ...previous,
                brand_logo_url: updatedAbout.brand_logo_url,
                brand_logo_path: updatedAbout.brand_logo_path
            }));

            if (logoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }

            setSelectedLogo(null);
            setLogoPreview("");

            setMessage("Brand logo uploaded successfully.");
        } catch (err) {
            console.error("Brand logo upload error:", err);

            setError(
                err.response?.data?.message || "Logo upload failed."
            );
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                artist_name: form.artist_name,
                professional_title: form.professional_title,
                heading: form.heading,
                introduction: form.introduction,
                biography: form.biography,
                philosophy: form.philosophy,
                closing_message: form.closing_message
            };

            const response = await aboutApi.update(token, payload);

            setForm((previous) => ({
                ...previous,
                ...response.data.about
            }));

            setMessage("About page updated successfully.");
        } catch (err) {
            console.error("About page save error:", err);
            setError(
                err.response?.data?.message || "Unable to save changes."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-about-loading">Loading About editor...</div>;
    }

    return (
        <div className="admin-about-page">
            <div className="admin-about-header">
                <div>
                    <span className="admin-about-eyebrow">WEBSITE CONTENT</span>
                    <h1>About Page</h1>
                    <p>Manage Rupanjali's profile and artist story.</p>
                </div>

                <button
                    type="button"
                    className="admin-about-back"
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>
            </div>

            {message && (
                <div className="admin-about-message success">{message}</div>
            )}

            {error && (
                <div className="admin-about-message error">{error}</div>
            )}

            <form onSubmit={handleSave}>

                <section className="admin-about-card">
                    <div className="admin-about-section-heading">
                        <div>
                            <span>01</span>
                            <h2>Website Brand Logo</h2>
                        </div>

                        <p>
                            Manage the logo displayed in the public website navigation.
                        </p>
                    </div>

                    <div className="admin-about-photo-area">
                        <div className="admin-about-photo">
                            {(logoPreview || form.brand_logo_url) ? (
                                <img
                                    src={logoPreview || form.brand_logo_url}
                                    alt="Website brand logo preview"
                                />
                            ) : (
                                <div className="admin-about-photo-placeholder">
                                    <span>+</span>
                                    <p>No brand logo uploaded</p>
                                </div>
                            )}
                        </div>

                        <div className="admin-about-photo-controls">
                            <label className="admin-about-upload-label">
                                Choose brand logo

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </label>

                            <p>PNG, JPG or WebP. Maximum size: 5 MB.</p>

                            {selectedLogo && (
                                <button
                                    type="button"
                                    className="admin-about-upload-button"
                                    onClick={handleLogoUpload}
                                    disabled={uploadingLogo}
                                >
                                    {uploadingLogo
                                        ? "Uploading..."
                                        : "Upload brand logo"}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="admin-about-card">
                    <div className="admin-about-section-heading">
                        <div>
                            <span>01</span>
                            <h2>Artist Photograph</h2>
                        </div>
                        <p>Upload the photograph displayed on the public About page.</p>
                    </div>

                    <div className="admin-about-photo-area">
                        <div className="admin-about-photo">
                            {(preview || form.artist_image_url) ? (
                                <img
                                    src={preview || form.artist_image_url}
                                    alt="Artist preview"
                                />
                            ) : (
                                <div className="admin-about-photo-placeholder">
                                    <span>+</span>
                                    <p>No photograph uploaded</p>
                                </div>
                            )}
                        </div>

                        <div className="admin-about-photo-controls">
                            <label className="admin-about-upload-label">
                                Choose photograph
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>

                            <p>JPG, PNG or WebP. Maximum size: 5 MB.</p>

                            {selectedImage && (
                                <button
                                    type="button"
                                    className="admin-about-upload-button"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Upload photograph"}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="admin-about-card">
                    <div className="admin-about-section-heading">
                        <div>
                            <span>02</span>
                            <h2>Artist Information</h2>
                        </div>
                        <p>Basic identity and heading information.</p>
                    </div>

                    <div className="admin-about-fields two-columns">
                        <label>
                            Artist name
                            <input
                                name="artist_name"
                                value={form.artist_name}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Professional title
                            <input
                                name="professional_title"
                                value={form.professional_title}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="full-width">
                            Page heading
                            <input
                                name="heading"
                                value={form.heading}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                </section>

                <section className="admin-about-card">
                    <div className="admin-about-section-heading">
                        <div>
                            <span>03</span>
                            <h2>Artist Story</h2>
                        </div>
                        <p>These sections form the main content of the About page.</p>
                    </div>

                    <div className="admin-about-fields">
                        <label>
                            Introduction
                            <textarea
                                name="introduction"
                                value={form.introduction}
                                onChange={handleChange}
                                rows="3"
                            />
                        </label>

                        <label>
                            Biography
                            <textarea
                                name="biography"
                                value={form.biography}
                                onChange={handleChange}
                                rows="6"
                            />
                        </label>

                        <label>
                            Makeup philosophy
                            <textarea
                                name="philosophy"
                                value={form.philosophy}
                                onChange={handleChange}
                                rows="5"
                            />
                        </label>

                        <label>
                            Closing message
                            <textarea
                                name="closing_message"
                                value={form.closing_message}
                                onChange={handleChange}
                                rows="3"
                            />
                        </label>
                    </div>
                </section>

                <div className="admin-about-save-area">
                    <button
                        type="submit"
                        className="admin-about-save-button"
                        disabled={saving || uploading || uploadingLogo}
                    >
                        {saving ? "Saving changes..." : "Save About Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminAbout;