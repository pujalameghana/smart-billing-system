# Smart Billing & Invoice Generator

A modern full-stack billing and invoice generation platform built with **Spring Boot 3** and **React 19**. Allows businesses to create customized invoices, manage customers and product catalogs, generate vector PDFs, and dispatch invoices directly via email.

---

## 🚀 Features

- **Multi-Tenant & Company Branding**: Create custom company profiles, upload logos, and set up Bank/UPI details for instant customer payments.
- **Dynamic Invoicing**: Sequential invoice numbering, standard quantity billing, and dimensional area billing (width × height) for specialized trades.
- **Auto Calculations**: Automatic tax (GST), discounts, subtotals, and grand totals.
- **Real Email & PDF Dispatch**:
  - 1-Click direct dispatch via **Gmail**.
  - Automated backend **SMTP email delivery** with HTML invoice templates.
  - Crisp vector **A4 PDF download** and print view.
- **Dual Authentication**: Continue with Google or Email/Password login with Role-Based Access Control (Platform Admin vs Business Owners).
- **CRM & Catalog**: Full customer directory and product/service catalog management.
- **Analytics Dashboard**: Real-time revenue metrics, unpaid balances, and recent invoice tracking.

---

## 🛠 Tech Stack

- **Backend**: Java 17+, Spring Boot 3.2.5, Spring Security, Spring Data JPA, JavaMailSender
- **Frontend**: React 19, Bootstrap 5, Axios, jsPDF
- **Database**: MySQL 8.0
- **Auth**: JWT (JSON Web Tokens) & BCrypt

---

## 🚦 Quick Start Guide

### 1. Prerequisites
- **Java 17+** & **Maven**
- **Node.js 18+** & **npm**
- **MySQL Server** (running on `localhost:3306`)

---

### 2. Database Setup
Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS smart_billing;
```
Configure your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_billing?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### 3. Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
> Backend runs at **`http://localhost:8081`**

---

### 4. Run Frontend (React)
Open a new terminal:
```bash
cd frontend
npm start
```
> Frontend runs at **`http://localhost:3000`**

*(On Windows, you can also simply double-click `run.bat` to launch both servers).*

---

## 🔑 Demo Credentials

- **Admin Login**: `admin` / `admin123`
- **Google Sign-In**: Click **Continue with Google** on the login page to sign in with preloaded or custom business accounts.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
