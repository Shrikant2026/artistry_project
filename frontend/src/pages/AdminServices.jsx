import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { adminServicesApi } from "../services/api";
import "./AdminServices.css";


const emptyForm = {
    name: "",
    slug: "",
    short_description: "",
    description: "",
    starting_price: "",
    duration_minutes: "",
    includes: "",
    image_url: "",
    display_order: 0,
    is_published: true
};


const AdminServices = () => {

    const navigate = useNavigate();

    const [services, setServices] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [editingService, setEditingService] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);


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
    // LOAD SERVICES
    // ====================================

    const loadServices = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                await getAdminToken();

            const response =
                await adminServicesApi.getAll(
                    token
                );

            setServices(
                response.services || []
            );

        } catch (err) {

            console.error(
                "Load admin services error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load services."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadServices();
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


    // ====================================
    // EDIT SERVICE
    // ====================================

    const handleEdit = (service) => {

        setEditingService(service);

        setForm({
            name:
                service.name || "",

            slug:
                service.slug || "",

            short_description:
                service.short_description || "",

            description:
                service.description || "",

            starting_price:
                service.starting_price ?? "",

            duration_minutes:
                service.duration_minutes ?? "",

            includes:
                Array.isArray(service.includes)
                    ? service.includes.join("\n")
                    : "",

            image_url:
                service.image_url || "",

            display_order:
                service.display_order ?? 0,

            is_published:
                service.is_published ?? true
        });

        setSuccess("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ====================================
    // RESET FORM
    // ====================================

    const resetForm = () => {

        setEditingService(null);
        setForm(emptyForm);

        setError("");
        setSuccess("");
    };


    // ====================================
    // SAVE SERVICE
    // ====================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const token =
                await getAdminToken();


            const serviceData = {
                name:
                    form.name.trim(),

                slug:
                    form.slug.trim(),

                short_description:
                    form.short_description.trim(),

                description:
                    form.description.trim(),

                starting_price:
                    form.starting_price === ""
                        ? null
                        : Number(
                            form.starting_price
                        ),

                duration_minutes:
                    form.duration_minutes === ""
                        ? null
                        : Number(
                            form.duration_minutes
                        ),

                includes:
                    form.includes
                        .split("\n")
                        .map(item =>
                            item.trim()
                        )
                        .filter(Boolean),

                image_url:
                    form.image_url.trim(),

                display_order:
                    Number(
                        form.display_order || 0
                    ),

                is_published:
                    form.is_published
            };


            if (editingService) {

                const response =
                    await adminServicesApi.update(
                        token,
                        editingService.id,
                        serviceData
                    );

                setSuccess(
                    response.message ||
                    "Service updated successfully."
                );

            } else {

                const response =
                    await adminServicesApi.create(
                        token,
                        serviceData
                    );

                setSuccess(
                    response.message ||
                    "Service created successfully."
                );
            }


            resetForm();

            await loadServices();

        } catch (err) {

            console.error(
                "Save service error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save service."
            );

        } finally {

            setSaving(false);

        }
    };


    // ====================================
    // TOGGLE PUBLISHED
    // ====================================

    const handleTogglePublished = async (
        service
    ) => {

        try {

            setError("");
            setSuccess("");

            const token =
                await getAdminToken();

            await adminServicesApi.update(
                token,
                service.id,
                {
                    name:
                        service.name,

                    slug:
                        service.slug,

                    short_description:
                        service.short_description,

                    description:
                        service.description,

                    starting_price:
                        service.starting_price,

                    duration_minutes:
                        service.duration_minutes,

                    includes:
                        service.includes || [],

                    image_url:
                        service.image_url,

                    display_order:
                        service.display_order,

                    is_published:
                        !service.is_published
                }
            );

            setSuccess(
                service.is_published
                    ? "Service unpublished."
                    : "Service published."
            );

            await loadServices();

        } catch (err) {

            console.error(
                "Toggle service error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to update service."
            );
        }
    };


    return (
        <main className="admin-services-page">

            <section className="admin-services-header">

                <div>
                    <span className="admin-section-eyebrow">
                        SERVICES
                    </span>

                    <h1>
                        Makeup Services
                    </h1>

                    <p>
                        Manage the services shown
                        across the public website.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-service-new-button"
                    onClick={resetForm}
                >
                    + Add Service
                </button>

            </section>


            {error && (
                <div className="admin-services-message error">
                    {error}
                </div>
            )}


            {success && (
                <div className="admin-services-message success">
                    {success}
                </div>
            )}


            {/* ====================================
                SERVICE FORM
            ==================================== */}

            <section className="admin-service-form-section">

                <div className="admin-service-form-header">

                    <div>
                        <span className="admin-section-eyebrow">
                            {editingService
                                ? "EDIT SERVICE"
                                : "NEW SERVICE"}
                        </span>

                        <h2>
                            {editingService
                                ? "Edit Service"
                                : "Add a Service"}
                        </h2>
                    </div>

                    {editingService && (
                        <button
                            type="button"
                            className="admin-service-cancel"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="admin-service-form"
                >

                    <div className="admin-service-form-grid">

                        <div className="admin-service-field">
                            <label>
                                Service Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Bridal Makeup"
                                required
                            />
                        </div>


                        <div className="admin-service-field">
                            <label>
                                Slug
                            </label>

                            <input
                                type="text"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder="bridal-makeup"
                                required
                            />
                        </div>


                        <div className="admin-service-field admin-service-field-full">
                            <label>
                                Short Description
                            </label>

                            <input
                                type="text"
                                name="short_description"
                                value={
                                    form.short_description
                                }
                                onChange={handleChange}
                                placeholder="A personalised bridal beauty experience."
                            />
                        </div>


                        <div className="admin-service-field admin-service-field-full">
                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the service..."
                            />
                        </div>


                        <div className="admin-service-field">
                            <label>
                                Starting Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="starting_price"
                                value={
                                    form.starting_price
                                }
                                onChange={handleChange}
                                placeholder="25000"
                            />
                        </div>


                        <div className="admin-service-field">
                            <label>
                                Duration (minutes)
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="duration_minutes"
                                value={
                                    form.duration_minutes
                                }
                                onChange={handleChange}
                                placeholder="120"
                            />
                        </div>


                        <div className="admin-service-field admin-service-field-full">
                            <label>
                                Includes
                            </label>

                            <textarea
                                name="includes"
                                value={form.includes}
                                onChange={handleChange}
                                placeholder={
                                    "HD Makeup\nHair Styling\nDraping"
                                }
                            />

                            <small>
                                Enter one included item per line.
                            </small>
                        </div>


                        <div className="admin-service-field admin-service-field-full">
                            <label>
                                Image URL
                            </label>

                            <input
                                type="url"
                                name="image_url"
                                value={form.image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>


                        <div className="admin-service-field">
                            <label>
                                Display Order
                            </label>

                            <input
                                type="number"
                                name="display_order"
                                value={
                                    form.display_order
                                }
                                onChange={handleChange}
                            />
                        </div>


                        <div className="admin-service-publish-field">

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


                    <div className="admin-service-form-actions">

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="admin-service-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingService
                                    ? "Update Service"
                                    : "Create Service"}
                        </button>

                    </div>

                </form>

            </section>


            {/* ====================================
                SERVICE LIST
            ==================================== */}

            <section className="admin-service-list-section">

                <div className="admin-service-list-header">

                    <div>
                        <span className="admin-section-eyebrow">
                            SERVICE CATALOG
                        </span>

                        <h2>
                            All Services
                        </h2>
                    </div>

                    <span className="admin-service-count">
                        {services.length} services
                    </span>

                </div>


                {loading ? (

                    <div className="admin-services-empty">
                        Loading services...
                    </div>

                ) : services.length === 0 ? (

                    <div className="admin-services-empty">
                        No services have been added yet.
                    </div>

                ) : (

                    <div className="admin-service-list">

                        {services.map(service => (

                            <article
                                key={service.id}
                                className="admin-service-card"
                            >

                                <div className="admin-service-card-main">

                                    <div className="admin-service-card-title">

                                        <span className="admin-service-order">
                                            #{service.display_order}
                                        </span>

                                        <div>
                                            <h3>
                                                {service.name}
                                            </h3>

                                            <span>
                                                /{service.slug}
                                            </span>
                                        </div>

                                    </div>


                                    <p>
                                        {service.short_description ||
                                            "No short description."}
                                    </p>


                                    <div className="admin-service-meta">

                                        {service.starting_price !== null && (
                                            <span>
                                                ₹
                                                {Number(
                                                    service.starting_price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </span>
                                        )}

                                        {service.duration_minutes && (
                                            <span>
                                                {service.duration_minutes}
                                                {" "}
                                                min
                                            </span>
                                        )}

                                        <span
                                            className={
                                                service.is_published
                                                    ? "published"
                                                    : "unpublished"
                                            }
                                        >
                                            {service.is_published
                                                ? "Published"
                                                : "Unpublished"}
                                        </span>

                                    </div>

                                </div>


                                <div className="admin-service-card-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(
                                                service
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleTogglePublished(
                                                service
                                            )
                                        }
                                    >
                                        {service.is_published
                                            ? "Unpublish"
                                            : "Publish"}
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


export default AdminServices;