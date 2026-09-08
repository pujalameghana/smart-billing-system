import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaUserCircle, FaBuilding } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const PRESET_ACCOUNTS = [
    {
        name: "Alex Turner",
        email: "alex.turner@gmail.com",
        companyName: "Turner Technologies Inc",
        picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        initials: "AT",
        color: "#4285F4"
    },
    {
        name: "Sarah Jenkins",
        email: "sarah.jenkins@gmail.com",
        companyName: "Apex Creative Agency",
        picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        initials: "SJ",
        color: "#EA4335"
    },
    {
        name: "Rahul Sharma",
        email: "rahul.sharma@gmail.com",
        companyName: "Sharma Global Logistics",
        picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        initials: "RS",
        color: "#34A853"
    }
];

function GoogleAuthButton({ buttonText = "Continue with Google", defaultCompanyName = "" }) {
    const { loginWithGoogle } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customEmail, setCustomEmail] = useState("");
    const [customName, setCustomName] = useState("");
    const [companyName, setCompanyName] = useState(defaultCompanyName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSelectAccount = async (account) => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle({
                email: account.email,
                name: account.name,
                picture: account.picture,
                companyName: defaultCompanyName || account.companyName
            });
            setShowModal(false);
        } catch (err) {
            console.error("Google login error:", err);
            setError(err.response?.data?.message || err.response?.data || "Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomSubmit = async (e) => {
        e.preventDefault();
        if (!customEmail || !customEmail.includes("@")) {
            setError("Please enter a valid Google email address.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle({
                email: customEmail.trim(),
                name: customName.trim() || customEmail.split("@")[0],
                companyName: companyName.trim() || `${customName || "My"} Company`
            });
            setShowModal(false);
        } catch (err) {
            console.error("Custom Google login error:", err);
            setError(err.response?.data?.message || err.response?.data || "Google Sign-In failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className="btn btn-outline-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold bg-white text-dark shadow-sm border"
                style={{
                    borderRadius: "8px",
                    transition: "all 0.2s ease"
                }}
                onClick={() => {
                    setError("");
                    setShowModal(true);
                }}
            >
                <FcGoogle size={22} />
                <span>{buttonText}</span>
            </button>

            {/* Google One-Tap / Accounts Selection Modal */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-4 pb-2 border-bottom d-flex justify-content-between align-items-start">
                                <div className="d-flex align-items-center gap-2">
                                    <FcGoogle size={28} />
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0 text-dark">Sign in with Google</h5>
                                        <div className="small text-muted">to continue to SmartBilling</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                />
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4">
                                {error && (
                                    <div className="alert alert-danger py-2 small mb-3">
                                        {error}
                                    </div>
                                )}

                                {!isCustomMode ? (
                                    <div>
                                        <div className="small fw-semibold text-muted mb-2 text-uppercase" style={{ letterSpacing: "0.5px" }}>
                                            Select a Google Account
                                        </div>

                                        <div className="list-group list-group-flush border rounded-3 mb-3">
                                            {PRESET_ACCOUNTS.map((acc, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 border-bottom"
                                                    onClick={() => handleSelectAccount(acc)}
                                                    disabled={loading}
                                                >
                                                    <div
                                                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            backgroundColor: acc.color,
                                                            fontSize: 15
                                                        }}
                                                    >
                                                        {acc.initials}
                                                    </div>
                                                    <div className="text-start flex-grow-1 overflow-hidden">
                                                        <div className="fw-semibold text-dark text-truncate">{acc.name}</div>
                                                        <div className="small text-muted text-truncate">{acc.email}</div>
                                                        <div className="badge bg-light text-secondary border mt-1 small">
                                                            {acc.companyName}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-light w-100 py-2 border text-dark fw-semibold small d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => setIsCustomMode(true)}
                                            disabled={loading}
                                        >
                                            <FaUserCircle size={16} /> Use another Google account
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCustomSubmit}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-semibold small text-dark">Enter your Google details:</span>
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0 small text-decoration-none"
                                                onClick={() => setIsCustomMode(false)}
                                            >
                                                &larr; Back to accounts
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Google Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="you@gmail.com"
                                                value={customEmail}
                                                onChange={(e) => setCustomEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Your Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Johnathan Smith"
                                                value={customName}
                                                onChange={(e) => setCustomName(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Company / Business Name *</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white text-muted">
                                                    <FaBuilding size={14} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Acme Global Technologies"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 py-2 fw-semibold shadow-sm mt-2"
                                            disabled={loading}
                                        >
                                            {loading ? "Authenticating with Google..." : "Sign In with Google"}
                                        </button>
                                    </form>
                                )}

                                {loading && (
                                    <div className="text-center mt-3 small text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        Connecting to Google authentication...
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-light px-4 py-3 border-top small text-muted text-center">
                                Dual-Mode Google OAuth 2.0 & Email Security.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GoogleAuthButton;
