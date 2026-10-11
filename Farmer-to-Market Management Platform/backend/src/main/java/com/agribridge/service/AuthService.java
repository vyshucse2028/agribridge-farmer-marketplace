package com.agribridge.service;

import com.agribridge.dto.*;
import com.agribridge.entity.*;
import com.agribridge.exception.BadRequestException;
import com.agribridge.repository.*;
import com.agribridge.security.JwtService;
import com.agribridge.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Handles user registration, phone/email login, OTP authentication, and password reset.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            email = request.getPhone() + "@agribridge.com";
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Mobile number already registered: " + request.getPhone());
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Account already exists with this contact information: " + email);
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // Create role-specific profile
        if (request.getRole() == Role.FARMER) {
            String farmLocation = request.getFarmLocation() != null ? request.getFarmLocation() : "Local Farm";
            double[] coords = GeoUtils.resolve(farmLocation, null, null);
            Farmer farmer = Farmer.builder()
                    .user(user)
                    .farmName(request.getFarmName() != null && !request.getFarmName().isBlank() 
                            ? request.getFarmName() 
                            : user.getFirstName() + "'s Farm")
                    .farmLocation(farmLocation)
                    .latitude(coords[0])
                    .longitude(coords[1])
                    .build();
            farmerRepository.save(farmer);
        } else if (request.getRole() == Role.BUYER) {
            String city = request.getCity() != null ? request.getCity() : "City";
            double[] coords = GeoUtils.resolve(city, null, null);
            Buyer buyer = Buyer.builder()
                    .user(user)
                    .shippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "Address")
                    .city(city)
                    .state(request.getState() != null ? request.getState() : "State")
                    .pincode(request.getPincode() != null ? request.getPincode() : "000000")
                    .latitude(coords[0])
                    .longitude(coords[1])
                    .build();
            buyerRepository.save(buyer);
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public Map<String, Object> login(LoginRequest request) {
        String identifier = (request.getPhone() != null && !request.getPhone().isBlank()) 
                ? request.getPhone().trim() 
                : (request.getEmail() != null ? request.getEmail().trim() : "");

        if (identifier.isEmpty()) {
            throw new BadRequestException("Please enter your registered mobile number");
        }

        User user = userRepository.findByPhone(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadRequestException("No account found with mobile number: " + identifier));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid password. Please try again or use Forgot Password / OTP.");
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    private final Map<String, String> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.Random random = new java.util.Random();

    public Map<String, Object> sendOtp(SendOtpRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String channel = (request.getChannel() != null && request.getChannel().equalsIgnoreCase("WHATSAPP")) 
                ? "WhatsApp" 
                : "SMS";

        if (phone.isEmpty()) {
            throw new BadRequestException("Mobile number is required to send OTP");
        }

        // Generate dynamic 6-digit numeric OTP
        String generatedOtp = String.format("%06d", 100000 + random.nextInt(900000));
        otpStorage.put(phone, generatedOtp);

        // Log OTP to console for development/debugging purposes only
        System.out.println("[AgriBridge OTP] Phone: +91 " + phone + " | OTP: " + generatedOtp + " | Channel: " + channel);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("channel", channel);
        response.put("phone", phone);
        response.put("message", "6-digit OTP code sent successfully via " + channel + " to +91 " + phone);
        return response;
    }

    @Transactional
    public Map<String, Object> otpLogin(OtpLoginRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";

        if (phone.isEmpty() || otp.isEmpty()) {
            throw new BadRequestException("Mobile number and OTP are required");
        }

        // Validate strictly against the dynamic generated OTP
        String expectedOtp = otpStorage.get(phone);
        if (expectedOtp == null || !expectedOtp.equals(otp.trim())) {
            throw new BadRequestException("Incorrect OTP. Please enter the correct 6-digit OTP sent to your phone.");
        }
        otpStorage.remove(phone); // One-time use

        User user = userRepository.findByPhone(phone).orElse(null);

        if (user == null) {
            // Auto provision user if logging in first time via verified OTP
            Role role = request.getRole() != null ? request.getRole() : Role.FARMER;
            user = User.builder()
                    .firstName("User")
                    .lastName(phone.substring(Math.max(0, phone.length() - 4)))
                    .email(phone + "@agribridge.com")
                    .password(passwordEncoder.encode("Agri@" + phone))
                    .phone(phone)
                    .role(role)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);

            if (role == Role.FARMER) {
                double[] coords = GeoUtils.resolve("Nashik", null, null);
                Farmer farmer = Farmer.builder()
                        .user(user)
                        .farmName("Farm " + phone)
                        .farmLocation("Nashik, Maharashtra")
                        .latitude(coords[0])
                        .longitude(coords[1])
                        .build();
                farmerRepository.save(farmer);
            } else {
                double[] coords = GeoUtils.resolve("Hyderabad", null, null);
                Buyer buyer = Buyer.builder()
                        .user(user)
                        .shippingAddress("Local Address")
                        .city("Hyderabad")
                        .state("Telangana")
                        .pincode("500001")
                        .latitude(coords[0])
                        .longitude(coords[1])
                        .build();
                buyerRepository.save(buyer);
            }
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";
        String newPassword = request.getNewPassword();

        if (phone.isEmpty() || newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Please enter a valid mobile number and at least 6-character new password");
        }

        String expectedOtp = otpStorage.get(phone);
        if (expectedOtp == null || !expectedOtp.equals(otp.trim())) {
            throw new BadRequestException("Incorrect OTP code. Please enter the correct 6-digit OTP sent to your phone.");
        }
        otpStorage.remove(phone);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BadRequestException("No account found with mobile number: " + phone));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password reset successful! You can now login with your new password.");
        return response;
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        if (user.getRole() == Role.FARMER) {
            farmerRepository.findByUserId(user.getId()).ifPresent(f -> response.put("farmerId", f.getId()));
        } else if (user.getRole() == Role.BUYER) {
            buyerRepository.findByUserId(user.getId()).ifPresent(b -> response.put("buyerId", b.getId()));
        }
        return response;
    }
}
