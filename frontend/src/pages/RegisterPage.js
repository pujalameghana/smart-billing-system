import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaFileInvoiceDollar, FaBuilding, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import GoogleAuthButton from "../components/GoogleAuthButton";

function RegisterPage({ onNavigateLogin }) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(formData);
        } catch (err) {
            console.error("Registration failed:", err);
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to register. Please check your information."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "480px", width: "100%" }}>
                <div className="card-body p-4 p-md-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div
                            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
                            style={{ width: "60px", height: "60px" }}
                        >
                            <FaFileInvoiceDollar size={32} />
                        </div>
                        <h2 className="fw-bold text-dark">Get Started</h2>
                        <p className="text-muted small">Create your company account & start generating invoices</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 small" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Google Signup Option */}
                    <div className="mb-4">
                        <GoogleAuthButton
                            buttonText="Sign up with Google"
                            defaultCompanyName={formData.companyName}
                        />
                    </div>

                    {/* Divider */}
                    <div className="d-flex align-items-center mb-4">
                        <hr className="flex-grow-1 my-0 text-muted" />
                        <span className="px-3 small text-muted text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                            OR REGISTER WITH EMAIL
                        </span>
                        <hr className="flex-grow-1 my-0 text-muted" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Full Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaUser size={14} />
                                </span>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control"
                                    placeholder="Jane Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Company / Business Name *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaBuilding size={14} />
                                </span>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="form-control"
                                    placeholder="Acme Global Inc"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Username *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">@</span>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    placeholder="janedoe"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Email Address *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaEnvelope size={14} />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="jane@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Password *</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaLock size={14} />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Minimum 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account & Start Invoicing"}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <span className="text-muted small">Already have an account? </span>
                        <button
                            type="button"
                            className="btn btn-link p-0 small text-primary fw-semibold"
                            onClick={onNavigateLogin}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
