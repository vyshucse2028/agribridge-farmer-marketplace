# AgriBridge - Fullstack Java & React Farm-to-Market Platform Plan

This plan establishes the complete project structure and implementation for **AgriBridge**, matching the exact backend and frontend architectures and operational workflows requested.

---

## 🌾 Workflow Summary
1. **Farmer Workflow**: Add produce -> Set quantity, price, unit, image, and availability -> Manage crop catalog -> View buyer orders -> Confirm order -> Update delivery status (`CONFIRMED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`).
2. **Buyer Workflow**: Search/filter produce -> View crop details & farmer info -> Add to cart -> Place order with delivery address & payment mode -> Track live order progress -> Write reviews.
3. **Admin Workflow**: Platform metrics dashboard -> Manage users (Farmers, Buyers, Admins) -> Moderate crop listings -> View all platform transactions.

---

## 📁 Proposed Project Structure

```
AgriBridge/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/agribridge/
│           │   ├── AgriBridgeApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── OpenApiConfig.java
│           │   ├── controller/
│           │   │   ├── AuthController.java
│           │   │   ├── FarmerController.java
│           │   │   ├── BuyerController.java
│           │   │   ├── CropController.java
│           │   │   ├── OrderController.java
│           │   │   └── AdminController.java
│           │   ├── dto/
│           │   │   ├── LoginRequest.java
│           │   │   ├── RegisterRequest.java
│           │   │   ├── CropRequest.java
│           │   │   ├── OrderRequest.java
│           │   │   ├── AuthResponse.java
│           │   │   └── StatusUpdateRequest.java
│           │   ├── entity/
│           │   │   ├── User.java (Roles: FARMER, BUYER, ADMIN)
│           │   │   ├── Farmer.java
│           │   │   ├── Buyer.java
│           │   │   ├── Crop.java
│           │   │   ├── Category.java
│           │   │   ├── Order.java
│           │   │   ├── OrderItem.java
│           │   │   ├── Payment.java
│           │   │   └── Review.java
│           │   ├── repository/
│           │   │   ├── UserRepository.java
│           │   │   ├── FarmerRepository.java
│           │   │   ├── BuyerRepository.java
│           │   │   ├── CropRepository.java
│           │   │   ├── OrderRepository.java
│           │   │   └── ReviewRepository.java
│           │   ├── service/
│           │   │   ├── AuthService.java
│           │   │   ├── FarmerService.java
│           │   │   ├── BuyerService.java
│           │   │   ├── CropService.java
│           │   │   └── OrderService.java
│           │   ├── security/
│           │   │   ├── JwtService.java
│           │   │   ├── JwtAuthenticationFilter.java
│           │   │   └── CustomUserDetailsService.java
│           │   ├── exception/
│           │   │   ├── GlobalExceptionHandler.java
│           │   │   ├── ResourceNotFoundException.java
│           │   │   └── BadRequestException.java
│           │   └── config/DataInitializer.java (Pre-seeded mock crops & accounts for instant testing)
│           └── resources/
│               └── application.properties
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── CropCard.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── FarmerDashboard.jsx
        │   ├── BuyerDashboard.jsx
        │   ├── AdminDashboard.jsx
        │   ├── CropListing.jsx
        │   ├── AddCrop.jsx
        │   ├── Cart.jsx
        │   ├── Orders.jsx
        │   └── Profile.jsx
        ├── services/
        │   └── api.js
        └── styles/
            ├── App.css
            ├── Navbar.css
            └── Dashboard.css
```

---

## 🛠️ Key Technical Highlights
- **Backend**: Spring Boot 3.x, Spring Security 6 with JWT Token Authentication, JPA/Hibernate, H2 in-memory DB (swappable to MySQL via `application.properties`), CORS configuration enabled for React frontend, Swagger OpenAPI documentation at `/swagger-ui.html`.
- **Frontend**: Vite + React 18, modern styling with glassmorphic cards, hero banner, status badge tracking, interactive cart, mock/live API synchronization with automatic JWT persistence in `localStorage`.

---

## 🔍 Verification Plan
1. Validate backend file compilation and structure.
2. Validate frontend dependency installation and Vite build readiness.
3. Test all role flows (Farmer crop listing -> Buyer checkout -> Farmer status update -> Order complete).
