import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { servicesApi } from "../services/api";
import "./Service.css";

function Service() {
    const { slug } = useParams();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadService = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await servicesApi.get();

                const foundService =
                    (response.services || []).find(
                        (item) => item.slug === slug
                    );

                if (!foundService) {
                    throw new Error("Service not found.");
                }

                setService(foundService);
            } catch (err) {
                console.error(
                    "Load service error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load service."
                );
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadService();
        }
    }, [slug]);

    return (
        <section className="service-detail">
            <div className="page-container">

                <span className="eyebrow">
                    Beauty Service
                </span>

                {/* Loading */}
                {loading && (
                    <p style={{ marginTop: "40px" }}>
                        Loading service...
                    </p>
                )}

                {/* Error */}
                {error && (
                    <>
                        <h1 className="page-title">
                            Service <em>Not Found</em>
                        </h1>

                        <p
                            className="page-description"
                            style={{ marginTop: "30px" }}
                        >
                            {error}
                        </p>

                        <Link
                            to="/services"
                            className="button button-glass"
                        >
                            ← Back to Services
                        </Link>
                    </>
                )}

                {/* Service */}
                {!loading && !error && service && (
                    <div className="service-detail-hero">

                        {/* Image */}
                        <div>
                            {service.image_url && (
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="service-detail-image"
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="service-detail-content">

                            <h1 className="page-title">
                                {service.name}
                            </h1>

                            {service.short_description && (
                                <p className="page-description">
                                    {service.short_description}
                                </p>
                            )}

                            {/* Price / Duration */}
                            <div className="service-detail-meta">

                                {service.starting_price != null && (
                                    <div className="service-detail-meta-item">
                                        <span className="service-detail-meta-label">
                                            Starting From
                                        </span>

                                        <span className="service-detail-meta-value">
                                            ₹{service.starting_price}
                                        </span>
                                    </div>
                                )}

                                {service.duration_minutes && (
                                    <div className="service-detail-meta-item">
                                        <span className="service-detail-meta-label">
                                            Duration
                                        </span>

                                        <span className="service-detail-meta-value">
                                            {service.duration_minutes}{" "}
                                            minutes
                                        </span>
                                    </div>
                                )}

                            </div>

                            {/* Description */}
                            {service.description && (
                                <div
                                    style={{
                                        marginTop: "35px"
                                    }}
                                >
                                    <p
                                        className="page-description"
                                        style={{
                                            whiteSpace:
                                                "pre-wrap"
                                        }}
                                    >
                                        {service.description}
                                    </p>
                                </div>
                            )}

                            {/* What's Included */}
                            {Array.isArray(service.includes) &&
                                service.includes.length > 0 && (
                                    <div className="service-detail-includes">

                                        <h2>
                                            What's Included
                                        </h2>

                                        <ul>
                                            {service.includes.map(
                                                (item, index) => (
                                                    <li key={index}>
                                                        {item}
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                    </div>
                                )}

                            {/* Actions */}
                            <div className="service-detail-actions">

                                <Link
                                    to={`/booking?service=${service.slug}`}
                                    className="button button-primary"
                                >
                                    Book This Service →
                                </Link>

                                <Link
                                    to="/services"
                                    className="button button-glass"
                                >
                                    ← All Services
                                </Link>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}

export default Service;