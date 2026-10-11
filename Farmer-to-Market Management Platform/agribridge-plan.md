# AgriBridge Implementation Plan

## Overview
This plan fixes critical bugs, adds map location endpoints, and provides complete steps to build and run the AgriBridge Farmer-to-Market Management Platform.

## Project Structure
- **Backend**: Spring Boot 3.2.0, Java 17, MySQL/H2, JWT Auth, Swagger UI
- **Frontend**: React 18, Vite 5, React Router, Leaflet maps, Axios
- **Build**: Maven (backend), npm (frontend)

---

## Implementation Steps

### ✅ 1. Fix CropService.getCropsByFarmer Bug (userId vs farmerId)

**Problem**: `CropController.getMyCrops()` passes `userId` to `CropService.getCropsByFarmer(Long farmerId)`, but the service expects a Farmer entity ID, not a User ID. This causes the repository query to fail.

**What to do**: Modify `CropService.getCropsByFarmer(Long userId)` to first resolve the Farmer entity from the userId, then query crops by the Farmer's ID. Since the controller method is `getMyCrops`, it should return all crops (both available and unavailable) for the farmer's dashboard.

**Files**:
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\service\CropService.java`

**Changes**:
```java
// Change method signature and implementation
public List<Crop> getCropsByFarmer(Long userId) {
    Farmer farmer = farmerRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user " + userId));
    return cropRepository.findByFarmerId(farmer.getId());
}
```

**Verify**: Run the backend with `mvn spring-boot:run` in the backend directory, then test the endpoint:
- Login as farmer (phone=9876543210, password=Farmer@123)
- Call `GET /api/crops/my-crops` with the JWT token
- Should return farmer's crops without 500 error

---

### ✅ 2. Add H2 In-Memory Database Fallback Profile

**Problem**: The application only supports MySQL. If MySQL is not running or credentials are incorrect, the backend crashes on startup. Users need a zero-config fallback for quick testing.

**What to do**: Create an H2 in-memory database profile that can be activated when MySQL is unavailable. Update application.properties with clear MySQL requirement comments.

**Files**:
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\resources\application-h2.properties` (NEW)
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\resources\application.properties` (UPDATE)

**Create `application-h2.properties`**:
```properties
# ============================================================
# AgriBridge – H2 In-Memory Database Profile
# ============================================================
# To use: mvn spring-boot:run -Dspring-boot.run.profiles=h2
# OR set environment variable: SPRING_PROFILES_ACTIVE=h2

spring.datasource.url=jdbc:h2:mem:agribridge_db
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# H2 Console (optional, for debugging)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**Update `application.properties`** (add comment at the top of the Database section):
```properties
# ============================================================
# Database – MySQL (PRIMARY)
# ============================================================
# REQUIREMENT: MySQL must be running on localhost:3306
# - Start MySQL: sudo service mysql start (Linux) or via MySQL Workbench (Windows)
# - Verify credentials: username=root, password=vyshu092007
# - The database 'agribridge_db' will be created automatically if it doesn't exist
#
# FALLBACK: To use H2 in-memory database instead, run with profile:
#   mvn spring-boot:run -Dspring-boot.run.profiles=h2
# ============================================================
```

**Verify**: 
- Stop MySQL service
- Run `mvn spring-boot:run -Dspring-boot.run.profiles=h2` in backend directory
- Backend should start successfully on port 8080
- Access H2 console at http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:agribridge_db, username: sa, password: empty)

---

### ✅ 3. Verify OpenApiConfig.java Exists and is Correct

**What to do**: Confirm that Swagger/OpenAPI configuration exists with JWT bearer auth support.

**Files**:
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\config\OpenApiConfig.java`

**Verification**: File already exists and is correctly configured with:
- `@OpenAPIDefinition` with API info
- `@SecurityScheme` with bearer JWT authentication
- No changes needed

**Verify**: 
- Start backend with `mvn spring-boot:run`
- Visit http://localhost:8080/swagger-ui.html
- Confirm Swagger UI loads with "Authorize" button for JWT bearer token

---

### ✅ 4. Add Public Farmers Map Location Endpoint

**Problem**: The frontend needs a public endpoint to fetch all verified farmers with their map coordinates (latitude/longitude) for displaying on a farmers map view. Currently no such endpoint exists.

**What to do**: Add a new public endpoint `GET /api/farmers/map` in FarmerController that returns a list of all verified farmers with their location data (id, farmName, farmLocation, latitude, longitude). Create a DTO to avoid exposing sensitive user information.

**Files**:
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\dto\FarmerMapDto.java` (NEW)
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\service\FarmerService.java` (UPDATE)
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\controller\FarmerController.java` (UPDATE)
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend\src\main\java\com\agribridge\repository\FarmerRepository.java` (UPDATE)

**Create `FarmerMapDto.java`**:
```java
package com.agribridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for public farmer map locations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerMapDto {
    private Long id;
    private String farmName;
    private String farmLocation;
    private Double latitude;
    private Double longitude;
    private String profileImageUrl;
    private boolean verified;
}
```

**Update `FarmerRepository.java`** (add method):
```java
List<Farmer> findByVerifiedTrue();
```

**Update `FarmerService.java`** (add method):
```java
public List<FarmerMapDto> getAllVerifiedFarmersForMap() {
    return farmerRepository.findByVerifiedTrue().stream()
            .filter(f -> f.getLatitude() != null && f.getLongitude() != null)
            .map(f -> FarmerMapDto.builder()
                    .id(f.getId())
                    .farmName(f.getFarmName())
                    .farmLocation(f.getFarmLocation())
                    .latitude(f.getLatitude())
                    .longitude(f.getLongitude())
                    .profileImageUrl(f.getProfileImageUrl())
                    .verified(f.isVerified())
                    .build())
            .toList();
}
```

**Update `FarmerController.java`** (add public endpoint):
```java
@GetMapping("/map")
@Operation(summary = "Get all verified farmers with map locations (public)")
public ResponseEntity<List<FarmerMapDto>> getFarmersForMap() {
    return ResponseEntity.ok(farmerService.getAllVerifiedFarmersForMap());
}
```

**Verify**: 
- Start backend
- Call `GET http://localhost:8080/api/farmers/map` (no auth required)
- Should return JSON array of verified farmers with lat/lng coordinates

---

### ✅ 5. Verify All Referenced Services and Beans Compile

**What to do**: Ensure no missing imports, incomplete methods, or compilation errors exist in the backend codebase.

**Files**: All Java files in `backend/src/main/java/com/agribridge/`

**Verify**: Run `mvn clean compile` in the backend directory
- Expected: `BUILD SUCCESS`
- If errors occur, fix missing imports or incomplete method implementations

---

### ✅ 6. Verify Frontend Pages Exist

**What to do**: Confirm that all critical frontend pages exist and are not broken.

**Files**:
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend\src\pages\Orders.jsx` ✅ EXISTS
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend\src\pages\Register.jsx` ✅ EXISTS
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend\src\pages\Profile.jsx` ✅ EXISTS
- `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend\src\pages\TrackGoods.jsx` ✅ EXISTS (with TrackingMap component)

**Verification**: Files already exist. No changes needed.

**Verify**: Run `npm run build` in the frontend directory to ensure no build errors

---

### ✅ 7. Install Frontend Dependencies

**What to do**: Install all Node.js dependencies for the React frontend.

**Files**: `c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend\package.json`

**Commands**:
```bash
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend"
npm install
```

**Verify**: 
- `node_modules/` directory created
- No error messages during installation
- Expected output: "added XXX packages"

---

### ✅ 8. Build Backend with Maven

**What to do**: Compile and package the Spring Boot backend, skipping tests for faster initial build.

**Commands**:
```bash
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend"
mvn clean install -DskipTests
```

**Verify**: 
- Expected: `BUILD SUCCESS`
- JAR file created: `target/agribridge-backend-1.0.0.jar`
- No compilation errors

---

### ✅ 9. Verify MySQL is Running (or use H2 fallback)

**What to do**: Check if MySQL is accessible with the configured credentials. If not, prepare to use H2 profile.

**Option A - MySQL** (preferred for production-like testing):
1. Start MySQL service:
   - Windows: Open MySQL Workbench or Services panel and start MySQL80 service
   - Linux: `sudo service mysql start`
2. Verify credentials match `application.properties`:
   - Host: localhost:3306
   - Username: root
   - Password: vyshu092007
3. Database `agribridge_db` will be created automatically on first run

**Option B - H2 In-Memory** (fallback for quick testing):
- No setup needed
- Will use the profile created in step 2

**Verify**:
- MySQL: Connect via MySQL Workbench or command line: `mysql -u root -pvyshu092007`
- H2: Will be verified when backend starts

---

### ✅ 10. Run Backend Server

**What to do**: Start the Spring Boot backend server.

**Option A - With MySQL**:
```bash
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend"
mvn spring-boot:run
```

**Option B - With H2 fallback**:
```bash
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend"
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Verify**: 
- Console output shows: "Started AgriBridgeApplication in X seconds"
- No errors related to database connection
- Server running on: http://localhost:8080
- Swagger UI accessible: http://localhost:8080/swagger-ui.html
- H2 Console (if using H2): http://localhost:8080/h2-console

---

### ✅ 11. Run Frontend Development Server

**What to do**: Start the Vite development server for the React frontend.

**Commands**:
```bash
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend"
npm run dev
```

**Verify**: 
- Console shows: "VITE vX.X.X ready in XXX ms"
- Local: http://localhost:5173
- Network: http://192.168.x.x:5173
- No compilation errors

---

### ✅ 12. Test Login and Core Functionality

**What to do**: Verify that the application works end-to-end with test credentials.

**Test Credentials**:
- **Farmer**: 
  - Phone: `9876543210`
  - Password: `Farmer@123`
- **Buyer**: 
  - Phone: `9876543211`
  - Password: `Buyer@123`

**Test Steps**:
1. Open http://localhost:5173 in browser
2. Click "Login"
3. Enter Farmer credentials
4. Verify redirect to Farmer Dashboard
5. Navigate to "My Crops" - should load without errors (tests Bug #1 fix)
6. Navigate to "Track Goods" - map should display (tests map functionality)
7. Logout and login as Buyer
8. Browse crops and place an order
9. Navigate to "Orders" - should see order details
10. Navigate to "Track Goods" - should see order tracking map

**Verify**: 
- No 500 errors in browser console
- No JWT authentication errors
- Maps render correctly with Leaflet tiles
- Orders display with proper data

---

### ✅ 13. Test Farmers Map Endpoint (New Feature)

**What to do**: Verify the new public endpoint returns verified farmers with locations.

**Test Steps**:
1. Backend running on http://localhost:8080
2. Open browser or Postman
3. Call: `GET http://localhost:8080/api/farmers/map`
4. Should return JSON array of farmers with structure:
   ```json
   [
     {
       "id": 1,
       "farmName": "Green Valley Farm",
       "farmLocation": "Nashik, Maharashtra",
       "latitude": 19.9975,
       "longitude": 73.7898,
       "profileImageUrl": "...",
       "verified": true
     }
   ]
   ```

**Verify**: 
- Response status: 200 OK
- JSON array returned
- Only verified farmers with non-null lat/lng included
- No sensitive user data (password, email) exposed

---

## Quick Reference Commands

### Backend
```bash
# Navigate to backend
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\backend"

# Compile only
mvn clean compile

# Build without tests
mvn clean install -DskipTests

# Run with MySQL
mvn spring-boot:run

# Run with H2 in-memory database
mvn spring-boot:run -Dspring-boot.run.profiles=h2

# Run with specific port
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### Frontend
```bash
# Navigate to frontend
cd "c:\25EG505V04\AgriBridge\Farmer-to-Market Management Platform\frontend"

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### MySQL Commands
```bash
# Start MySQL (Windows)
net start MySQL80

# Connect to MySQL
mysql -u root -pvyshu092007

# Show databases
SHOW DATABASES;

# Use AgriBridge database
USE agribridge_db;

# Show tables
SHOW TABLES;

# View users
SELECT id, name, phone, role FROM users;

# View farmers
SELECT id, farm_name, farm_location, verified FROM farmers;
```

---

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs (JSON)**: http://localhost:8080/api-docs
- **H2 Console** (H2 profile only): http://localhost:8080/h2-console

---

## Test Credentials

| Role   | Phone       | Password    | Purpose                          |
|--------|-------------|-------------|----------------------------------|
| FARMER | 9876543210  | Farmer@123  | Test crop management, tracking   |
| BUYER  | 9876543211  | Buyer@123   | Test order placement, tracking   |
| ADMIN  | (varies)    | (varies)    | Test user/order management       |

---

## Known Dependencies

### Backend
- Java 17+
- Maven 3.6+
- MySQL 8.0+ (or H2 fallback)
- Spring Boot 3.2.0
- JWT (jjwt 0.11.5)
- SpringDoc OpenAPI 2.3.0
- Lombok

### Frontend
- Node.js 16+
- React 18.2
- Vite 5.0
- React Router DOM 6.21
- Axios 1.6.2
- Leaflet 1.9.4 + React Leaflet 4.2.1
- React Toastify 10.0.3

---

## Troubleshooting

### Backend won't start - MySQL connection refused
- **Cause**: MySQL not running or wrong credentials
- **Fix**: 
  1. Start MySQL service: `net start MySQL80` (Windows) or `sudo service mysql start` (Linux)
  2. Verify credentials in `application.properties`
  3. OR use H2 profile: `mvn spring-boot:run -Dspring-boot.run.profiles=h2`

### Backend won't start - Port 8080 already in use
- **Cause**: Another process using port 8080
- **Fix**: 
  1. Find process: `netstat -ano | findstr :8080`
  2. Kill process: `taskkill /PID <pid> /F`
  3. OR use different port: `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081`

### Frontend - npm install fails
- **Cause**: Network issues or Node version mismatch
- **Fix**:
  1. Clear npm cache: `npm cache clean --force`
  2. Delete `node_modules` and `package-lock.json`
  3. Run `npm install` again
  4. Verify Node.js version: `node -v` (should be 16+)

### CORS errors in browser console
- **Cause**: Frontend running on different origin than configured
- **Fix**: Update `app.cors.allowed-origins` in `application.properties` to match frontend URL

### Maps not displaying
- **Cause**: Leaflet CSS not loaded or invalid coordinates
- **Fix**:
  1. Check browser console for errors
  2. Verify `import 'leaflet/dist/leaflet.css'` in map components
  3. Ensure farmers have valid latitude/longitude values

### Login fails with 401 Unauthorized
- **Cause**: Wrong credentials or JWT secret mismatch
- **Fix**:
  1. Verify test credentials: phone=9876543210, password=Farmer@123
  2. Check `app.jwt.secret` in `application.properties`
  3. Clear localStorage: `localStorage.clear()` in browser console

### "Farmer profile not found" error after login
- **Cause**: User exists but Farmer/Buyer profile not created
- **Fix**: Check DataInitializer.java runs on startup to create test profiles

---

## Summary

This plan fixes:
1. ✅ **Bug #1**: CropService correctly resolves userId to farmerId
2. ✅ **Bug #2**: H2 fallback profile for MySQL connectivity issues
3. ✅ **Bug #3**: OpenApiConfig verified and correct
4. ✅ **Enhancement**: Public farmers map endpoint `/api/farmers/map`

And provides:
- Complete build and run instructions
- Test credentials and verification steps
- Troubleshooting guide
- Quick reference commands

After following this plan, the AgriBridge platform will be fully functional with working login, order management, and map tracking features for both farmers and buyers.
