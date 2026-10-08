import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { servicesApi } from "../services/api";


function Services() {

    const [services, setServices] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadServices = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await servicesApi.get();

                setServices(
                    response.services || []
                );

            } catch (err) {

                console.error(
                    "Load services error:",
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

        loadServices();

    }, []);


    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    What I Create
                </span>

                <h1 className="page-title">
                    Beauty <em>Services</em>
                </h1>


                {loading && (
                    <p style={{ marginTop: "50px" }}>
                        Loading services...
                    </p>
                )}


                {error && (
                    <p style={{ marginTop: "50px" }}>
                        {error}
                    </p>
                )}


                {!loading &&
                    !error &&
                    services.length === 0 && (
                        <p style={{ marginTop: "50px" }}>
                            No services available yet.
                        </p>
                    )}


                {!loading &&
                    !error &&
                    services.length > 0 && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(260px,1fr))",
                            gap: "20px",
                            marginTop: "50px",
                        }}
                    >

                        {services.map((service) => (

                            <Link
                                key={service.id}
                                to={`/services/${service.slug}`}
                                className="glass-card"
                                style={{
                                    padding: "35px",
                                    textDecoration: "none",
                                    display: "block",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "var(--rose-600)",
                                        fontSize: "28px",
                                    }}
                                >
                                    ✦
                                </span>


                                <h2
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond',serif",
                                        fontSize: "32px",
                                        color:
                                            "var(--rose-950)",
                                    }}
                                >
                                    {service.name}
                                </h2>


                                <p className="page-description">
                                    {service.short_description}
                                </p>


                                {service.starting_price != null && (
                                    <p
                                        style={{
                                            marginTop: "15px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Starting from ₹
                                        {service.starting_price}
                                    </p>
                                )}


                                {service.duration_minutes && (
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        {service.duration_minutes} minutes
                                    </p>
                                )}

                                {Array.isArray(service.includes) &&
                                    service.includes.length > 0 && (
                                        <div
                                            style={{
                                                marginTop: "20px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    color: "var(--rose-600)",
                                                }}
                                            >
                                                Includes
                                            </span>

                                            <ul
                                                style={{
                                                    marginTop: "10px",
                                                    paddingLeft: "20px",
                                                }}
                                            >
                                                {service.includes.map(
                                                    (item, index) => (
                                                        <li
                                                            key={index}
                                                            style={{
                                                                marginBottom:
                                                                    "6px",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            {item}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                            </Link>

                        ))}

                    </div>

                )}


                <div style={{ marginTop: "45px" }}>

                    <Link
                        to="/booking"
                        className="button button-primary"
                    >
                        Request Appointment →
                    </Link>

                </div>

            </div>

        </section>
    );
}

export default Services;