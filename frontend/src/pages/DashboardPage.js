import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { getDashboardStats, updateInvoiceStatus } from "../services/api";
import {
    FaMoneyBillWave,
    FaHourglassHalf,
    FaFileInvoice,
    FaUsers,
    FaPlus,
    FaEye,
    FaCheckCircle,
    FaArrowRight,
    FaBuilding
} from "react-icons/fa";

function DashboardPage({ setPage, setSelectedInvoiceId }) {
    const { activeCompany } = useCompany();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currency = activeCompany?.currency || "₹";

    const fetchStats = async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getDashboardStats(activeCompany.id);
            setStats(data);
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
            setError("Unable to load business metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCompany?.id]);

    const handleMarkPaid = async (invoiceId) => {
        try {
            await updateInvoiceStatus(invoiceId, "PAID");
            fetchStats();
        } catch (err) {
            console.error("Error updating invoice status:", err);
            alert("Could not update status.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PAID":
                return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">PAID</span>;
            case "SENT":
                return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">SENT</span>;
            case "OVERDUE":
                return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">OVERDUE</span>;
            default:
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">DRAFT</span>;
        }
    };

    if (!activeCompany) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow-sm p-5 max-w-md mx-auto">
                    <FaBuilding size={48} className="text-muted mb-3 mx-auto" />
                    <h4>No Company Selected</h4>
                    <p className="text-muted">Please configure or create a business profile to start invoicing.</p>
                    <button className="btn btn-primary mt-2" onClick={() => setPage("company-new")}>
                        + Add Your Company
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4">
            {/* Header / Welcome */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    {activeCompany.logo ? (
                        <img
                            src={activeCompany.logo}
                            alt="Logo"
                            className="rounded border shadow-sm object-fit-contain"
                            style={{ width: 52, height: 52, background: "#fff" }}
                        />
                    ) : (
                        <div
                            className="rounded bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: 52, height: 52, fontSize: 24, fontWeight: "bold" }}
                        >
                            {activeCompany.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h2 className="fw-bold mb-0 text-dark">{activeCompany.name}</h2>
                        <div className="text-muted small">
                            {activeCompany.gstin && <span className="me-3">GSTIN: {activeCompany.gstin}</span>}
                            {activeCompany.phone && <span>Phone: {activeCompany.phone}</span>}
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
                        onClick={() => setPage("billing-new")}
                    >
                        <FaPlus size={13} /> + New Invoice
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setPage("invoices")}
                    >
                        View All Invoices
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {/* Total Revenue */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-success">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Total Revenue</div>
                                <h3 className="fw-bold text-success mb-0 mt-1">
                                    {currency}{stats ? stats.totalRevenue.toLocaleString() : "0"}
                                </h3>
                                <div className="small text-muted mt-1">
                                    {stats ? stats.paidInvoicesCount : 0} paid invoices
                                </div>
                            </div>
                            <div className="bg-success-subtle text-success p-3 rounded-circle">
                                <FaMoneyBillWave size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Amount */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-warning">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Pending / Unpaid</div>
                                <h3 className="fw-bold text-warning mb-0 mt-1">
                                    {currency}{stats ? stats.pendingAmount.toLocaleString() : "0"}
                                </h3>
                                <div className="small text-muted mt-1">
                                    {stats ? stats.pendingInvoicesCount : 0} pending invoices
                                </div>
                            </div>
                            <div className="bg-warning-subtle text-warning p-3 rounded-circle">
                                <FaHourglassHalf size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Invoices */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-primary">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Total Invoices</div>
                                <h3 className="fw-bold text-primary mb-0 mt-1">
                                    {stats ? stats.totalInvoices : 0}
                                </h3>
                                <div className="small text-muted mt-1">
                                    {stats ? stats.overdueInvoicesCount : 0} overdue
                                </div>
                            </div>
                            <div className="bg-primary-subtle text-primary p-3 rounded-circle">
                                <FaFileInvoice size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customers & Products */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-info">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Clients & Catalog</div>
                                <h3 className="fw-bold text-dark mb-0 mt-1">
                                    {stats ? stats.totalCustomers : 0} <span className="fs-6 fw-normal text-muted">Clients</span>
                                </h3>
                                <div className="small text-muted mt-1">
                                    {stats ? stats.totalProducts : 0} items in catalog
                                </div>
                            </div>
                            <div className="bg-info-subtle text-info p-3 rounded-circle">
                                <FaUsers size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="card border-0 shadow-sm rounded-3 mb-4 bg-light">
                <div className="card-body p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <div className="fw-semibold text-muted small">Quick Shortcuts:</div>
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setPage("billing-new")}>
                            + Create Invoice
                        </button>
                        <button className="btn btn-outline-dark btn-sm" onClick={() => setPage("customers")}>
                            + Add Customer
                        </button>
                        <button className="btn btn-outline-dark btn-sm" onClick={() => setPage("products")}>
                            + Add Product/Service
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage("company")}>
                            ⚙️ Company Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-dark">Recent Invoices</h5>
                    <button
                        className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1"
                        onClick={() => setPage("invoices")}
                    >
                        View All Invoices <FaArrowRight size={12} />
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Due Date</th>
                                <th className="text-end">Amount</th>
                                <th className="text-center">Status</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        Loading recent invoices...
                                    </td>
                                </tr>
                            ) : !stats?.recentInvoices || stats.recentInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No invoices created yet for this company.
                                        <div className="mt-2">
                                            <button className="btn btn-primary btn-sm" onClick={() => setPage("billing-new")}>
                                                Create Your First Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="ps-3 fw-bold text-primary">
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="text-muted small">{inv.invoiceDate}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{inv.customerName || "Walk-in Customer"}</div>
                                            {inv.customerPhone && <div className="text-muted small">{inv.customerPhone}</div>}
                                        </td>
                                        <td className="text-muted small">{inv.dueDate || "-"}</td>
                                        <td className="text-end fw-bold">
                                            {currency}{inv.totalAmount ? inv.totalAmount.toLocaleString() : "0"}
                                        </td>
                                        <td className="text-center">{getStatusBadge(inv.status)}</td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    title="View & Print"
                                                    onClick={() => {
                                                        setSelectedInvoiceId(inv.id);
                                                        setPage("invoice-view");
                                                    }}
                                                >
                                                    <FaEye /> View
                                                </button>
                                                {inv.status !== "PAID" && (
                                                    <button
                                                        className="btn btn-outline-success"
                                                        title="Mark as Paid"
                                                        onClick={() => handleMarkPaid(inv.id)}
                                                    >
                                                        <FaCheckCircle /> Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
