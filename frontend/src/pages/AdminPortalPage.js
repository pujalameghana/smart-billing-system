import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import {
    getAdminOverview,
    getAdminUsers,
    getAdminBusinesses,
    deleteAdminUser
} from "../services/api";
import {
    FaShieldAlt,
    FaUsers,
    FaBuilding,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaSync,
    FaTrash,
    FaCheckCircle,
    FaSearch,
    FaArrowRight
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function AdminPortalPage({ setPage }) {
    const { user } = useAuth();
    const { setActiveCompany } = useCompany();

    const [overview, setOverview] = useState({
        totalUsers: 0,
        totalBusinesses: 0,
        totalInvoices: 0,
        totalPlatformRevenue: 0.0
    });
    const [users, setUsers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [activeTab, setActiveTab] = useState("businesses"); // "businesses" or "users"
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const isAdmin = user?.role === "ROLE_ADMIN";

    const fetchAdminData = async () => {
        setLoading(true);
        setError("");
        try {
            const [overviewData, usersData, businessesData] = await Promise.all([
                getAdminOverview(),
                getAdminUsers(),
                getAdminBusinesses()
            ]);
            setOverview(overviewData);
            setUsers(usersData);
            setBusinesses(businessesData);
        } catch (err) {
            console.error("Failed to load admin portal data:", err);
            setError(err.response?.data || "Failed to load platform data. Access denied or server error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
        }
    }, [isAdmin]);

    const handleDeleteUser = async (userId, username) => {
        if (userId === user?.id || username === "admin") {
            alert("Cannot delete the platform administrator account!");
            return;
        }
        if (!window.confirm(`Are you sure you want to remove user "${username}"? All associated companies and data may be affected.`)) {
            return;
        }

        try {
            await deleteAdminUser(userId);
            setActionMsg(`User "${username}" was successfully removed.`);
            setTimeout(() => setActionMsg(""), 4000);
            fetchAdminData();
        } catch (err) {
            console.error("Delete user error:", err);
            alert("Failed to delete user: " + (err.response?.data || err.message));
        }
    };

    const handleInspectCompany = (comp) => {
        setActiveCompany(comp);
        setPage("dashboard");
    };

    if (!isAdmin) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: "550px" }}>
                    <div className="text-danger mb-3">
                        <FaShieldAlt size={54} />
                    </div>
                    <h3 className="fw-bold text-dark">Access Restricted</h3>
                    <p className="text-muted">
                        This portal is strictly reserved for the Platform Administrator. Your account (<code>{user?.username}</code>) has the role <strong>{user?.role || "ROLE_USER"}</strong>.
                    </p>
                    <button className="btn btn-primary" onClick={() => setPage("dashboard")}>
                        Return to My Company Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const filteredBusinesses = businesses.filter((b) => {
        const query = searchQuery.toLowerCase();
        return (
            (b.name && b.name.toLowerCase().includes(query)) ||
            (b.ownerName && b.ownerName.toLowerCase().includes(query)) ||
            (b.ownerEmail && b.ownerEmail.toLowerCase().includes(query)) ||
            (b.email && b.email.toLowerCase().includes(query))
        );
    });

    const filteredUsers = users.filter((u) => {
        const query = searchQuery.toLowerCase();
        return (
            (u.username && u.username.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.fullName && u.fullName.toLowerCase().includes(query))
        );
    });

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Page Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-danger text-white px-2 py-1 small d-flex align-items-center gap-1">
                            <FaShieldAlt /> Platform Master Admin
                        </span>
                        <span className="text-muted small">&bull; Multi-Tenant Control Hub</span>
                    </div>
                    <h2 className="fw-bold text-dark mb-0">Platform Administration Portal</h2>
                    <p className="text-muted small mb-0">
                        Oversee all registered business accounts, tenant companies, invoices, and platform-wide revenue
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm"
                        onClick={fetchAdminData}
                        disabled={loading}
                    >
                        <FaSync className={loading ? "fa-spin" : ""} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {actionMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="alert">
                    <FaCheckCircle />
                    <span>{actionMsg}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 border-start border-4 border-primary">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Total Users</div>
                                <h3 className="fw-bold text-dark mb-0 mt-1">{overview.totalUsers}</h3>
                                <div className="small text-muted mt-1">Platform-wide registered accounts</div>
                            </div>
                            <div className="bg-primary-subtle text-primary p-3 rounded-circle">
                                <FaUsers size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 border-start border-4 border-info">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Registered Companies</div>
                                <h3 className="fw-bold text-dark mb-0 mt-1">{overview.totalBusinesses}</h3>
                                <div className="small text-muted mt-1">Active business tenants</div>
                            </div>
                            <div className="bg-info-subtle text-info p-3 rounded-circle">
                                <FaBuilding size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 border-start border-4 border-warning">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Total Invoices</div>
                                <h3 className="fw-bold text-dark mb-0 mt-1">{overview.totalInvoices}</h3>
                                <div className="small text-muted mt-1">Created across all tenants</div>
                            </div>
                            <div className="bg-warning-subtle text-warning p-3 rounded-circle">
                                <FaFileInvoiceDollar size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 border-start border-4 border-success">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-semibold text-uppercase">Platform Revenue</div>
                                <h3 className="fw-bold text-success mb-0 mt-1">
                                    ₹{(parseFloat(overview.totalPlatformRevenue) || 0).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </h3>
                                <div className="small text-muted mt-1">Settled / Paid invoices sum</div>
                            </div>
                            <div className="bg-success-subtle text-success p-3 rounded-circle">
                                <FaMoneyBillWave size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs and Search */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-white border-bottom p-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        {/* Tabs */}
                        <ul className="nav nav-pills gap-2">
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className={`nav-link fw-semibold d-flex align-items-center gap-2 ${
                                        activeTab === "businesses" ? "active" : "text-dark"
                                    }`}
                                    onClick={() => setActiveTab("businesses")}
                                >
                                    <FaBuilding /> Registered Businesses ({businesses.length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className={`nav-link fw-semibold d-flex align-items-center gap-2 ${
                                        activeTab === "users" ? "active" : "text-dark"
                                    }`}
                                    onClick={() => setActiveTab("users")}
                                >
                                    <FaUsers /> User Accounts ({users.length})
                                </button>
                            </li>
                        </ul>

                        {/* Search Bar */}
                        <div className="input-group" style={{ maxWidth: "320px" }}>
                            <span className="input-group-text bg-light text-muted border-end-0">
                                <FaSearch size={14} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 bg-light"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <div className="text-muted small mt-2">Loading platform data...</div>
                        </div>
                    ) : activeTab === "businesses" ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr>
                                        <th style={{ width: "60px" }} className="text-center">#</th>
                                        <th>Company / Business</th>
                                        <th>Owner Account</th>
                                        <th>Contact Info</th>
                                        <th>GSTIN</th>
                                        <th className="text-center">Invoices</th>
                                        <th className="text-end">Revenue</th>
                                        <th className="text-center" style={{ width: "120px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBusinesses.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                No businesses match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBusinesses.map((b, idx) => (
                                            <tr key={b.id}>
                                                <td className="text-center text-muted small">{idx + 1}</td>
                                                <td>
                                                    <div className="fw-bold text-dark">{b.name}</div>
                                                    <div className="small text-muted">ID: #{b.id} &bull; Currency: {b.currency || "₹"}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{b.ownerName}</div>
                                                    <div className="small text-muted">{b.ownerEmail}</div>
                                                </td>
                                                <td>
                                                    <div className="small text-dark">{b.email || "No email"}</div>
                                                    {b.phone && <div className="small text-muted">{b.phone}</div>}
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border font-monospace">
                                                        {b.gstin || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-primary-subtle text-primary px-2 py-1">
                                                        {b.invoiceCount} invoices
                                                    </span>
                                                </td>
                                                <td className="text-end fw-bold text-success">
                                                    {b.currency || "₹"}{(parseFloat(b.revenue) || 0).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 mx-auto"
                                                        onClick={() => handleInspectCompany(b)}
                                                        title="Switch to this company context"
                                                    >
                                                        <span>Inspect</span> <FaArrowRight size={10} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr>
                                        <th style={{ width: "60px" }} className="text-center">#</th>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Auth Provider</th>
                                        <th>Owned Businesses</th>
                                        <th>Joined Date</th>
                                        <th className="text-center" style={{ width: "100px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, idx) => (
                                            <tr key={u.id}>
                                                <td className="text-center text-muted small">{idx + 1}</td>
                                                <td>
                                                    <div className="fw-bold text-dark">{u.fullName || u.username}</div>
                                                    <div className="small text-muted">@{u.username}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark small">{u.email}</div>
                                                </td>
                                                <td>
                                                    {u.role === "ROLE_ADMIN" ? (
                                                        <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1">
                                                            <FaShieldAlt size={10} /> Platform Admin
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-primary-subtle text-primary">
                                                            Customer / Business
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {u.authProvider === "GOOGLE" ? (
                                                        <span className="badge bg-white text-dark border d-inline-flex align-items-center gap-1 shadow-xs">
                                                            <FcGoogle size={14} /> Google
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-light text-secondary border">
                                                            Email / Password
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {u.businesses && u.businesses.length > 0 ? (
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {u.businesses.map((bizName, bIdx) => (
                                                                <span key={bIdx} className="badge bg-light text-dark border small">
                                                                    {bizName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">None</span>
                                                    )}
                                                </td>
                                                <td className="small text-muted">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                                                </td>
                                                <td className="text-center">
                                                    {u.username !== "admin" && u.id !== user?.id && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm p-1 px-2"
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            title="Delete User"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPortalPage;
