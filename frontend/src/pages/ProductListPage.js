import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import {
    getProductsByBusiness,
    createProduct,
    updateProduct,
    deleteProduct
} from "../services/api";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaBoxes
} from "react-icons/fa";

function ProductListPage({ setPage }) {
    const { activeCompany } = useCompany();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hsnCode: "",
        unit: "pcs",
        rate: "",
        taxRate: 18
    });

    const currency = activeCompany?.currency || "₹";

    const fetchProducts = async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getProductsByBusiness(activeCompany.id);
            setProducts(data);
        } catch (err) {
            console.error("Error loading products:", err);
            setError("Could not load product catalog.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCompany?.id]);

    const handleOpenAdd = () => {
        setEditingProductId(null);
        setFormData({
            name: "",
            description: "",
            hsnCode: "",
            unit: "pcs",
            rate: "",
            taxRate: activeCompany?.taxPercentage || 18
        });
        setShowModal(true);
    };

    const handleOpenEdit = (prod) => {
        setEditingProductId(prod.id);
        setFormData({
            name: prod.name || "",
            description: prod.description || "",
            hsnCode: prod.hsnCode || "",
            unit: prod.unit || "pcs",
            rate: prod.rate || "",
            taxRate: prod.taxRate || 18
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.rate === "") return;

        const payload = {
            ...formData,
            rate: parseFloat(formData.rate) || 0,
            taxRate: parseFloat(formData.taxRate) || 0
        };

        try {
            if (editingProductId) {
                await updateProduct(editingProductId, payload);
            } else {
                await createProduct(activeCompany.id, payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error("Error saving product:", err);
            alert("Failed to save product.");
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
            return;
        }
        try {
            await deleteProduct(id);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Could not delete product.");
        }
    };

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Product & Service Catalog</h2>
                    <p className="text-muted small mb-0">
                        Manage items, pricing rates, units, and tax rates for {activeCompany?.name}
                    </p>
                </div>

                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
                    onClick={handleOpenAdd}
                >
                    <FaPlus size={13} /> + Add Item / Product
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Products Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Item Name</th>
                                <th>Description</th>
                                <th>HSN / SAC</th>
                                <th>Unit</th>
                                <th className="text-end">Default Rate ({currency})</th>
                                <th className="text-center">Tax %</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        Loading product catalog...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <FaBoxes size={36} className="text-muted mb-2 d-block mx-auto" />
                                        No items in catalog yet.
                                        <div className="mt-3">
                                            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                                                Add Your First Product / Service
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id}>
                                        <td className="ps-3 fw-bold text-dark">
                                            {p.name}
                                        </td>
                                        <td className="text-muted small">
                                            {p.description || "-"}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-secondary border">
                                                {p.hsnCode || "N/A"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary-subtle text-secondary">
                                                {p.unit || "pcs"}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold text-primary">
                                            {currency}{(parseFloat(p.rate) || 0).toFixed(2)}
                                        </td>
                                        <td className="text-center small text-muted">
                                            {p.taxRate || 0}%
                                        </td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    title="Edit Product"
                                                    onClick={() => handleOpenEdit(p)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    title="Delete Product"
                                                    onClick={() => handleDelete(p.id, p.name)}
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

            {/* Add / Edit Product Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {editingProductId ? "Edit Item" : "Add Product / Service"}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Item / Service Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Toughened Glass, Consultation..."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Optional item details or specifications"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Unit Rate ({currency}) *</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control"
                                                placeholder="0.00"
                                                value={formData.rate}
                                                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Unit</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="pcs, sqft, meter, hrs"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">HSN / SAC Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 7007, 9983"
                                                value={formData.hsnCode}
                                                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control"
                                                value={formData.taxRate}
                                                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProductId ? "Update Product" : "Save Product"}
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

export default ProductListPage;
