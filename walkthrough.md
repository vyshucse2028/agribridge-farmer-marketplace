# 🌾 AgriBridge - Project Walkthrough

The AgriBridge Full-Stack Application is successfully generated in the `c:\Users\molankala vaishnavi\Desktop\AgriBridge\Farmer-to-Market Management Platform` directory.

## What Was Built

### 🛠️ Backend (`backend/`)
- **Spring Boot 3 + Java 17:** A fully configured backend API with JPA/Hibernate.
- **Security:** Built-in JWT Authentication (Login/Register) using `Spring Security`.
- **Database:** Ready to connect to MySQL (`agribridge_db`) via `application.properties`.
- **APIs:** Comprehensive REST endpoints for:
  - Auth (`/api/auth`)
  - Crops (`/api/crops`)
  - Orders (`/api/orders`)
  - Farmer/Buyer profiles
  - Admin controls (`/api/admin`)
- **OpenAPI/Swagger:** Auto-configured API documentation accessible via `/swagger-ui.html`.

### 🖥️ Frontend (`frontend/`)
- **Vite + React:** A fast, modern frontend application.
- **Routing:** Configured with `react-router-dom`, including robust protected routes (`ProtectedRoute.jsx`) separating Farmers, Buyers, and Admins.
- **API Integration:** Axios instance (`api.js`) set up with automatic JWT token attachment and error interception.
- **UI/UX:** A custom, dark-themed responsive UI using plain CSS, featuring dynamic cards, tables, and dashboards for all 3 roles.
- **Cart System:** LocalStorage-based shopping cart for Buyers.

## How to Run the Project

### 1. Database Setup
1. Ensure MySQL is installed and running on port `3306`.
2. Ensure you have a root user with password `root` (or update `backend/src/main/resources/application.properties`).
3. The database `agribridge_db` will be created automatically.

### 2. Run Backend
1. Open a terminal in `backend/`
2. Make sure Maven is installed.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. Backend will start on `http://localhost:8080`. (View APIs at `http://localhost:8080/swagger-ui.html`).

### 3. Run Frontend
1. Open a new terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. The app will open at `http://localhost:5173`.

> [!TIP]
> To test the flow:
> 1. Register a user as a **Farmer** and add a crop.
> 2. Register another user as a **Buyer**. Browse crops, add to cart, and checkout.
> 3. Log back in as the **Farmer** to view the order and update its status.
