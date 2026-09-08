import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import {
    getCustomersByBusiness,
    getProductsByBusiness,
    getNextInvoiceNumber,
    createInvoice,
    updateInvoice,
    getInvoice,
    createCustomer
} from "../services/api";
import {
    FaPlus,
    FaTrash,
    FaSave,
    FaEye,
    FaArrowLeft,
    FaUserPlus,
    FaCalculator
} from "react-icons/fa";

function BillingPage({ editInvoiceId, setPage, setSelectedInvoiceId }) {
    const { activeCompany } = useCompany();

    const currency = activeCompany?.currency || "₹";

    // Form State
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split("T")[0];
    });
    const [status, setStatus] = useState("SENT");
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [templateTheme, setTemplateTheme] = useState("modern");

    // Customer
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerGstin, setCustomerGstin] = useState("");

    // Quick New Customer Modal
    const [showNewCustModal, setShowNewCustModal] = useState(false);
    const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", companyName: "", billingAddress: "", gstin: "" });

    // Products catalog
    const [products, setProducts] = useState([]);

    // Line Items
    const [items, setItems] = useState([
        {
            productName: "",
            description: "",
            hsnCode: "",
            quantity: 1,
            unit: "pcs",
            width: "",
            height: "",
            nosSft: "",
            isDimensional: false,
            rate: 0,
            discount: 0,
            taxRate: 18,
            amount: 0
        }
    ]);

    // Financial Totals
    const [discountAmount, setDiscountAmount] = useState(0);
    const [taxRate, setTaxRate] = useState(activeCompany?.taxPercentage || 18);
    const [shippingFee, setShippingFee] = useState(0);
    const [notes, setNotes] = useState(activeCompany?.notes || "");
    const [terms, setTerms] = useState(activeCompany?.invoiceTerms || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load initial data
    useEffect(() => {
        if (!activeCompany?.id) return;

        // Fetch customers & products
        getCustomersByBusiness(activeCompany.id).then(setCustomers).catch(console.error);
        getProductsByBusiness(activeCompany.id).then(setProducts).catch(console.error);

        if (editInvoiceId) {
            // Load existing invoice for editing
            setLoading(true);
            getInvoice(editInvoiceId)
                .then((inv) => {
                    setInvoiceNumber(inv.invoiceNumber);
                    setInvoiceDate(inv.invoiceDate || "");
                    setDueDate(inv.dueDate || "");
                    setStatus(inv.status || "DRAFT");
                    setPaymentMethod(inv.paymentMethod || "Bank Transfer");
                    setTemplateTheme(inv.templateTheme || "modern");
                    setCustomerName(inv.customerName || "");
                    setCustomerPhone(inv.customerPhone || "");
                    setCustomerEmail(inv.customerEmail || "");
                    setCustomerAddress(inv.customerAddress || "");
                    setCustomerGstin(inv.customerGstin || "");
                    setDiscountAmount(inv.discountAmount || 0);
                    setTaxRate(inv.taxRate || 18);
                    setShippingFee(inv.shippingFee || 0);
                    setNotes(inv.notes || "");
                    setTerms(inv.terms || "");

                    if (inv.items && inv.items.length > 0) {
                        setItems(
                            inv.items.map((it) => ({
                                ...it,
                                isDimensional: !!(it.width && it.height)
                            }))
                        );
                    }
                })
                .catch((err) => {
                    console.error("Error loading invoice for edit:", err);
                    setError("Failed to load invoice for editing.");
                })
                .finally(() => setLoading(false));
        } else {
            // Generate next invoice number
            getNextInvoiceNumber(activeCompany.id)
                .then((res) => setInvoiceNumber(res.invoiceNumber))
                .catch(console.error);
        }
    }, [activeCompany?.id, editInvoiceId]);

    // Handle Customer Selection from Dropdown
    const handleSelectCustomer = (e) => {
        const custId = e.target.value;
        setSelectedCustomerId(custId);

        if (!custId) return;
        const found = customers.find((c) => String(c.id) === String(custId));
        if (found) {
            setCustomerName(found.name);
            setCustomerPhone(found.phone || "");
            setCustomerEmail(found.email || "");
            setCustomerAddress(found.billingAddress || "");
            setCustomerGstin(found.gstin || "");
        }
    };

    // Quick Add Customer
    const handleCreateQuickCustomer = async (e) => {
        e.preventDefault();
        if (!newCust.name.trim()) return;
        try {
            const saved = await createCustomer(activeCompany.id, newCust);
            setCustomers([...customers, saved]);
            setSelectedCustomerId(saved.id);
            setCustomerName(saved.name);
            setCustomerPhone(saved.phone || "");
            setCustomerEmail(saved.email || "");
            setCustomerAddress(saved.billingAddress || "");
            setCustomerGstin(saved.gstin || "");
            setShowNewCustModal(false);
            setNewCust({ name: "", phone: "", email: "", companyName: "", billingAddress: "", gstin: "" });
        } catch (err) {
            console.error("Error creating quick customer:", err);
            alert("Could not save customer.");
        }
    };

    // Calculate line item amount
    const calculateItemAmount = (item) => {
        let amount = 0;
        if (item.isDimensional && item.width > 0 && item.height > 0) {
            const factor = item.nosSft > 0 ? item.nosSft : 1;
            amount = item.width * item.height * factor * (parseFloat(item.rate) || 0);
        } else {
            const qty = item.quantity > 0 ? item.quantity : 1;
            amount = qty * (parseFloat(item.rate) || 0);
        }

        if (item.discount > 0) {
            amount = Math.max(0, amount - item.discount);
        }

        return Math.round(amount * 100) / 100;
    };

    // Update Item Field
    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        // If product was selected from dropdown, autofill
        if (field === "productName") {
            const matched = products.find((p) => p.name === value);
            if (matched) {
                updated[index].rate = matched.rate || 0;
                updated[index].unit = matched.unit || "pcs";
                updated[index].hsnCode = matched.hsnCode || "";
                updated[index].description = matched.description || "";
            }
        }

        updated[index].amount = calculateItemAmount(updated[index]);
        setItems(updated);
    };

    // Toggle Item Dimensional mode
    const toggleDimensional = (index) => {
        const updated = [...items];
        updated[index].isDimensional = !updated[index].isDimensional;
        updated[index].amount = calculateItemAmount(updated[index]);
        setItems(updated);
    };

    // Add Item
    const addItem = () => {
        setItems([
            ...items,
            {
                productName: "",
                description: "",
                hsnCode: "",
                quantity: 1,
                unit: "pcs",
                width: "",
                height: "",
                nosSft: "",
                isDimensional: false,
                rate: 0,
                discount: 0,
                taxRate: 18,
                amount: 0
            }
        ]);
    };

    // Remove Item
    const removeItem = (index) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    // Computed Totals
    const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const taxableSubtotal = Math.max(0, subtotal - (parseFloat(discountAmount) || 0));
    const taxAmount = Math.round(((taxableSubtotal * (parseFloat(taxRate) || 0)) / 100) * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + taxAmount + (parseFloat(shippingFee) || 0)) * 100) / 100;

    // Save Invoice
    const handleSave = async (andView = false) => {
        if (!customerName.trim()) {
            setError("Customer name is required.");
            return;
        }

        if (items.some((it) => !it.productName.trim() || it.rate <= 0)) {
            setError("Please ensure every item has a product name and a valid rate.");
            return;
        }

        setError("");
        setLoading(true);

        const payload = {
            invoiceNumber,
            invoiceDate,
            dueDate,
            status,
            paymentMethod,
            currency,
            templateTheme,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            customerGstin,
            subtotal,
            taxRate: parseFloat(taxRate) || 0,
            taxAmount,
            discountAmount: parseFloat(discountAmount) || 0,
            shippingFee: parseFloat(shippingFee) || 0,
            totalAmount: grandTotal,
            notes,
            terms,
            items: items.map((it) => ({
                productName: it.productName,
                description: it.description,
                hsnCode: it.hsnCode,
                quantity: parseFloat(it.quantity) || 1,
                unit: it.unit,
                width: it.isDimensional ? parseFloat(it.width) || null : null,
                height: it.isDimensional ? parseFloat(it.height) || null : null,
                nosSft: it.isDimensional ? parseFloat(it.nosSft) || null : null,
                rate: parseFloat(it.rate) || 0,
                discount: parseFloat(it.discount) || 0,
                taxRate: parseFloat(it.taxRate) || 0,
                amount: parseFloat(it.amount) || 0
            }))
        };

        try {
            let saved;
            if (editInvoiceId) {
                saved = await updateInvoice(editInvoiceId, payload);
            } else {
                saved = await createInvoice(activeCompany.id, payload, selectedCustomerId || null);
            }

            if (andView) {
                setSelectedInvoiceId(saved.id);
                setPage("invoice-view");
            } else {
                setPage("invoices");
            }
        } catch (err) {
            console.error("Error saving invoice:", err);
            setError(err.response?.data?.message || "Failed to save invoice.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Top Navigation / Breadcrumb */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage("invoices")}>
                        <FaArrowLeft /> Back to Invoices
                    </button>
                    <h2 className="fw-bold mb-0 text-dark">
                        {editInvoiceId ? `Edit Invoice #${invoiceNumber}` : "Create New Invoice"}
                    </h2>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => handleSave(false)}
                        disabled={loading}
                    >
                        <FaSave /> Save Invoice
                    </button>
                    <button
                        className="btn btn-primary shadow-sm"
                        onClick={() => handleSave(true)}
                        disabled={loading}
                    >
                        <FaEye /> Save & View PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
            )}

            <div className="row g-4">
                {/* Left Column: Form details */}
                <div className="col-12 col-lg-8">
                    {/* Invoice Meta */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3 text-primary">Invoice Details</h5>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold small">Invoice Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold small">Invoice Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold small">Due Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold small">Status</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="SENT">SENT</option>
                                        <option value="PAID">PAID</option>
                                        <option value="OVERDUE">OVERDUE</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Selection & Details */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0 text-primary">Customer (Bill To)</h5>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={() => setShowNewCustModal(true)}
                                >
                                    <FaUserPlus size={12} /> + Add Customer
                                </button>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small text-muted">Select Existing Customer (Optional)</label>
                                <select
                                    className="form-select"
                                    value={selectedCustomerId}
                                    onChange={handleSelectCustomer}
                                >
                                    <option value="">-- Choose from customer list or type below --</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.companyName ? `(${c.companyName})` : ""} - {c.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Customer Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Full name or company"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Contact phone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="customer@email.com"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">GSTIN / Tax ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Customer GSTIN"
                                        value={customerGstin}
                                        onChange={(e) => setCustomerGstin(e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-semibold small">Billing Address</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Street, City, State, Postal code"
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="fw-bold mb-0 text-primary">Invoice Items</h5>
                                    <p className="text-muted small mb-0">
                                        Supports standard quantity billing or dimensional area calculation (UPVC/Glass)
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                    onClick={addItem}
                                >
                                    <FaPlus size={12} /> Add Item
                                </button>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="p-3 mb-3 border rounded-3 bg-light position-relative">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-primary">Item #{index + 1}</span>
                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${item.isDimensional ? "btn-info text-white" : "btn-outline-secondary"}`}
                                                onClick={() => toggleDimensional(index)}
                                                title="Toggle Dimension Mode (Width x Height x Sft)"
                                            >
                                                <FaCalculator size={11} className="me-1" />
                                                {item.isDimensional ? "Dimensional Mode ON" : "Standard Qty Mode"}
                                            </button>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeItem(index)}
                                                    title="Remove Item"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row g-2">
                                        {/* Product selection or Name */}
                                        <div className="col-12 col-md-5">
                                            <label className="form-label small fw-semibold">Product / Description *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm mb-1"
                                                list={`product-options-${index}`}
                                                placeholder="Type or pick from catalog..."
                                                value={item.productName}
                                                onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                                                required
                                            />
                                            <datalist id={`product-options-${index}`}>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.name}>
                                                        {currency}{p.rate} / {p.unit}
                                                    </option>
                                                ))}
                                            </datalist>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-muted"
                                                placeholder="Additional item notes / specs..."
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                            />
                                        </div>

                                        {/* Dimensional Inputs */}
                                        {item.isDimensional ? (
                                            <>
                                                <div className="col-4 col-md-2">
                                                    <label className="form-label small fw-semibold">Width</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control form-control-sm"
                                                        placeholder="Width"
                                                        value={item.width}
                                                        onChange={(e) => handleItemChange(index, "width", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-4 col-md-2">
                                                    <label className="form-label small fw-semibold">Height</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control form-control-sm"
                                                        placeholder="Height"
                                                        value={item.height}
                                                        onChange={(e) => handleItemChange(index, "height", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-4 col-md-1">
                                                    <label className="form-label small fw-semibold">Nos</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control form-control-sm"
                                                        placeholder="Nos"
                                                        value={item.nosSft}
                                                        onChange={(e) => handleItemChange(index, "nosSft", e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-6 col-md-3">
                                                    <label className="form-label small fw-semibold">Quantity</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0.01"
                                                        className="form-control form-control-sm"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-6 col-md-2">
                                                    <label className="form-label small fw-semibold">Unit</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="pcs/kg/sqft"
                                                        value={item.unit}
                                                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Rate */}
                                        <div className="col-6 col-md-2">
                                            <label className="form-label small fw-semibold">Rate ({currency}) *</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control form-control-sm"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Calculated Amount */}
                                        <div className="col-6 col-md-2">
                                            <label className="form-label small fw-semibold text-end d-block">Amount</label>
                                            <div className="form-control form-control-sm bg-white fw-bold text-end text-primary">
                                                {currency}{item.amount ? item.amount.toFixed(2) : "0.00"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn btn-outline-success w-100 py-2 border-dashed"
                                onClick={addItem}
                            >
                                + Add Another Item
                            </button>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3 text-primary">Terms & Notes</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Customer Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g. Thanks for your business!"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small">Terms & Conditions</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g. 1. Due within 15 days..."
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Invoice Summary, Payment & Branding */}
                <div className="col-12 col-lg-4">
                    {/* Invoice Summary Card */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4 sticky-top" style={{ top: "80px" }}>
                        <div className="card-header bg-primary text-white py-3">
                            <h5 className="mb-0 fw-bold">Invoice Summary</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal:</span>
                                <span className="fw-semibold">{currency}{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Discount ({currency}):</span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    className="form-control form-control-sm text-end"
                                    style={{ width: "110px" }}
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Tax Rate (%):</span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    className="form-control form-control-sm text-end"
                                    style={{ width: "110px" }}
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tax Amount:</span>
                                <span className="fw-semibold text-muted">{currency}{taxAmount.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted">Shipping / Extra:</span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    className="form-control form-control-sm text-end"
                                    style={{ width: "110px" }}
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="fs-5 fw-bold text-dark">Grand Total:</span>
                                <span className="fs-4 fw-bold text-primary">{currency}{grandTotal.toFixed(2)}</span>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">Payment Method</label>
                                <select
                                    className="form-select"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                                    <option value="UPI">UPI / QR Code</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Card">Debit / Credit Card</option>
                                </select>
                            </div>

                            {/* Template Layout Theme */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold small">PDF Template Theme</label>
                                <select
                                    className="form-select"
                                    value={templateTheme}
                                    onChange={(e) => setTemplateTheme(e.target.value)}
                                >
                                    <option value="modern">Modern Blue (Recommended)</option>
                                    <option value="classic">Classic Corporate</option>
                                    <option value="minimal">Minimalist Clean</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary py-2 fw-semibold shadow-sm"
                                    onClick={() => handleSave(true)}
                                    disabled={loading}
                                >
                                    <FaEye className="me-2" /> Save & Preview PDF
                                </button>
                                <button
                                    className="btn btn-outline-secondary py-2"
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" /> Save Draft / Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Customer Modal */}
            {showNewCustModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">Quick Add Customer</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewCustModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateQuickCustomer}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Customer Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCust.name}
                                            onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCust.companyName}
                                            onChange={(e) => setNewCust({ ...newCust, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newCust.phone}
                                                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">GSTIN</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newCust.gstin}
                                                onChange={(e) => setNewCust({ ...newCust, gstin: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={newCust.billingAddress}
                                            onChange={(e) => setNewCust({ ...newCust, billingAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowNewCustModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save & Select
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

export default BillingPage;