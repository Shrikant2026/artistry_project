import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Booking from "./pages/Booking";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <main>
                <Routes>

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

                </Routes>
            </main>

            <Footer />

        </BrowserRouter>
    );
}

export default App;