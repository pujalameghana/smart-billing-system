import React, { useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { createTemplate } from "../services/api";
import { FaPalette, FaSave, FaArrowLeft, FaCheck } from "react-icons/fa";

const TemplateBuilder = ({ setPage }) => {
    const { activeCompany } = useCompany();

    const [templateName, setTemplateName] = useState("");
    const [theme, setTheme] = useState("modern");
    const [primaryColor, setPrimaryColor] = useState("#0d6efd");

    const [fields, setFields] = useState({
        showLogo: true,
        showBusinessName: true,
        showAddress: true,
        showGstin: true,
        showPhone: true,
        showEmail: true,
        showWebsite: true,

        showCustomerName: true,
        showCustomerPhone: true,
        showCustomerAddress: true,

        showProduct: true,
        showQuantity: true,
        showRate: true,
        showAmount: true,

        showTotal: true,
        showTaxBreakdown: true,
        showBankDetails: true,
        showSignature: true
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleToggle = (field) => {
        setFields({
            ...fields,
            [field]: !fields[field]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!activeCompany?.id) {
            setError("No active company selected.");
            return;
        }

        if (!templateName.trim()) {
            setError("Please enter a template name.");
            return;
        }

        setSaving(true);
        try {
            await createTemplate(activeCompany.id, {
                templateName: templateName.trim(),
                theme,
                primaryColor,
                ...fields
            });
            setMessage("Invoice template saved successfully!");
            setTemplateName("");
            if (setPage) setPage("templates");
        } catch (err) {
            console.error("Error saving template:", err);
            setError("Unable to save template.");
        } finally {
            setSaving(false);
        }
    };

    const colorPresets = [
        { name: "Royal Blue", hex: "#0d6efd" },
        { name: "Forest Green", hex: "#198754" },
        { name: "Deep Indigo", hex: "#6610f2" },
        { name: "Crimson Red", hex: "#dc3545" },
        { name: "Dark Slate", hex: "#212529" },
        { name: "Teal Modern", hex: "#20c997" }
    ];

    return (
        <div className="container py-4 mb-5" style={{ maxWidth: "880px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage("templates")}>
                    <FaArrowLeft /> Back to Templates
                </button>
                <h3 className="fw-bold mb-0">Create Invoice Template</h3>
                <div style={{ width: 80 }}></div>
            </div>

            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-primary text-white p-4 rounded-top-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white text-primary rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                            <FaPalette size={22} />
                        </div>
                        <div>
                            <h4 className="fw-bold mb-0">Template Customizer</h4>
                            <p className="mb-0 opacity-75 small">
                                Customize styling, color scheme, and visible fields for {activeCompany?.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4 p-md-5">
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Name & Theme */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">Template Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Modern Minimalist or Client Invoice"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">Layout Theme</label>
                                <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                    <option value="modern">Modern Blue (Header Accent)</option>
                                    <option value="classic">Classic Corporate (Formal Border)</option>
                                    <option value="minimal">Minimalist (Clean Typography)</option>
                                </select>
                            </div>
                        </div>

                        {/* Color Theme */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold small d-block">Primary Accent Color</label>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                {colorPresets.map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        className="btn btn-sm d-flex align-items-center gap-1 border"
                                        style={{
                                            backgroundColor: c.hex,
                                            color: "#fff",
                                            boxShadow: primaryColor === c.hex ? "0 0 0 3px rgba(0,0,0,0.2)" : "none"
                                        }}
                                        onClick={() => setPrimaryColor(c.hex)}
                                    >
                                        {primaryColor === c.hex && <FaCheck size={10} />}
                                        {c.name}
                                    </button>
                                ))}
                                <input
                                    type="color"
                                    className="form-control form-control-color border"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    title="Choose custom color"
                                />
                            </div>
                        </div>

                        {/* Field Visibility Toggles */}
                        <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">Visible Fields Configuration</h5>

                        <div className="row g-4 mb-4">
                            {/* Company Fields */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded border h-100">
                                    <div className="fw-bold small text-uppercase text-muted mb-3">Company Header Fields</div>
                                    <ToggleSwitch label="Company Logo" checked={fields.showLogo} onChange={() => handleToggle("showLogo")} />
                                    <ToggleSwitch label="Business Name" checked={fields.showBusinessName} onChange={() => handleToggle("showBusinessName")} />
                                    <ToggleSwitch label="Business Address" checked={fields.showAddress} onChange={() => handleToggle("showAddress")} />
                                    <ToggleSwitch label="GSTIN / Tax ID" checked={fields.showGstin} onChange={() => handleToggle("showGstin")} />
                                    <ToggleSwitch label="Phone Number" checked={fields.showPhone} onChange={() => handleToggle("showPhone")} />
                                    <ToggleSwitch label="Email Address" checked={fields.showEmail} onChange={() => handleToggle("showEmail")} />
                                    <ToggleSwitch label="Website" checked={fields.showWebsite} onChange={() => handleToggle("showWebsite")} />
                                </div>
                            </div>

                            {/* Customer & Items */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded border h-100">
                                    <div className="fw-bold small text-uppercase text-muted mb-3">Customer & Billing Fields</div>
                                    <ToggleSwitch label="Customer Name" checked={fields.showCustomerName} onChange={() => handleToggle("showCustomerName")} />
                                    <ToggleSwitch label="Customer Phone" checked={fields.showCustomerPhone} onChange={() => handleToggle("showCustomerPhone")} />
                                    <ToggleSwitch label="Customer Address" checked={fields.showCustomerAddress} onChange={() => handleToggle("showCustomerAddress")} />
                                    <ToggleSwitch label="Product Item Column" checked={fields.showProduct} onChange={() => handleToggle("showProduct")} />
                                    <ToggleSwitch label="Quantity Column" checked={fields.showQuantity} onChange={() => handleToggle("showQuantity")} />
                                    <ToggleSwitch label="Rate Column" checked={fields.showRate} onChange={() => handleToggle("showRate")} />
                                    <ToggleSwitch label="Amount Column" checked={fields.showAmount} onChange={() => handleToggle("showAmount")} />
                                </div>
                            </div>

                            {/* Footer & Totals */}
                            <div className="col-12">
                                <div className="p-3 bg-light rounded border">
                                    <div className="fw-bold small text-uppercase text-muted mb-3">Summary & Footer Fields</div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ToggleSwitch label="Total Amount Block" checked={fields.showTotal} onChange={() => handleToggle("showTotal")} />
                                            <ToggleSwitch label="Tax Breakdown" checked={fields.showTaxBreakdown} onChange={() => handleToggle("showTaxBreakdown")} />
                                        </div>
                                        <div className="col-md-6">
                                            <ToggleSwitch label="Bank & UPI Payment Details" checked={fields.showBankDetails} onChange={() => handleToggle("showBankDetails")} />
                                            <ToggleSwitch label="Authorized Signatory Block" checked={fields.showSignature} onChange={() => handleToggle("showSignature")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setPage("templates")}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-5 fw-semibold shadow-sm d-flex align-items-center gap-2" disabled={saving}>
                                <FaSave /> {saving ? "Saving..." : "Save Template"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="form-check form-switch mb-2">
        <input className="form-check-input" type="checkbox" checked={checked} onChange={onChange} id={label} />
        <label className="form-check-label small" htmlFor={label}>
            {label}
        </label>
    </div>
);

export default TemplateBuilder;