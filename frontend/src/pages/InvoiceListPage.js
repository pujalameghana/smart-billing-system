import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import {
    getInvoicesByBusiness,
    updateInvoiceStatus,
    deleteInvoice
} from "../services/api";
import {
    FaPlus,
    FaSearch,
    FaEye,
    FaTrash,
    FaEdit,
    FaCheckCircle,
    FaFileInvoiceDollar
} from "react-icons/fa";

function InvoiceListPage({ setPage, setSelectedInvoiceId, setEditInvoiceId }) {
    const { activeCompany } = useCompany();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    const currency = activeCompany?.currency || "₹";

    const fetchInvoices = async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getInvoicesByBusiness(activeCompany.id, statusFilter, searchQuery);
            setInvoices(data);
        } catch (err) {
            console.error("Error loading invoices:", err);
            setError("Failed to load invoices.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCompany?.id, statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchInvoices();
    };

    const handleMarkPaid = async (id) => {
        try {
            await updateInvoiceStatus(id, "PAID");
            fetchInvoices();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Unable to update status.");
        }
    };

    const handleDelete = async (id, invoiceNumber) => {
        if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
            return;
        }
        try {
            await deleteInvoice(id);
            fetchInvoices();
        } catch (err) {
            console.error("Error deleting invoice:", err);
            alert("Could not delete invoice.");
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

    return (
        <div className="container-fluid px-4 py-4">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Invoices</h2>
                    <p className="text-muted small mb-0">
                        Create, track, and manage invoices for {activeCompany?.name}
                    </p>
                </div>

                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
                    onClick={() => {
                        setEditInvoiceId(null);
                        setPage("billing-new");
                    }}
                >
                    <FaPlus size={13} /> + Create Invoice
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Filter & Search Bar */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center justify-content-between">
                        {/* Status Tabs */}
                        <div className="col-12 col-md-7">
                            <div className="btn-group btn-group-sm flex-wrap" role="group">
                                {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        className={`btn ${statusFilter === st ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => setStatusFilter(st)}
                                    >
                                        {st === "ALL" ? "All Invoices" : st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="col-12 col-md-5">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by invoice #, customer name, phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button className="btn btn-primary" type="submit">
                                        <FaSearch />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices List Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Due Date</th>
                                <th className="text-end">Subtotal</th>
                                <th className="text-end">Tax</th>
                                <th className="text-end">Total</th>
                                <th className="text-center">Status</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">
                                        <FaFileInvoiceDollar size={36} className="text-muted mb-2 d-block mx-auto" />
                                        No invoices found matching the selected filter.
                                        <div className="mt-3">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                    setEditInvoiceId(null);
                                                    setPage("billing-new");
                                                }}
                                            >
                                                Create New Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="ps-3">
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 fw-bold text-decoration-none text-primary"
                                                onClick={() => {
                                                    setSelectedInvoiceId(inv.id);
                                                    setPage("invoice-view");
                                                }}
                                            >
                                                {inv.invoiceNumber}
                                            </button>
                                        </td>
                                        <td className="text-muted small">{inv.invoiceDate}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{inv.customerName || "Walk-in Customer"}</div>
                                            {inv.customerPhone && <div className="text-muted small">{inv.customerPhone}</div>}
                                        </td>
                                        <td className="text-muted small">{inv.dueDate || "-"}</td>
                                        <td className="text-end text-muted small">
                                            {currency}{inv.subtotal ? inv.subtotal.toFixed(2) : "0.00"}
                                        </td>
                                        <td className="text-end text-muted small">
                                            {currency}{inv.taxAmount ? inv.taxAmount.toFixed(2) : "0.00"}
                                        </td>
                                        <td className="text-end fw-bold text-dark">
                                            {currency}{inv.totalAmount ? inv.totalAmount.toFixed(2) : "0.00"}
                                        </td>
                                        <td className="text-center">{getStatusBadge(inv.status)}</td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    title="View & PDF"
                                                    onClick={() => {
                                                        setSelectedInvoiceId(inv.id);
                                                        setPage("invoice-view");
                                                    }}
                                                >
                                                    <FaEye /> View
                                                </button>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setEditInvoiceId(inv.id);
                                                        setPage("billing-new");
                                                    }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                {inv.status !== "PAID" && (
                                                    <button
                                                        className="btn btn-outline-success"
                                                        title="Mark Paid"
                                                        onClick={() => handleMarkPaid(inv.id)}
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-outline-danger"
                                                    title="Delete"
                                                    onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                                                >
                                                    <FaTrash />
                                                </button>
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

export default InvoiceListPage;
