import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import ApiTest from "./pages/ApiTest";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Booking from "./pages/Booking";
import AdminLogin from "./pages/AdminLogin";

import PublicLayout from "./components/PublicLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminAvailability from "./pages/AdminAvailability";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ================================
                    PUBLIC WEBSITE
                ================================= */}

                <Route element={<PublicLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/portfolio"
                        element={<Portfolio />}
                    />

                    <Route
                        path="/services"
                        element={<Services />}
                    />

                    <Route
                        path="/stories"
                        element={<Stories />}
                    />

                    <Route
                        path="/stories/:slug"
                        element={<Story />}
                    />

                    <Route
                        path="/blogs"
                        element={<Stories />}
                    />

                    <Route
                        path="/booking"
                        element={<Booking />}
                    />

                    <Route
                        path="/api-test"
                        element={<ApiTest />}
                    />

                </Route>


                {/* ================================
                    ADMIN
                ================================= */}

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/bookings"
                    element={<AdminBookings />}
                />

                <Route
                    path="/admin/availability"
                    element={<AdminAvailability />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;