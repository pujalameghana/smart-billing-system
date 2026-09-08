import React from "react";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import {
    FaFileInvoiceDollar,
    FaChartLine,
    FaUsers,
    FaBoxes,
    FaCog,
    FaSignOutAlt,
    FaPlus,
    FaPalette,
    FaBuilding,
    FaShieldAlt
} from "react-icons/fa";

function Navbar({ currentPage, setPage }) {
    const { user, logout } = useAuth();
    const { companies, activeCompany, setActiveCompany } = useCompany();
    const isAdmin = user?.role === "ROLE_ADMIN";

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm px-3 py-2">
            <div className="container-fluid">
                {/* Brand */}
                <button
                    type="button"
                    className="navbar-brand d-flex align-items-center gap-2 btn btn-link text-white text-decoration-none p-0 border-0"
                    onClick={() => setPage("dashboard")}
                >
                    <div className="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                        <FaFileInvoiceDollar size={20} />
                    </div>
                    <span className="fw-bold fs-5 tracking-wide">SmartBilling</span>
                </button>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMain"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMain">
                    {/* Active Company Selector */}
                    <div className="dropdown me-lg-4 my-2 my-lg-0">
                        <button
                            className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
                            type="button"
                            id="companyDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ minWidth: "180px", maxWidth: "260px" }}
                        >
                            <FaBuilding className="text-info" />
                            <span className="text-truncate">
                                {activeCompany ? activeCompany.name : "Select Company"}
                            </span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-dark shadow" aria-labelledby="companyDropdown">
                            <li className="dropdown-header text-uppercase small text-muted">Switch Company</li>
                            {companies && companies.map((comp) => (
                                <li key={comp.id}>
                                    <button
                                        type="button"
                                        className={`dropdown-item d-flex justify-content-between align-items-center ${
                                            activeCompany && activeCompany.id === comp.id ? "active" : ""
                                        }`}
                                        onClick={() => setActiveCompany(comp)}
                                    >
                                        <span className="text-truncate">{comp.name}</span>
                                        {activeCompany && activeCompany.id === comp.id && (
                                            <span className="badge bg-success ms-2">Active</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item text-info d-flex align-items-center gap-2"
                                    onClick={() => setPage("company-new")}
                                >
                                    <FaPlus size={12} /> Add New Company
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Navigation Links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "dashboard" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("dashboard")}
                            >
                                <FaChartLine /> Dashboard
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "invoices" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("invoices")}
                            >
                                <FaFileInvoiceDollar /> Invoices
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "customers" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("customers")}
                            >
                                <FaUsers /> Customers
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "products" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("products")}
                            >
                                <FaBoxes /> Products
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "templates" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("templates")}
                            >
                                <FaPalette /> Templates
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                    currentPage === "company" ? "active text-white fw-bold" : ""
                                }`}
                                onClick={() => setPage("company")}
                            >
                                <FaCog /> Settings
                            </button>
                        </li>

                        {isAdmin && (
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className={`nav-link btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                                        currentPage === "admin-portal" ? "active text-warning fw-bold" : "text-warning"
                                    }`}
                                    onClick={() => setPage("admin-portal")}
                                >
                                    <FaShieldAlt /> Admin Portal
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Right side CTA & User Profile */}
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-1 shadow-sm fw-semibold"
                            onClick={() => setPage("billing-new")}
                        >
                            <FaPlus size={12} /> + Create Invoice
                        </button>

                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle text-white d-flex align-items-center gap-2"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: 12 }}>
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="small">{user?.username || "User"}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" aria-labelledby="userDropdown">
                                <li className="dropdown-header">
                                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                                        <div className="fw-bold text-white">{user?.fullName || user?.username}</div>
                                        {isAdmin ? (
                                            <span className="badge bg-danger text-white font-monospace" style={{ fontSize: "10px" }}>Admin</span>
                                        ) : (
                                            <span className="badge bg-primary text-white font-monospace" style={{ fontSize: "10px" }}>Business</span>
                                        )}
                                    </div>
                                    <div className="small text-muted">{user?.email}</div>
                                </li>
                                {isAdmin && (
                                    <>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item text-warning d-flex align-items-center gap-2"
                                                onClick={() => setPage("admin-portal")}
                                            >
                                                <FaShieldAlt /> Platform Admin Portal
                                            </button>
                                        </li>
                                    </>
                                )}
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                                        onClick={logout}
                                    >
                                        <FaSignOutAlt /> Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
