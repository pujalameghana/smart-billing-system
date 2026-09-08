import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { createBusiness, updateBusiness } from "../services/api";
import { FaBuilding, FaSave, FaUpload, FaCheckCircle } from "react-icons/fa";

function CompanySetup({ isNew = false, setPage }) {
    const { activeCompany, refreshCompanies, setActiveCompany } = useCompany();

    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        address: "",
        gstin: "",
        phone: "",
        email: "",
        website: "",
        currency: "₹",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        taxPercentage: 18.0,
        invoicePrefix: "INV",
        invoiceTerms: "1. Payment due within 15 days of invoice date.\n2. Late payment may incur a 1.5% monthly interest fee.",
        notes: "Thank you for your business!",
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpFromEmail: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew && activeCompany) {
            setFormData({
                name: activeCompany.name || "",
                logo: activeCompany.logo || "",
                address: activeCompany.address || "",
                gstin: activeCompany.gstin || "",
                phone: activeCompany.phone || "",
                email: activeCompany.email || "",
                website: activeCompany.website || "",
                currency: activeCompany.currency || "₹",
                bankName: activeCompany.bankName || "",
                accountNumber: activeCompany.accountNumber || "",
                ifscCode: activeCompany.ifscCode || "",
                upiId: activeCompany.upiId || "",
                taxPercentage: activeCompany.taxPercentage !== null ? activeCompany.taxPercentage : 18.0,
                invoicePrefix: activeCompany.invoicePrefix || "INV",
                invoiceTerms: activeCompany.invoiceTerms || "",
                notes: activeCompany.notes || "",
                smtpHost: activeCompany.smtpHost || "smtp.gmail.com",
                smtpPort: activeCompany.smtpPort || 587,
                smtpUsername: activeCompany.smtpUsername || "",
                smtpPassword: activeCompany.smtpPassword || "",
                smtpFromEmail: activeCompany.smtpFromEmail || ""
            });
        } else if (isNew) {
            setFormData({
                name: "",
                logo: "",
                address: "",
                gstin: "",
                phone: "",
                email: "",
                website: "",
                currency: "₹",
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                upiId: "",
                taxPercentage: 18.0,
                invoicePrefix: "INV",
                invoiceTerms: "1. Payment due within 15 days.\n2. Goods once sold will not be returned.",
                notes: "Thank you for your business!"
            });
        }
    }, [activeCompany, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle Image file upload to base64
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Logo image size should be less than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!formData.name.trim()) {
            setError("Company name is required.");
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const created = await createBusiness(formData);
                await refreshCompanies();
                setActiveCompany(created);
                setMessage("Company created and activated successfully!");
                if (setPage) setPage("dashboard");
            } else {
                const updated = await updateBusiness(activeCompany.id, formData);
                await refreshCompanies();
                setActiveCompany(updated);
                setMessage("Company profile and billing settings updated!");
            }
        } catch (err) {
            console.error("Error saving company:", err);
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response.data : "") ||
                "Unable to save company details."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container py-4 mb-5" style={{ maxWidth: "900px" }}>
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-primary text-white p-4 rounded-top-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white text-primary rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48 }}>
                            <FaBuilding size={24} />
                        </div>
                        <div>
                            <h3 className="fw-bold mb-0">
                                {isNew ? "Register New Company" : "Company Profile & Billing Settings"}
                            </h3>
                            <p className="mb-0 opacity-75 small">
                                Configure your company branding, tax registration, and payment details
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4 p-md-5">
                    {message && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                            <FaCheckCircle /> {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Brand & Basic Information */}
                        <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">1. Company Information</h5>
                        <div className="row g-3 mb-4">
                            <div className="col-md-7">
                                <label className="form-label fw-semibold small">Company / Business Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Apex Technologies Pvt Ltd"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-5">
                                <label className="form-label fw-semibold small">GSTIN / Tax ID</label>
                                <input
                                    type="text"
                                    name="gstin"
                                    className="form-control"
                                    placeholder="22AAAAA0000A1Z5"
                                    value={formData.gstin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold small">Company Logo</label>
                                <div className="d-flex gap-3 align-items-center">
                                    {formData.logo ? (
                                        <img
                                            src={formData.logo}
                                            alt="Preview"
                                            className="rounded border p-1 object-fit-contain shadow-sm"
                                            style={{ width: 64, height: 64, background: "#fff" }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded border d-flex align-items-center justify-content-center text-muted bg-light"
                                            style={{ width: 64, height: 64 }}
                                        >
                                            No Logo
                                        </div>
                                    )}
                                    <div className="flex-grow-1">
                                        <input
                                            type="text"
                                            name="logo"
                                            className="form-control mb-2 form-control-sm"
                                            placeholder="Paste Logo Image URL or..."
                                            value={formData.logo}
                                            onChange={handleChange}
                                        />
                                        <label className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 cursor-pointer">
                                            <FaUpload size={12} /> Upload Image File
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold small">Business Address</label>
                                <textarea
                                    name="address"
                                    className="form-control"
                                    rows="2"
                                    placeholder="Street, City, State, Pin / Zip Code"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="form-control"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="billing@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    className="form-control"
                                    placeholder="www.company.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Section 2: Banking & Payment Info */}
                        <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">2. Payment & Banking Details</h5>
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small">Currency Symbol</label>
                                <select
                                    name="currency"
                                    className="form-select"
                                    value={formData.currency}
                                    onChange={handleChange}
                                >
                                    <option value="₹">₹ (INR - Rupee)</option>
                                    <option value="$">$ (USD / CAD / AUD)</option>
                                    <option value="€">€ (EUR - Euro)</option>
                                    <option value="£">£ (GBP - Pound)</option>
                                    <option value="AED">AED (Dirham)</option>
                                    <option value="¥">¥ (JPY / CNY)</option>
                                </select>
                            </div>

                            <div className="col-md-5">
                                <label className="form-label fw-semibold small">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    className="form-control"
                                    placeholder="e.g. HDFC Bank Ltd"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Account Number</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    className="form-control"
                                    placeholder="Bank Account Number"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">IFSC / Routing / Swift Code</label>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    className="form-control"
                                    placeholder="HDFC0001234"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">UPI ID / Payment Link</label>
                                <input
                                    type="text"
                                    name="upiId"
                                    className="form-control"
                                    placeholder="company@upi or payment link"
                                    value={formData.upiId}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Section 3: Billing Defaults */}
                        <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">3. Invoice Defaults</h5>
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Default Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="taxPercentage"
                                    className="form-control"
                                    value={formData.taxPercentage}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Invoice Number Prefix</label>
                                <input
                                    type="text"
                                    name="invoicePrefix"
                                    className="form-control"
                                    placeholder="e.g. INV, APX"
                                    value={formData.invoicePrefix}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold small">Default Terms & Conditions</label>
                                <textarea
                                    name="invoiceTerms"
                                    className="form-control"
                                    rows="3"
                                    value={formData.invoiceTerms}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold small">Default Notes to Customer</label>
                                <textarea
                                    name="notes"
                                    className="form-control"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Section 4: Email & SMTP Server Settings */}
                        <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">4. Real Email & SMTP Dispatch Setup</h5>
                        <div className="p-3 bg-light rounded-3 border mb-4">
                            <div className="small text-muted mb-3">
                                Configure your SMTP server (such as Gmail) so invoices can be sent automatically from the platform directly to customer inboxes.
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">SMTP Host</label>
                                    <input
                                        type="text"
                                        name="smtpHost"
                                        className="form-control"
                                        placeholder="smtp.gmail.com"
                                        value={formData.smtpHost}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">SMTP Port</label>
                                    <input
                                        type="number"
                                        name="smtpPort"
                                        className="form-control"
                                        placeholder="587"
                                        value={formData.smtpPort}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">SMTP Email / Username</label>
                                    <input
                                        type="email"
                                        name="smtpUsername"
                                        className="form-control"
                                        placeholder="yourcompany@gmail.com"
                                        value={formData.smtpUsername}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Google App Password (16-char)</label>
                                    <input
                                        type="password"
                                        name="smtpPassword"
                                        className="form-control"
                                        placeholder="xxxx xxxx xxxx xxxx"
                                        value={formData.smtpPassword}
                                        onChange={handleChange}
                                    />
                                    <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                                        For Gmail: generate an App Password at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Google App Passwords</a>.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="d-flex justify-content-end gap-2">
                            {isNew && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4"
                                    onClick={() => setPage("dashboard")}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary px-5 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                                disabled={saving}
                            >
                                <FaSave /> {saving ? "Saving..." : isNew ? "Create Company" : "Save Company Settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CompanySetup;