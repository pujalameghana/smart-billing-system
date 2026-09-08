import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("billing_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized / expired tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            const isAuthRoute = error.config.url.includes("/auth/");
            if (!isAuthRoute) {
                localStorage.removeItem("billing_token");
                localStorage.removeItem("billing_user");
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

// ================= AUTH APIS =================
export const loginApi = (credentials) => api.post("/auth/login", credentials).then(res => res.data);
export const registerApi = (userData) => api.post("/auth/register", userData).then(res => res.data);
export const googleAuthApi = (googleData) => api.post("/auth/google", googleData).then(res => res.data);
export const getCurrentUserApi = () => api.get("/auth/me").then(res => res.data);

// ================= BUSINESS APIS =================
export const getBusinesses = () => api.get("/businesses").then(res => res.data);
export const getBusiness = (id) => api.get(`/businesses/${id}`).then(res => res.data);
export const createBusiness = (business) => api.post("/businesses", business).then(res => res.data);
export const updateBusiness = (id, business) => api.put(`/businesses/${id}`, business).then(res => res.data);
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`).then(res => res.data);

// ================= CUSTOMER APIS =================
export const getCustomersByBusiness = (businessId, search = "") =>
    api.get(`/customers/business/${businessId}${search ? `?search=${encodeURIComponent(search)}` : ""}`).then(res => res.data);
export const getCustomer = (id) => api.get(`/customers/${id}`).then(res => res.data);
export const createCustomer = (businessId, customer) => api.post(`/customers/business/${businessId}`, customer).then(res => res.data);
export const updateCustomer = (id, customer) => api.put(`/customers/${id}`, customer).then(res => res.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then(res => res.data);

// ================= PRODUCT APIS =================
export const getProductsByBusiness = (businessId) => api.get(`/products/business/${businessId}`).then(res => res.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(res => res.data);
export const createProduct = (businessId, product) => api.post(`/products/business/${businessId}`, product).then(res => res.data);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then(res => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(res => res.data);

// ================= INVOICE APIS =================
export const getInvoicesByBusiness = (businessId, status = "", search = "") => {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/invoices/business/${businessId}${queryString}`).then(res => res.data);
};
export const getInvoice = (id) => api.get(`/invoices/${id}`).then(res => res.data);
export const getNextInvoiceNumber = (businessId) => api.get(`/invoices/next-number/${businessId}`).then(res => res.data);
export const createInvoice = (businessId, invoice, customerId = null) => {
    const url = customerId
        ? `/invoices/business/${businessId}?customerId=${customerId}`
        : `/invoices/business/${businessId}`;
    return api.post(url, invoice).then(res => res.data);
};
export const updateInvoice = (id, invoice) => api.put(`/invoices/${id}`, invoice).then(res => res.data);
export const updateInvoiceStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status }).then(res => res.data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`).then(res => res.data);
export const sendInvoiceEmailApi = (id, payload) => api.post(`/invoices/${id}/send-email`, payload).then(res => res.data);

// ================= TEMPLATE APIS =================
export const getTemplatesByBusiness = (businessId) => api.get(`/templates/business/${businessId}`).then(res => res.data);
export const getTemplate = (id) => api.get(`/templates/${id}`).then(res => res.data);
export const createTemplate = (businessId, template) => api.post(`/templates/business/${businessId}`, template).then(res => res.data);
export const updateTemplate = (id, template) => api.put(`/templates/${id}`, template).then(res => res.data);
export const deleteTemplate = (id) => api.delete(`/templates/${id}`).then(res => res.data);

// ================= DASHBOARD APIS =================
export const getDashboardStats = (businessId) => api.get(`/dashboard/business/${businessId}`).then(res => res.data);

// ================= ADMIN PLATFORM APIS =================
export const getAdminOverview = () => api.get("/admin/overview").then(res => res.data);
export const getAdminUsers = () => api.get("/admin/users").then(res => res.data);
export const getAdminBusinesses = () => api.get("/admin/businesses").then(res => res.data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`).then(res => res.data);

export default api;