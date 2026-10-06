const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const availabilityRoutes = require("./routes/availabilityRoutes");
const servicesRoutes = require("./routes/servicesRoutes");
dotenv.config();

const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
);

/*
|--------------------------------------------------------------------------
| Request Body
|--------------------------------------------------------------------------
*/

app.use(
    express.json({
        limit: "1mb",
    })
);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RUPANJALI'S MAKEUP ARTISTRY API is running",
    });
});

/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RUPANJALI'S MAKEUP ARTISTRY API",
    });
});

/*
|--------------------------------------------------------------------------
| Availability Routes
|--------------------------------------------------------------------------
*/

app.use(
    "/api/availability",
    availabilityRoutes
);

/*
|--------------------------------------------------------------------------
| Bookings
|--------------------------------------------------------------------------
*/

app.use(
    "/api/bookings",
    bookingRoutes
);

/*
|--------------------------------------------------------------------------
| Services Routes
|--------------------------------------------------------------------------
*/

app.use(
    "/api/services",
    servicesRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
});

module.exports = app;