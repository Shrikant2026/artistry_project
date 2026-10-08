import { useEffect, useState } from "react";

import {
    portfolioApi
} from "../services/api";


function Portfolio() {

    const [portfolio, setPortfolio] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [selectedCategory, setSelectedCategory] =
        useState("all");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [selectedItem, setSelectedItem] = useState(null);


    useEffect(() => {

        const loadPortfolio = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    portfolioResponse,
                    categoriesResponse
                ] = await Promise.all([
                    portfolioApi.get(),
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
                    "Load portfolio error:",
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

        loadPortfolio();

    }, []);

    const filteredPortfolio =
    selectedCategory === "all"
        ? portfolio
        : portfolio.filter(
            (item) =>
                item.category_id ===
                selectedCategory
        );

    return (
        <section className="section">

            <div className="page-container">

                <span className="eyebrow">
                    Selected Work
                </span>

                <h1 className="page-title">
                    The <em>Portfolio</em>
                </h1>

                <p className="page-description">
                    A collection of looks created for
                    different faces, celebrations and
                    unforgettable moments.
                </p>

                {!loading &&
                    !error &&
                    categories.length > 0 && (

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "35px",
                            }}
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCategory("all")
                                }
                                style={{
                                    padding:
                                        "10px 18px",
                                    borderRadius:
                                        "999px",
                                    border:
                                        selectedCategory ===
                                        "all"
                                            ? "1px solid var(--rose-950)"
                                            : "1px solid rgba(0,0,0,.15)",
                                    background:
                                        selectedCategory ===
                                        "all"
                                            ? "var(--rose-950)"
                                            : "transparent",
                                    color:
                                        selectedCategory ===
                                        "all"
                                            ? "#fff"
                                            : "var(--rose-950)",
                                    cursor:
                                        "pointer",
                                    fontFamily:
                                        "inherit",
                                }}
                            >
                                All
                            </button>


                            {categories.map(
                                (category) => (

                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory(
                                                category.id
                                            )
                                        }
                                        style={{
                                            padding:
                                                "10px 18px",
                                            borderRadius:
                                                "999px",
                                            border:
                                                selectedCategory ===
                                                category.id
                                                    ? "1px solid var(--rose-950)"
                                                    : "1px solid rgba(0,0,0,.15)",
                                            background:
                                                selectedCategory ===
                                                category.id
                                                    ? "var(--rose-950)"
                                                    : "transparent",
                                            color:
                                                selectedCategory ===
                                                category.id
                                                    ? "#fff"
                                                    : "var(--rose-950)",
                                            cursor:
                                                "pointer",
                                            fontFamily:
                                                "inherit",
                                        }}
                                    >
                                        {category.name}
                                    </button>

                                )
                            )}

                        </div>

                    )}

                {loading && (
                    <p
                        style={{
                            marginTop: "50px"
                        }}
                    >
                        Loading portfolio...
                    </p>
                )}


                {error && (
                    <p
                        style={{
                            marginTop: "50px"
                        }}
                    >
                        {error}
                    </p>
                )}


                {!loading &&
                    !error &&
                    filteredPortfolio.length === 0 && (

                        <p
                            style={{
                                marginTop: "50px"
                            }}
                        >
                            No portfolio looks available
                            yet.
                        </p>

                    )}


                {!loading &&
                    !error &&
                    filteredPortfolio.length > 0 && (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit,minmax(240px,1fr))",
                                gap: "20px",
                                marginTop: "50px",
                            }}
                        >

                            {filteredPortfolio.map(
                                (item) => (

                                    <article
                                        key={item.id}
                                        className="glass-card"
                                        onClick={() => setSelectedItem(item)}
                                        style={{
                                            cursor: "pointer",
                                            height: "300px",
                                            padding: "0",
                                            overflow: "hidden",
                                            position: "relative",
                                            display: "flex",
                                            alignItems: "flex-end",
                                        }}
                                    >

                                        {item.image_url && (
                                            <img
                                                src={
                                                    item.image_url
                                                }
                                                alt={
                                                    item.alt_text ||
                                                    item.title
                                                }
                                                style={{
                                                    position:
                                                        "absolute",
                                                    inset: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit:
                                                        "cover",
                                                }}
                                            />
                                        )}


                                        {!item.image_url && (
                                            <div
                                                style={{
                                                    position:
                                                        "absolute",
                                                    inset: 0,
                                                    background:
                                                        "linear-gradient(145deg, rgba(249,221,213,.7), rgba(220,113,141,.45))",
                                                }}
                                            />
                                        )}


                                        <div
                                            style={{
                                                position:
                                                    "relative",
                                                width: "100%",
                                                padding: "25px",
                                                background:
                                                    "linear-gradient(transparent, rgba(0,0,0,.65))",
                                                paddingTop:
                                                    "80px",
                                            }}
                                        >

                                            <h2
                                                style={{
                                                    margin: 0,
                                                    fontFamily:
                                                        "'Cormorant Garamond',serif",
                                                    color:
                                                        "#fff",
                                                }}
                                            >
                                                {item.title}
                                            </h2>


                                            {item
                                                .portfolio_categories
                                                ?.name && (

                                                <p
                                                    style={{
                                                        margin:
                                                            "5px 0 0",
                                                        color:
                                                            "rgba(255,255,255,.85)",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    {
                                                        item
                                                            .portfolio_categories
                                                            .name
                                                    }
                                                </p>

                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                {selectedItem && (
                    <div
                        onClick={() => setSelectedItem(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,.75)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "30px",
                        }}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                maxWidth: "900px",
                                width: "100%",
                                maxHeight: "90vh",
                                overflow: "auto",
                                background: "var(--ivory-50)",
                                borderRadius: "18px",
                                padding: "20px",
                            }}
                        >
                            {selectedItem.image_url && (
                                <img
                                    src={selectedItem.image_url}
                                    alt={
                                        selectedItem.alt_text ||
                                        selectedItem.title
                                    }
                                    style={{
                                        width: "100%",
                                        maxHeight: "65vh",
                                        objectFit: "contain",
                                        borderRadius: "12px",
                                    }}
                                />
                            )}

                            <h2
                                style={{
                                    marginTop: "20px",
                                    fontFamily:
                                        "'Cormorant Garamond', serif",
                                }}
                            >
                                {selectedItem.title}
                            </h2>

                            {selectedItem.portfolio_categories?.name && (
                                <p>
                                    {selectedItem.portfolio_categories.name}
                                </p>
                            )}

                            {selectedItem.description && (
                                <p>
                                    {selectedItem.description}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                style={{
                                    marginTop: "15px",
                                    padding: "10px 20px",
                                    borderRadius: "999px",
                                    border: "none",
                                    background: "var(--rose-950)",
                                    color: "#fff",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>

        </section>
    );
}

export default Portfolio;