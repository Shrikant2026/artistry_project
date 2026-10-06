import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import "./AdminLogin.css";

const AdminLogin = () => {
    const navigate = useNavigate(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const {
                data,
                error: loginError
            } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (loginError) {
                throw loginError;
            }

            if (!data?.user) {
                throw new Error(
                    "Unable to sign in."
                );
            }

            navigate("/admin");

        } catch (error) {
            console.error(
                "Admin login error:",
                error
            );

            setError(
                error.message ||
                "Unable to sign in. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="admin-login-page">
            <div className="admin-login-card">

                <p className="admin-login-eyebrow">
                    RUPANJALI'S MAKEUP ARTISTRY
                </p>

                <h1>
                    Admin Login
                </h1>

                <p className="admin-login-intro">
                    Sign in to manage bookings,
                    availability and website content.
                </p>

                {error && (
                    <div className="admin-login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        <span>Email</span>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Admin email"
                            required
                        />
                    </label>

                    <label>
                        <span>Password</span>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Password"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

            </div>
        </main>
    );
};

export default AdminLogin;