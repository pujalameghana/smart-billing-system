import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";

// Components
import Navbar from "./components/Navbar";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import BillingPage from "./pages/BillingPage";
import InvoiceViewPage from "./pages/InvoiceViewPage";
import CustomerListPage from "./pages/CustomerListPage";
import ProductListPage from "./pages/ProductListPage";
import CompanySetup from "./pages/CompanySetup";
import TemplateBuilder from "./pages/TemplateBuilder";
import TemplateList from "./pages/TemplateList";
import AdminPortalPage from "./pages/AdminPortalPage";

import "./App.css";

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [authView, setAuthView] = useState("login"); // "login" or "register"

    // Navigation state
    const [page, setPage] = useState("dashboard");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [editInvoiceId, setEditInvoiceId] = useState(null);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Unauthenticated Views
    if (!isAuthenticated) {
        if (authView === "register") {
            return <RegisterPage onNavigateLogin={() => setAuthView("login")} />;
        }
        return <LoginPage onNavigateRegister={() => setAuthView("register")} />;
    }

    // Authenticated App Shell
    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            {/* Top Navigation */}
            <Navbar currentPage={page} setPage={setPage} />

            {/* Main Content Area */}
            <main className="flex-grow-1">
                {page === "dashboard" && (
                    <DashboardPage
                        setPage={setPage}
                        setSelectedInvoiceId={setSelectedInvoiceId}
                    />
                )}

                {page === "invoices" && (
                    <InvoiceListPage
                        setPage={setPage}
                        setSelectedInvoiceId={setSelectedInvoiceId}
                        setEditInvoiceId={setEditInvoiceId}
                    />
                )}

                {page === "billing-new" && (
                    <BillingPage
                        editInvoiceId={editInvoiceId}
                        setPage={setPage}
                        setSelectedInvoiceId={setSelectedInvoiceId}
                    />
                )}

                {page === "invoice-view" && (
                    <InvoiceViewPage
                        invoiceId={selectedInvoiceId}
                        setPage={setPage}
                        setEditInvoiceId={setEditInvoiceId}
                    />
                )}

                {page === "customers" && (
                    <CustomerListPage setPage={setPage} />
                )}

                {page === "products" && (
                    <ProductListPage setPage={setPage} />
                )}

                {page === "templates" && (
                    <TemplateList setPage={setPage} />
                )}

                {page === "template-builder" && (
                    <TemplateBuilder setPage={setPage} />
                )}

                {page === "company" && (
                    <CompanySetup isNew={false} setPage={setPage} />
                )}

                {page === "company-new" && (
                    <CompanySetup isNew={true} setPage={setPage} />
                )}

                {page === "admin-portal" && (
                    <AdminPortalPage setPage={setPage} />
                )}
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CompanyProvider>
                <AppContent />
            </CompanyProvider>
        </AuthProvider>
    );
}

export default App;