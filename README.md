# MediTrack – Pharmacy Management System

A full-stack, production-grade pharmacy management application built with a modern React.js frontend, Spring Boot backend, and MySQL database.

## Architecture & Modules
- **Authentication**: JWT security with BCrypt password hashing. Role-based routing (Admin, Pharmacist, Customer).
- **Inventory & Alert System**: Dashboard counters and toast alerts for critical low-stock items and expired medicines.
- **Billing / POS Module**: Multi-medicine checkout with automatic stock deduction, discount calculation, and GST.
- **Reporting & Exporter**: Real-time sales summary export to PDF and inventory status download to Excel.
- **Customer Portal**: Self-registration, medicine finder catalog, prescription uploads, and invoice download history.

---

## 🛠️ Installation & Setup

### 1. Database Setup
1. Create a MySQL schema named `meditrack_db`.
2. Configure credentials in `meditrack-backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/meditrack_db
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```

### 2. Backend Setup (Spring Boot)
Run the application from the backend directory:
```bash
cd meditrack-backend
mvn spring-boot:run
```
The server will run on `http://localhost:8080`.
The OpenAPI documentation is accessible at `http://localhost:8080/swagger-ui.html`.

### 3. Frontend Setup (React.js)
Install packages and start the Vite dev server:
```bash
cd meditrack-frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:5173` or `http://localhost:3000`.

---

## 🔐 Credentials
- **Admin**: `admin@meditrack.com` / `admin123`
- **Pharmacist**: `pharma@meditrack.com` / `pharma123`
