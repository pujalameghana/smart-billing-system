import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaFileInvoiceDollar, FaLock, FaUser, FaShieldAlt, FaBuilding } from "react-icons/fa";
import GoogleAuthButton from "../components/GoogleAuthButton";

function LoginPage({ onNavigateRegister }) {
    const { login } = useAuth();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(usernameOrEmail, password);
        } catch (err) {
            console.error("Login failed:", err);
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Invalid credentials. Please verify username/password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFillAdmin = () => {
        setUsernameOrEmail("admin");
        setPassword("admin123");
        setError("");
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "460px", width: "100%" }}>
                <div className="card-body p-4 p-md-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div
                            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
                            style={{ width: "60px", height: "60px" }}
                        >
                            <FaFileInvoiceDollar size={32} />
                        </div>
                        <h2 className="fw-bold text-dark">Welcome Back</h2>
                        <p className="text-muted small">Sign in to your smart billing and invoice account</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 small" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In (Primary Option 1) */}
                    <div className="mb-4">
                        <GoogleAuthButton buttonText="Continue with Google" />
                    </div>

                    {/* Divider */}
                    <div className="d-flex align-items-center mb-4">
                        <hr className="flex-grow-1 my-0 text-muted" />
                        <span className="px-3 small text-muted text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                            OR EMAIL PASSWORD
                        </span>
                        <hr className="flex-grow-1 my-0 text-muted" />
                    </div>

                    {/* Email / Password Form (Option 2) */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Username or Email</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaUser size={14} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="admin or user@company.com"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaLock size={14} />
                                </span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In with Email"}
                        </button>

                        {/* Quick Role-Based Testing Callout */}
                        <div className="p-3 bg-light rounded-3 border mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-bold text-dark d-flex align-items-center gap-1">
                                    <FaShieldAlt className="text-danger" /> Platform Master Admin:
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm py-0 px-2"
                                    style={{ fontSize: "11px" }}
                                    onClick={handleFillAdmin}
                                >
                                    ⚡ Fill Admin
                                </button>
                            </div>
                            <div className="small text-muted" style={{ fontSize: "12px" }}>
                                <code>admin / admin123</code> &mdash; Full platform oversight, view all businesses and users.
                            </div>
                            <hr className="my-2" />
                            <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                                <FaBuilding className="text-primary" />
                                <span><strong>Customer Business:</strong> Use "Continue with Google" or create an account.</span>
                            </div>
                        </div>
                    </form>

                    <div className="text-center mt-3">
                        <span className="text-muted small">Don't have an account? </span>
                        <button
                            type="button"
                            className="btn btn-link p-0 small text-primary fw-semibold"
                            onClick={onNavigateRegister}
                        >
                            Create Company Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
