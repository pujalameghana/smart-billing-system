import React, { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { getInvoice, updateInvoiceStatus, sendInvoiceEmailApi, updateBusiness } from "../services/api";
import { generateInvoicePDF } from "../components/InvoicePdf";
import {
    FaDownload,
    FaPrint,
    FaArrowLeft,
    FaEdit,
    FaCheckCircle,
    FaBuilding,
    FaPaperPlane,
    FaEnvelope,
    FaWhatsapp,
    FaCopy,
    FaExternalLinkAlt,
    FaCheck,
    FaInfoCircle,
    FaCog,
    FaKey
} from "react-icons/fa";

function InvoiceViewPage({ invoiceId, setPage, setEditInvoiceId }) {
    const { activeCompany, setActiveCompany } = useCompany();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Send to customer modal state
    const [showSendModal, setShowSendModal] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendSuccessMsg, setSendSuccessMsg] = useState("");
    const [sendErrorMsg, setSendErrorMsg] = useState("");
    const [showSmtpConfig, setShowSmtpConfig] = useState(false);
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");
    const [savingSmtp, setSavingSmtp] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const fetchInvoice = async () => {
        if (!invoiceId) return;
        setLoading(true);
        try {
            const data = await getInvoice(invoiceId);
            setInvoice(data);
        } catch (err) {
            console.error("Error loading invoice:", err);
            setError("Could not load invoice details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceId]);

    const handleMarkPaid = async () => {
        try {
            await updateInvoiceStatus(invoiceId, "PAID");
            fetchInvoice();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Could not mark invoice as paid.");
        }
    };

    const handleDownloadPdf = () => {
        if (!invoice) return;
        generateInvoicePDF(invoice, activeCompany);
    };

    const handlePrint = () => {
        window.print();
    };

    const openSendModal = () => {
        if (!invoice) return;
        const cur = invoice.currency || activeCompany?.currency || "₹";
        setRecipientEmail(invoice.customerEmail || "");
        setRecipientPhone(invoice.customerPhone || "");
        setEmailSubject(`Invoice #${invoice.invoiceNumber} from ${activeCompany?.name || "Company"} - Due: ${cur}${invoice.totalAmount}`);

        const itemsSummary = (invoice.items || [])
            .map((item, idx) => `  ${idx + 1}. ${item.productName} - ${cur}${item.amount}`)
            .join("\n");

        const paymentInfo = [
            activeCompany?.bankName ? `Bank: ${activeCompany.bankName}` : "",
            activeCompany?.accountNumber ? `A/C Number: ${activeCompany.accountNumber}` : "",
            activeCompany?.ifscCode ? `IFSC Code: ${activeCompany.ifscCode}` : "",
            activeCompany?.upiId ? `UPI ID: ${activeCompany.upiId}` : ""
        ].filter(Boolean).join("\n");

        const body = `Dear ${invoice.customerName || "Customer"},

Thank you for your business. Please find below the invoice summary from ${activeCompany?.name || "our company"}:

Invoice Number: #${invoice.invoiceNumber}
Invoice Date: ${invoice.invoiceDate}
Due Date: ${invoice.dueDate || "Due upon receipt"}
Total Amount Due: ${cur}${invoice.totalAmount}

Items Breakdown:
${itemsSummary}

${paymentInfo ? `\nPayment Instructions:\n${paymentInfo}\n` : ""}
If you have any questions, please contact us at ${activeCompany?.email || activeCompany?.phone || "support"}.

Warm regards,
${activeCompany?.name || "Billing Team"}`;

        setEmailMessage(body);
        setSendSuccessMsg("");
        setSendErrorMsg("");
        setSmtpUser(activeCompany?.smtpUsername || activeCompany?.email || "");
        setSmtpPass(activeCompany?.smtpPassword || "");
        setShowSendModal(true);
    };

    const handleSendPlatformEmail = async () => {
        if (!recipientEmail || !recipientEmail.includes("@")) {
            alert("Please enter a valid recipient email address.");
            return;
        }
        setSendingEmail(true);
        setSendErrorMsg("");
        setSendSuccessMsg("");
        try {
            const res = await sendInvoiceEmailApi(invoice.id, {
                recipientEmail,
                subject: emailSubject,
                message: emailMessage
            });
            if (res.delivered) {
                setSendSuccessMsg(res.message || `Real email successfully delivered to ${recipientEmail}!`);
                setInvoice(prev => ({ ...prev, status: "SENT" }));
            } else {
                setSendErrorMsg(res.message || "Email could not be delivered.");
                if (res.errorType === "SMTP_NOT_CONFIGURED" || res.errorType === "SMTP_SEND_FAILED") {
                    setShowSmtpConfig(true);
                }
            }
        } catch (err) {
            console.error("Send email error:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message || "Failed to deliver email.";
            setSendErrorMsg(msg);
            setShowSmtpConfig(true);
        } finally {
            setSendingEmail(false);
        }
    };

    const handleOpenMailto = () => {
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
        window.open(mailtoUrl, "_blank");
    };

    const handleOpenGmail = async () => {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
        window.open(gmailUrl, "_blank");
        try {
            await updateInvoiceStatus(invoice.id, "SENT");
            setInvoice(prev => ({ ...prev, status: "SENT" }));
        } catch (e) {
            console.error("Could not update status to SENT", e);
        }
    };

    const handleSaveQuickSmtp = async (e) => {
        e.preventDefault();
        if (!smtpUser || !smtpPass) {
            alert("Please enter your Gmail address and 16-character App Password.");
            return;
        }
        setSavingSmtp(true);
        setSendErrorMsg("");
        try {
            const updated = await updateBusiness(activeCompany.id, {
                ...activeCompany,
                smtpHost: "smtp.gmail.com",
                smtpPort: 587,
                smtpUsername: smtpUser.trim(),
                smtpPassword: smtpPass.trim(),
                smtpFromEmail: smtpUser.trim()
            });
            setActiveCompany(updated);
            setShowSmtpConfig(false);

            // Now immediately trigger real send with the newly saved credentials
            const res = await sendInvoiceEmailApi(invoice.id, {
                recipientEmail,
                subject: emailSubject,
                message: emailMessage
            });
            if (res.delivered) {
                setSendSuccessMsg(res.message || `Real email successfully delivered to ${recipientEmail}!`);
                setInvoice(prev => ({ ...prev, status: "SENT" }));
            } else {
                setSendErrorMsg(res.message);
            }
        } catch (err) {
            console.error("Save SMTP error:", err);
            setSendErrorMsg("Failed to save SMTP: " + err.message);
        } finally {
            setSavingSmtp(false);
        }
    };

    const handleShareWhatsApp = () => {
        const cleanPhone = (recipientPhone || "").replace(/[^0-9]/g, "");
        const cur = invoice.currency || activeCompany?.currency || "₹";
        const text = `Hello ${invoice.customerName || ""},\nHere is your invoice #${invoice.invoiceNumber} from ${activeCompany?.name || "our company"}.\nTotal Amount: ${cur}${invoice.totalAmount}.\nThank you!`;
        const waUrl = cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
    };

    const handleCopyShareLink = () => {
        const shareLink = `${window.location.origin}/?invoiceId=${invoice.id}`;
        navigator.clipboard.writeText(shareLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h3>Loading invoice preview...</h3>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="container py-5 text-center">
                <h4 className="text-danger">{error || "Invoice not found"}</h4>
                <button className="btn btn-outline-secondary mt-3" onClick={() => setPage("invoices")}>
                    Back to Invoices
                </button>
            </div>
        );
    }

    const currency = invoice.currency || activeCompany?.currency || "₹";

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Action Bar (Hidden when printing) */}
            <div className="d-print-none d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage("invoices")}>
                        <FaArrowLeft /> Back to Invoices
                    </button>
                    <h3 className="fw-bold mb-0">Invoice #{invoice.invoiceNumber}</h3>
                    <span
                        className={`badge ${
                            invoice.status === "PAID"
                                ? "bg-success"
                                : invoice.status === "SENT"
                                ? "bg-primary"
                                : invoice.status === "OVERDUE"
                                ? "bg-danger"
                                : "bg-secondary"
                        }`}
                    >
                        {invoice.status}
                    </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-success d-flex align-items-center gap-2 shadow-sm fw-semibold" onClick={openSendModal}>
                        <FaPaperPlane /> Send to Customer
                    </button>
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleDownloadPdf}>
                        <FaDownload /> Download PDF
                    </button>
                    <button className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={handlePrint}>
                        <FaPrint /> Print
                    </button>
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={() => {
                            setEditInvoiceId(invoice.id);
                            setPage("billing-new");
                        }}
                    >
                        <FaEdit /> Edit
                    </button>
                    {invoice.status !== "PAID" && (
                        <button className="btn btn-outline-success d-flex align-items-center gap-2" onClick={handleMarkPaid}>
                            <FaCheckCircle /> Mark as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="d-flex justify-content-center">
                <div
                    id="printable-invoice"
                    className="bg-white p-4 p-md-5 rounded-3 shadow border"
                    style={{
                        maxWidth: "850px",
                        width: "100%",
                        minHeight: "1000px",
                        color: "#212529"
                    }}
                >
                    {/* Header: Company & Invoice Info */}
                    <div className="d-flex justify-content-between align-items-start pb-4 mb-4 border-bottom border-2 border-primary">
                        <div className="d-flex gap-3">
                            {activeCompany?.logo ? (
                                <img
                                    src={activeCompany.logo}
                                    alt="Logo"
                                    className="object-fit-contain rounded"
                                    style={{ width: 70, height: 70 }}
                                />
                            ) : (
                                <div
                                    className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold fs-3"
                                    style={{ width: 70, height: 70 }}
                                >
                                    <FaBuilding />
                                </div>
                            )}
                            <div>
                                <h3 className="fw-bold text-primary mb-1">{activeCompany?.name}</h3>
                                <p className="text-muted small mb-0" style={{ maxWidth: "320px" }}>
                                    {activeCompany?.address}
                                </p>
                                <div className="text-muted small">
                                    {activeCompany?.phone && <div>Phone: {activeCompany.phone}</div>}
                                    {activeCompany?.email && <div>Email: {activeCompany.email}</div>}
                                    {activeCompany?.gstin && <div className="fw-semibold">GSTIN: {activeCompany.gstin}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="text-end">
                            <h1 className="fw-black tracking-wider text-uppercase text-secondary mb-1">INVOICE</h1>
                            <div className="fw-bold text-dark fs-5 mb-1">#{invoice.invoiceNumber}</div>
                            <div className="small text-muted">
                                <strong>Date:</strong> {invoice.invoiceDate}
                            </div>
                            {invoice.dueDate && (
                                <div className="small text-muted">
                                    <strong>Due Date:</strong> {invoice.dueDate}
                                </div>
                            )}
                            <div className="mt-2">
                                <span
                                    className={`badge px-3 py-1 ${
                                        invoice.status === "PAID"
                                            ? "bg-success"
                                            : invoice.status === "SENT"
                                            ? "bg-primary"
                                            : "bg-secondary"
                                    }`}
                                >
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info (Bill To) */}
                    <div className="row mb-4">
                        <div className="col-12 col-md-6">
                            <div className="text-uppercase small fw-bold text-primary mb-1">Bill To:</div>
                            <h5 className="fw-bold text-dark mb-1">{invoice.customerName}</h5>
                            {invoice.customerAddress && (
                                <p className="text-muted small mb-1" style={{ whiteSpace: "pre-line" }}>
                                    {invoice.customerAddress}
                                </p>
                            )}
                            {invoice.customerPhone && (
                                <div className="text-muted small">
                                    <strong>Phone:</strong> {invoice.customerPhone}
                                </div>
                            )}
                            {invoice.customerEmail && (
                                <div className="text-muted small">
                                    <strong>Email:</strong> {invoice.customerEmail}
                                </div>
                            )}
                            {invoice.customerGstin && (
                                <div className="text-muted small">
                                    <strong>GSTIN:</strong> {invoice.customerGstin}
                                </div>
                            )}
                        </div>

                        {/* Payment Method & Currency */}
                        <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
                            <div className="text-uppercase small fw-bold text-primary mb-1">Payment Method:</div>
                            <div className="fw-semibold text-dark">{invoice.paymentMethod || "Bank Transfer"}</div>
                            <div className="small text-muted mt-1">Currency: {currency}</div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered align-middle">
                            <thead className="table-primary text-white">
                                <tr>
                                    <th className="text-center" style={{ width: "40px" }}>#</th>
                                    <th>Item Description</th>
                                    <th className="text-center" style={{ width: "160px" }}>Dimensions / Qty</th>
                                    <th className="text-end" style={{ width: "120px" }}>Rate ({currency})</th>
                                    <th className="text-end" style={{ width: "130px" }}>Amount ({currency})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.items || []).map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="text-center text-muted small">{idx + 1}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{item.productName}</div>
                                            {item.description && (
                                                <div className="text-muted small">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="text-center small">
                                            {item.width && item.height ? (
                                                <span>
                                                    {item.width} × {item.height} ({item.nosSft || 1} nos)
                                                </span>
                                            ) : (
                                                <span>
                                                    {item.quantity} {item.unit || "pcs"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-end text-muted small">
                                            {(parseFloat(item.rate) || 0).toFixed(2)}
                                        </td>
                                        <td className="text-end fw-semibold text-dark">
                                            {(parseFloat(item.amount) || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary & Banking Details */}
                    <div className="row g-4 mb-4">
                        {/* Bank Details */}
                        <div className="col-12 col-md-6">
                            {(activeCompany?.bankName || activeCompany?.accountNumber || activeCompany?.upiId) && (
                                <div className="p-3 bg-light rounded border">
                                    <div className="fw-bold small text-uppercase text-primary mb-2">
                                        Bank & Payment Instructions
                                    </div>
                                    {activeCompany.bankName && (
                                        <div className="small text-muted">
                                            <strong>Bank:</strong> {activeCompany.bankName}
                                        </div>
                                    )}
                                    {activeCompany.accountNumber && (
                                        <div className="small text-muted">
                                            <strong>A/C Number:</strong> {activeCompany.accountNumber}
                                        </div>
                                    )}
                                    {activeCompany.ifscCode && (
                                        <div className="small text-muted">
                                            <strong>IFSC Code:</strong> {activeCompany.ifscCode}
                                        </div>
                                    )}
                                    {activeCompany.upiId && (
                                        <div className="small text-muted">
                                            <strong>UPI ID:</strong> {activeCompany.upiId}
                                        </div>
                                    )}
                                </div>
                            )}

                            {invoice.notes && (
                                <div className="mt-3">
                                    <div className="small fw-bold text-muted">Note:</div>
                                    <div className="small text-muted">{invoice.notes}</div>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="col-12 col-md-6">
                            <div className="p-3 bg-light rounded border">
                                <div className="d-flex justify-content-between mb-2 small text-muted">
                                    <span>Subtotal:</span>
                                    <span>{currency}{(parseFloat(invoice.subtotal) || 0).toFixed(2)}</span>
                                </div>

                                {invoice.discountAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 small text-success">
                                        <span>Discount:</span>
                                        <span>-{currency}{(parseFloat(invoice.discountAmount) || 0).toFixed(2)}</span>
                                    </div>
                                )}

                                {invoice.taxAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 small text-muted">
                                        <span>Tax ({invoice.taxRate || 18}%):</span>
                                        <span>{currency}{(parseFloat(invoice.taxAmount) || 0).toFixed(2)}</span>
                                    </div>
                                )}

                                {invoice.shippingFee > 0 && (
                                    <div className="d-flex justify-content-between mb-2 small text-muted">
                                        <span>Shipping / Extra:</span>
                                        <span>{currency}{(parseFloat(invoice.shippingFee) || 0).toFixed(2)}</span>
                                    </div>
                                )}

                                <hr className="my-2" />

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold fs-5 text-dark">Total Amount:</span>
                                    <span className="fw-bold fs-4 text-primary">
                                        {currency}{(parseFloat(invoice.totalAmount) || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Signature */}
                    <div className="row align-items-end pt-4 mt-4 border-top">
                        <div className="col-12 col-md-7">
                            {invoice.terms && (
                                <>
                                    <div className="small fw-bold text-dark mb-1">Terms & Conditions:</div>
                                    <p className="small text-muted mb-0" style={{ whiteSpace: "pre-line", fontSize: 11 }}>
                                        {invoice.terms}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="col-12 col-md-5 text-md-end mt-4 mt-md-0">
                            <div className="small text-dark mb-5">For <strong>{activeCompany?.name}</strong></div>
                            <div className="border-top d-inline-block pt-1" style={{ minWidth: "160px" }}>
                                <span className="small text-muted">Authorized Signatory</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Invoice to Customer Modal */}
            {showSendModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            {/* Modal Header */}
                            <div className="modal-header bg-primary text-white py-3 px-4">
                                <div className="d-flex align-items-center gap-2">
                                    <FaPaperPlane size={18} />
                                    <h5 className="modal-title fw-bold mb-0">
                                        Send Invoice #{invoice.invoiceNumber} to Customer
                                    </h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowSendModal(false)}
                                    disabled={sendingEmail}
                                />
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4">
                                {sendSuccessMsg && (
                                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3 shadow-sm" role="alert">
                                        <FaCheck size={18} />
                                        <div>
                                            <strong>Email Delivered!</strong> {sendSuccessMsg}
                                        </div>
                                    </div>
                                )}

                                {sendErrorMsg && (
                                    <div className="alert alert-warning py-2 mb-3 shadow-sm" role="alert">
                                        <div className="fw-bold d-flex align-items-center gap-2 mb-1">
                                            <FaInfoCircle /> Notice regarding Real Email Delivery:
                                        </div>
                                        <div className="small mb-1">{sendErrorMsg}</div>
                                        <div className="small text-muted">
                                            👉 <strong>Fastest Solution:</strong> Click the red <strong>"Open in Gmail"</strong> button below to send the real email instantly from your own account with zero configuration!
                                        </div>
                                    </div>
                                )}

                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Customer Recipient Email *</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted">
                                                <FaEnvelope size={13} />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="customer@client.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Customer Phone (for WhatsApp)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted">
                                                <FaWhatsapp size={14} className="text-success" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="+91 98765 43210"
                                                value={recipientPhone}
                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Email Subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold d-flex justify-content-between">
                                        <span>Invoice Message Body</span>
                                        <span className="text-muted fw-normal">Editable summary & payment details</span>
                                    </label>
                                    <textarea
                                        className="form-control font-monospace"
                                        rows="6"
                                        style={{ fontSize: "12.5px" }}
                                        value={emailMessage}
                                        onChange={(e) => setEmailMessage(e.target.value)}
                                    />
                                </div>

                                {/* Option 1: Send via Gmail (Recommended - 100% Real Email) */}
                                <div className="card border-danger border-2 rounded-3 mb-3 bg-light shadow-xs">
                                    <div className="card-body p-3">
                                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                                            <div>
                                                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                                    <span>🚀 Send via Gmail (Recommended)</span>
                                                    <span className="badge bg-danger text-white">100% Real Email</span>
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    Opens Gmail in your browser with <strong>{recipientEmail || "recipient"}</strong>, invoice items, and total amount pre-filled. Just click <strong>Send</strong> in Gmail!
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-danger px-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 text-nowrap shadow-sm"
                                                onClick={handleOpenGmail}
                                            >
                                                <FaExternalLinkAlt /> Open in Gmail
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Option 2: Automatic Server SMTP Dispatch */}
                                <div className="card border rounded-3 mb-3">
                                    <div className="card-body p-3">
                                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                                            <div>
                                                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                                    <span>⚡ Send via Server SMTP</span>
                                                    {activeCompany?.smtpUsername ? (
                                                        <span className="badge bg-success">Configured</span>
                                                    ) : (
                                                        <span className="badge bg-secondary text-white">App Password Needed</span>
                                                    )}
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    Dispatches directly from the backend server over SMTP protocol.
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                                    onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                                                >
                                                    <FaCog /> {showSmtpConfig ? "Hide Setup" : "SMTP Setup"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary px-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm text-nowrap"
                                                    onClick={handleSendPlatformEmail}
                                                    disabled={sendingEmail}
                                                >
                                                    <FaPaperPlane size={14} />
                                                    {sendingEmail ? "Sending..." : "Send via Server"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline SMTP Configuration Accordion */}
                                        {showSmtpConfig && (
                                            <form onSubmit={handleSaveQuickSmtp} className="mt-3 pt-3 border-top bg-light p-3 rounded-3">
                                                <div className="small fw-bold text-dark mb-2 d-flex align-items-center gap-1">
                                                    <FaKey className="text-warning" /> Gmail SMTP Configuration (for automated server sending):
                                                </div>
                                                <div className="row g-2 mb-2">
                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label small fw-semibold mb-1">Your Gmail Address *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control form-control-sm"
                                                            placeholder="yourname@gmail.com"
                                                            value={smtpUser}
                                                            onChange={(e) => setSmtpUser(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label small fw-semibold mb-1">16-character App Password *</label>
                                                        <input
                                                            type="password"
                                                            className="form-control form-control-sm"
                                                            placeholder="xxxx xxxx xxxx xxxx"
                                                            value={smtpPass}
                                                            onChange={(e) => setSmtpPass(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="small text-muted mb-2" style={{ fontSize: "11.5px" }}>
                                                    ℹ️ <strong>Google Requirement:</strong> Google requires a 16-character <em>App Password</em> instead of your normal account password.
                                                    Generate one at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Google App Passwords</a>.
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-success btn-sm px-3 fw-semibold shadow-sm"
                                                    disabled={savingSmtp}
                                                >
                                                    {savingSmtp ? "Saving & Sending..." : "💾 Save Credentials & Send Now"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Multi-Channel Share Buttons */}
                                <div className="small fw-semibold text-muted text-uppercase mb-2" style={{ letterSpacing: "0.5px" }}>
                                    Or Share via Other Channels:
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                        onClick={handleOpenMailto}
                                    >
                                        <FaEnvelope /> Open Mail App
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                                        onClick={handleShareWhatsApp}
                                    >
                                        <FaWhatsapp /> Send on WhatsApp
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
                                        onClick={handleCopyShareLink}
                                    >
                                        <FaCopy /> {copiedLink ? "Link Copied!" : "Copy Customer Link"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 ms-auto"
                                        onClick={handleDownloadPdf}
                                    >
                                        <FaDownload /> Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer bg-light py-2 px-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowSendModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvoiceViewPage;
