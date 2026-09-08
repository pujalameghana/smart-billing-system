import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { getTemplatesByBusiness, deleteTemplate } from "../services/api";
import { FaPlus, FaPalette, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const TemplateList = ({ setPage }) => {
    const { activeCompany } = useCompany();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTemplates = async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getTemplatesByBusiness(activeCompany.id);
            setTemplates(data);
        } catch (err) {
            console.error("Error loading templates:", err);
            setError("Unable to load templates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCompany?.id]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete template "${name}"?`)) return;
        try {
            await deleteTemplate(id);
            loadTemplates();
        } catch (err) {
            console.error("Error deleting template:", err);
            alert("Could not delete template.");
        }
    };

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Invoice Templates</h2>
                    <p className="text-muted small mb-0">
                        Design and manage invoice layout styles for {activeCompany?.name}
                    </p>
                </div>

                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
                    onClick={() => setPage("template-builder")}
                >
                    <FaPlus size={13} /> + Create Template
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5 text-muted">Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <FaPalette size={42} className="text-muted mb-3 mx-auto" />
                    <h4>No custom templates yet</h4>
                    <p className="text-muted">
                        Invoices currently use the default modern layout. You can create customized templates with your company branding.
                    </p>
                    <div>
                        <button className="btn btn-primary btn-sm" onClick={() => setPage("template-builder")}>
                            Create Custom Template
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="col-12 col-md-6 col-xl-4">
                            <div className="card h-100 border-0 shadow-sm rounded-3">
                                <div
                                    className="card-header py-3 text-white d-flex justify-content-between align-items-center"
                                    style={{ backgroundColor: tpl.primaryColor || "#0d6efd" }}
                                >
                                    <h5 className="mb-0 fw-bold">{tpl.templateName}</h5>
                                    <span className="badge bg-white text-dark small text-capitalize">
                                        {tpl.theme || "Modern"}
                                    </span>
                                </div>
                                <div className="card-body p-3">
                                    <div className="small fw-bold text-muted mb-2 text-uppercase">Visible Elements:</div>
                                    <div className="row g-2 mb-3 small">
                                        <div className="col-6">
                                            <FieldBadge label="Logo" active={tpl.showLogo} />
                                            <FieldBadge label="Company Info" active={tpl.showBusinessName} />
                                            <FieldBadge label="GSTIN" active={tpl.showGstin} />
                                            <FieldBadge label="Client Address" active={tpl.showCustomerAddress} />
                                        </div>
                                        <div className="col-6">
                                            <FieldBadge label="Tax Details" active={tpl.showTaxBreakdown} />
                                            <FieldBadge label="Bank / UPI" active={tpl.showBankDetails} />
                                            <FieldBadge label="Signature" active={tpl.showSignature} />
                                            <FieldBadge label="Total Block" active={tpl.showTotal} />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top-0 d-flex justify-content-end p-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                        onClick={() => handleDelete(tpl.id, tpl.templateName)}
                                    >
                                        <FaTrash size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FieldBadge = ({ label, active }) => (
    <div className="d-flex align-items-center gap-1 text-muted mb-1">
        {active ? (
            <FaCheck size={11} className="text-success" />
        ) : (
            <FaTimes size={11} className="text-muted opacity-50" />
        )}
        <span className={active ? "text-dark" : "text-muted text-decoration-line-through"}>{label}</span>
    </div>
);

export default TemplateList;