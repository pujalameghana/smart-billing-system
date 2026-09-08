import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import {
    getCustomersByBusiness,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from "../services/api";
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaUsers
} from "react-icons/fa";

function CustomerListPage({ setPage }) {
    const { activeCompany } = useCompany();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        billingAddress: "",
        gstin: ""
    });

    const fetchCustomers = async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getCustomersByBusiness(activeCompany.id, search);
            setCustomers(data);
        } catch (err) {
            console.error("Error loading customers:", err);
            setError("Could not load customer directory.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCompany?.id]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCustomers();
    };

    const handleOpenAdd = () => {
        setEditingCustomerId(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            companyName: "",
            billingAddress: "",
            gstin: ""
        });
        setShowModal(true);
    };

    const handleOpenEdit = (customer) => {
        setEditingCustomerId(customer.id);
        setFormData({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            companyName: customer.companyName || "",
            billingAddress: customer.billingAddress || "",
            gstin: customer.gstin || ""
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (editingCustomerId) {
                await updateCustomer(editingCustomerId, formData);
            } else {
                await createCustomer(activeCompany.id, formData);
            }
            setShowModal(false);
            fetchCustomers();
        } catch (err) {
            console.error("Error saving customer:", err);
            alert("Failed to save customer.");
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
            return;
        }
        try {
            await deleteCustomer(id);
            fetchCustomers();
        } catch (err) {
            console.error("Error deleting customer:", err);
            alert("Could not delete customer.");
        }
    };

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Customer Directory</h2>
                    <p className="text-muted small mb-0">
                        Manage clients, billing contacts, and tax IDs for {activeCompany?.name}
                    </p>
                </div>

                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
                    onClick={handleOpenAdd}
                >
                    <FaPlus size={13} /> + Add Customer
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Search Bar */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <form onSubmit={handleSearch}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search customer by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button className="btn btn-primary" type="submit">
                                <FaSearch /> Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Customers Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Customer Name</th>
                                <th>Company</th>
                                <th>Contact Details</th>
                                <th>GSTIN / Tax ID</th>
                                <th>Address</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <FaUsers size={36} className="text-muted mb-2 d-block mx-auto" />
                                        No customers found.
                                        <div className="mt-3">
                                            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                                                Add Your First Customer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((c) => (
                                    <tr key={c.id}>
                                        <td className="ps-3">
                                            <div className="fw-bold text-dark">{c.name}</div>
                                        </td>
                                        <td>
                                            <div className="text-muted small">{c.companyName || "-"}</div>
                                        </td>
                                        <td>
                                            {c.phone && <div className="small text-dark">{c.phone}</div>}
                                            {c.email && <div className="small text-muted">{c.email}</div>}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {c.gstin || "N/A"}
                                            </span>
                                        </td>
                                        <td className="small text-muted" style={{ maxWidth: "220px" }}>
                                            {c.billingAddress || "-"}
                                        </td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    title="Edit Customer"
                                                    onClick={() => handleOpenEdit(c)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    title="Delete Customer"
                                                    onClick={() => handleDelete(c.id, c.name)}
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

            {/* Add / Edit Customer Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {editingCustomerId ? "Edit Customer" : "Add New Customer"}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Customer Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Client or Contact Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Organization or Firm"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="+91..."
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">GSTIN</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="GST number"
                                                value={formData.gstin}
                                                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="client@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Billing Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Billing Street, City, State..."
                                            value={formData.billingAddress}
                                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingCustomerId ? "Update Customer" : "Create Customer"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerListPage;
