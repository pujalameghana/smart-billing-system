# 💼 Smart Billing & Invoice Generator System

A complete enterprise-grade full-stack **Java (Spring Boot 3.2.5)** and **React 19** multi-tenant invoice and billing platform. It allows any business, company, or freelancer to register, configure their company branding and banking/UPI details, manage customers and product catalogs, generate professional dynamic invoices with dimensional area or standard billing, download vector-crisp PDFs, and send real invoices directly to customer inboxes.

---

## 🌟 Key Architecture & Capabilities

### 1. Dual-Mode Authentication & Role-Based Access Control (RBAC)
- **Continue with Google OR Email & Password**: Users can sign in with traditional email/password or use the interactive Google Sign-In dialog (pre-loaded with accounts or custom Gmail).
- **Auto-Tenant Provisioning**: Signing in with Google automatically provisions a dedicated business workspace and assigns `ROLE_USER`.
- **Platform Master Admin (`ROLE_ADMIN`)**:
  - Superadmin access (`admin` / `admin123`) with dedicated **Platform Admin Portal** (`/admin`).
  - Platform-wide telemetry: Total registered businesses, active users, system-wide invoices, and platform revenue.
  - Multi-tenant business oversight and directory.
- **Tenant Data Isolation (`ROLE_USER`)**:
  - Each business owner/customer is strictly partitioned within their own company workspace.
  - Data privacy: Users only access their own invoices, customers, catalogs, and financial stats.

### 2. Multi-Channel & Real Email Dispatch
- **🚀 1-Click Send via Gmail (100% Real Email Delivery)**:
  - Inside any invoice, click **"📧 Send to Customer"** &rarr; **"🚀 Open in Gmail"**.
  - Opens a Gmail compose window with recipient (`pujalameghana2005@gmail.com`), formatted subject, and line-item breakdown pre-filled.
  - Zero server configuration required; guaranteed delivery from your logged-in Google account.
- **⚙️ Automated Server SMTP Dispatch (`spring-boot-starter-mail`)**:
  - Backend [`EmailService.java`](backend/src/main/java/com/billingapp/service/EmailService.java) sends responsive HTML invoices over TLS (Port 587/465).
  - Per-company SMTP settings configured directly in the modal or under **Company Settings** (supports Gmail 16-character App Passwords).
- **WhatsApp & Shareable Link**: Instant 1-click sharing via WhatsApp Web/App and copyable customer invoice URLs.

### 3. Multi-Company & Branding Configuration
- **Company Profile**: Customize Company Name, Logo upload (stored as data URI), Address, GSTIN/Tax ID, Phone, Email, and Website.
- **Banking & UPI Details**: Configure Bank Name, Account Number, IFSC Code, and UPI ID (which automatically print onto every invoice for instant customer scan & pay).
- **Company Switching**: Switch seamlessly between multiple business entities from the top navigation bar.

### 4. Dynamic Billing Engine
- **Sequential Invoice Numbering**: Auto-incrementing numbering (e.g. `INV-2026-0001`, `APX-2026-0002`).
- **Dual Billing Modes**:
  - **Standard Quantity**: `Quantity × Rate`.
  - **Dimensional Area**: `Width × Height × Nos/Sft × Rate` (engineered for glass, UPVC, woodwork, tiles, and construction).
- **Tax & Discount Computations**: Auto-calculated subtotal, line-item discounts, GST %, shipping/other fees, and grand totals.
- **Vector PDF & Print Engine**: Crisp A4 PDF invoices using `jspdf` and `jspdf-autotable`, with responsive `@media print` styling.

---

## 📂 Complete Project Directory Structure

```
d:\smart-billing-system/
│
├── backend/                                   # Spring Boot 3.2.5 Java Backend
│   ├── pom.xml                                # Maven dependencies (Security, JWT, JPA, MySQL, Mail)
│   └── src/
│       └── main/
│           ├── java/com/billingapp/
│           │   ├── SmartBillingApplication.java  # Main application entry point
│           │   ├── controller/
│           │   │   ├── AuthController.java       # /api/auth (login, register, google-login, me)
│           │   │   ├── BusinessController.java   # /api/businesses (multi-tenant profile & SMTP settings)
│           │   │   ├── CustomerController.java   # /api/customers (CRUD directory)
│           │   │   ├── ProductController.java    # /api/products (CRUD catalog)
│           │   │   ├── InvoiceController.java    # /api/invoices (CRUD, status, send-email)
│           │   │   ├── DashboardController.java  # /api/dashboard (KPI metrics)
│           │   │   ├── AdminController.java      # /api/admin (Platform admin portal KPIs & directories)
│           │   │   └── TemplateController.java   # /api/templates (invoice themes)
│           │   ├── dto/                          # DTO request/response payloads
│           │   ├── model/
│           │   │   ├── User.java                 # User accounts & roles (ROLE_ADMIN, ROLE_USER)
│           │   │   ├── Business.java             # Company entity with banking & SMTP settings
│           │   │   ├── Customer.java             # Customer entity
│           │   │   ├── Product.java              # Product/service catalog entity
│           │   │   ├── Invoice.java              # Invoice header & financial totals
│           │   │   ├── InvoiceItem.java          # Standard & dimensional line items
│           │   │   └── InvoiceTemplate.java      # Template styling
│           │   ├── repository/                   # Spring Data JPA interfaces
│           │   ├── security/
│           │   │   ├── JwtUtil.java              # JJWT token generation & validation
│           │   │   ├── JwtAuthenticationFilter.java # Bearer token interception
│           │   │   ├── CustomUserDetailsService.java
│           │   │   └── SecurityConfig.java       # Security filter chain, CORS, password encoder
│           │   └── service/
│           │       ├── EmailService.java         # Dynamic JavaMailSender SMTP & HTML generator
│           │       ├── InvoiceService.java       # Sequential numbering, calculations, email dispatch
│           │       ├── DashboardService.java     # KPI aggregation
│           │       └── DataInitializer.java      # Demo accounts & seed data bootstrap
│           └── resources/
│               └── application.properties        # MySQL connection, JWT secrets, mail defaults
│
├── frontend/                                  # React 19 Single Page Application
│   ├── package.json                           # React, Bootstrap 5, Axios, React-Icons, jsPDF
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                             # React Router configuration & protected routes
│       ├── App.css                            # Global CSS, animations, and @media print rules
│       ├── index.js                           # Root entry point
│       ├── components/
│       │   ├── Navbar.js                      # Top navigation, company switcher, Admin portal badge
│       │   └── InvoicePdf.js                  # Vector A4 PDF generator (jsPDF + autoTable)
│       ├── context/
│       │   ├── AuthContext.js                 # Authentication state, login/logout, Google auth
│       │   └── CompanyContext.js              # Active company tenant state & switching
│       ├── pages/
│       │   ├── LoginPage.js                   # Dual login (Email/Pass + Continue with Google)
│       │   ├── RegisterPage.js                # Dual registration
│       │   ├── DashboardPage.js               # Revenue & unpaid balance KPI cards, recent invoices
│       │   ├── BillingPage.js                 # Dynamic invoice builder (standard & dimensional items)
│       │   ├── InvoiceListPage.js             # Invoices directory, status filters, search
│       │   ├── InvoiceViewPage.js             # Invoice preview, Real Email & Gmail modal, PDF, Print
│       │   ├── CustomerListPage.js            # Customer CRM directory
│       │   ├── ProductListPage.js             # Catalog manager
│       │   ├── CompanySetup.js                # Profile, branding, banking/UPI, SMTP configuration
│       │   ├── AdminPortalPage.js             # Platform admin overview, user & company directory
│       │   ├── TemplateList.js                # Invoice templates
│       │   └── TemplateBuilder.js             # Invoice designer
│       └── services/
│           └── api.js                         # Axios client with JWT auto-injection
│
├── README.md                                  # Full system guide & run instructions
└── verify_auth.ps1                            # Automated validation & testing script
```

---

## 🚦 Step-by-Step Instructions: How to Run

### 📋 Prerequisites
Ensure the following are installed on your machine:
1. **Java JDK 17 or higher** (`java -version`)
2. **Apache Maven 3.8+** (`mvn -v`)
3. **Node.js v18+ & npm** (`node -v` and `npm -v`)
4. **MySQL Server 8.0+** running on `localhost:3306`

---

### Step 1: Database Setup
Make sure your MySQL service is running. You can verify or create the database in MySQL Workbench or Command Line:
```sql
CREATE DATABASE IF NOT EXISTS smart_billing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Check your MySQL credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_billing?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=@Maggie20/04
```
*(Update `spring.datasource.password` if your local MySQL root password is different).*

---

### Step 2: Start the Backend Server (Spring Boot)

Open a terminal or PowerShell in the root directory:
```powershell
cd d:\smart-billing-system\backend
mvn spring-boot:run
```

- Backend will compile and start on: **`http://localhost:8081`**
- On initial startup, the database tables and demo seed data (users, companies, invoices, customers) are automatically created.

---

### Step 3: Start the Frontend Application (React)

Open a **second** terminal or PowerShell window:
```powershell
cd d:\smart-billing-system\frontend
npm start
```

- The React application will start and open automatically at: **`http://localhost:3000`**

---

## 🔑 Access Credentials & Login Options

### Option A: Platform Master Admin
- **URL**: `http://localhost:3000/login`
- **Username**: `admin`
- **Password**: `admin123`
- *Accesses the full application plus the **Platform Admin Portal** (`/admin`) for system-wide stats.*

### Option B: Continue with Google (Customer / Business Owner)
- Click **"Continue with Google"** on the login screen.
- Select one of the pre-configured accounts:
  - `alex.turner@gmail.com` (Nova Tech Innovations)
  - `sarah.jenkins@gmail.com` (Blue Horizon Studio)
- Or enter any custom Google account email & business name to auto-provision a new tenant.

### Option C: Register New Business
- Click **"Register here"** to sign up with a new email and create a brand-new company workspace.

---

## 📧 How to Test Real Email Delivery

1. Log in and go to **Invoices** &rarr; click **View** on `#INV-2026-0001`.
2. Click the green **"📧 Send to Customer"** button.
3. Choose your preferred delivery method:
   - **Method 1 (Instant 1-Click via Gmail)**: Click the red **"🚀 Open in Gmail"** button. It immediately opens your Gmail with the recipient (`pujalameghana2005@gmail.com`), subject, and itemized invoice text pre-filled. Click **Send** in Gmail to deliver the real email!
   - **Method 2 (Automated Server SMTP)**: Click **"⚙️ Configure SMTP Server Credentials"**, enter your Gmail address and a 16-character [Google App Password](https://myaccount.google.com/apppasswords), and click **Send via Server**. The Spring Boot backend dispatches a styled HTML invoice directly.
