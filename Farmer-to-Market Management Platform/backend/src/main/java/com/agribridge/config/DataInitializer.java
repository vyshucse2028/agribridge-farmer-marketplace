package com.agribridge.config;

import com.agribridge.entity.*;
import com.agribridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Initializes default categories, demo farmer/buyer accounts, and category-allotted crops.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final CropRepository cropRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing AgriBridge seed data...");

        // 1. Initialize Categories
        Map<String, Category> categoryMap = new HashMap<>();
        String[][] categoriesData = {
                {"Vegetables", "Fresh farm-harvested greens, root veggies, and fresh garden vegetables", "🥬"},
                {"Fruits", "Fresh seasonal and tropical farm-picked fruits", "🍎"},
                {"Grains & Cereals", "High quality wheat, rice, barley, and millet straight from fields", "🌾"},
                {"Pulses & Lentils", "Protein-rich organic pulses, chickpeas, and lentils", "🫘"},
                {"Spices & Herbs", "Aromatic pure spices, whole seeds, and culinary herbs", "🌶️"},
                {"Oilseeds & Cash Crops", "Mustard, sunflower, groundnuts, and commercial agricultural crops", "🌻"}
        };

        for (String[] cat : categoriesData) {
            String name = cat[0];
            Category category = categoryRepository.findByName(name).orElseGet(() -> {
                Category newCat = Category.builder()
                        .name(name)
                        .description(cat[1])
                        .iconUrl(cat[2])
                        .build();
                return categoryRepository.save(newCat);
            });
            categoryMap.put(name, category);
        }

        // 2. Initialize Demo Farmer
        String farmerPhone = "9876543210";
        Farmer farmer = farmerRepository.findAll().stream().findFirst().orElse(null);

        if (farmer == null) {
            User farmerUser = userRepository.findByPhone(farmerPhone).orElseGet(() -> {
                User user = User.builder()
                        .firstName("Ramesh")
                        .lastName("Patel")
                        .email("ramesh.farmer@agribridge.com")
                        .phone(farmerPhone)
                        .password(passwordEncoder.encode("Farmer@123"))
                        .role(Role.FARMER)
                        .enabled(true)
                        .build();
                return userRepository.save(user);
            });

            Farmer newFarmer = Farmer.builder()
                    .user(farmerUser)
                    .farmName("Green Earth Organic Farms")
                    .farmLocation("Nashik, Maharashtra")
                    .latitude(19.9975)
                    .longitude(73.7898)
                    .farmSize("12 Acres")
                    .description("Sustainable and chemical-free organic farming specializing in farm-fresh seasonal crops.")
                    .verified(true)
                    .build();
            farmer = farmerRepository.save(newFarmer);
        } else if (farmer.getLatitude() == null || farmer.getLongitude() == null) {
            farmer.setLatitude(19.9975);
            farmer.setLongitude(73.7898);
            if (farmer.getFarmLocation() == null || farmer.getFarmLocation().isBlank()) {
                farmer.setFarmLocation("Nashik, Maharashtra");
            }
            farmer = farmerRepository.save(farmer);
        }

        // 3. Initialize Demo Buyer
        String buyerPhone = "9876543211";
        if (buyerRepository.count() == 0) {
            User buyerUser = userRepository.findByPhone(buyerPhone).orElseGet(() -> {
                User user = User.builder()
                        .firstName("Priya")
                        .lastName("Sharma")
                        .email("priya.buyer@agribridge.com")
                        .phone(buyerPhone)
                        .password(passwordEncoder.encode("Buyer@123"))
                        .role(Role.BUYER)
                        .enabled(true)
                        .build();
                return userRepository.save(user);
            });

            Buyer newBuyer = Buyer.builder()
                    .user(buyerUser)
                    .shippingAddress("Flat 402, Sunshine Apartments, Hitech City")
                    .city("Hyderabad")
                    .state("Telangana")
                    .pincode("500081")
                    .latitude(17.4483)
                    .longitude(78.3915)
                    .build();
            buyerRepository.save(newBuyer);
        } else {
            buyerRepository.findAll().stream().findFirst().ifPresent(existingBuyer -> {
                if (existingBuyer.getLatitude() == null || existingBuyer.getLongitude() == null) {
                    existingBuyer.setLatitude(17.4483);
                    existingBuyer.setLongitude(78.3915);
                    buyerRepository.save(existingBuyer);
                }
            });
        }

        // 4. Initialize All-India Vegetable Market & Regional Produce
        if (farmer != null) {
            Object[][] allIndiaCrops = new Object[][]{
                    // Vegetables (All over India vegetable markets)
                    {"Nashik Red Onions", "Vegetables", "38.00", "kg", 800, "Grade-A pungent red onions from Lasalgaon-Nashik Mandi", "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=500"},
                    {"Bangalore Fresh Tomatoes", "Vegetables", "32.00", "kg", 550, "Vine-ripened firm salad tomatoes from Kolar-Bangalore market", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500"},
                    {"Ooty Mountain Crisp Carrots", "Vegetables", "48.00", "kg", 350, "Sweet and crunchy orange carrots grown in high-altitude Nilgiri hills", "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500"},
                    {"Indore Golden Harvest Potatoes", "Vegetables", "24.00", "kg", 900, "Thin-skinned dry matter potatoes from Malwa plateau", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500"},
                    {"Pune Green Cauliflower & Cabbage", "Vegetables", "28.00", "kg", 400, "Crisp chemical-free farm harvested fresh green cauliflower heads", "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500"},
                    {"Shimla Crisp Green Capsicum", "Vegetables", "65.00", "kg", 250, "Thick-walled crunchy green bell peppers from Solan-Shimla belt", "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500"},
                    {"Himachal Fresh Green Peas (Matar)", "Vegetables", "55.00", "kg", 300, "Sweet, tender and freshly shelled green peas from hill farmers", "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500"},
                    {"Palakkad Fresh Tender Okra (Bhindi)", "Vegetables", "36.00", "kg", 280, "Tender, slime-free fresh picked lady's finger from Kerala farms", "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500"},
                    {"Bengal Purple Eggplant (Brinjal)", "Vegetables", "30.00", "kg", 320, "Glossy tender round eggplants perfect for roasting and curries", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500"},
                    {"Malwa Pure White Garlic (Lahsun)", "Vegetables", "150.00", "kg", 180, "Aromatic pungent multi-clove white garlic from Neemuch-Mandsaur Mandi", "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500"},
                    {"Nilgiris Mountain Fresh Ginger (Adrak)", "Vegetables", "85.00", "kg", 220, "Spicy high-fiber fresh washed ginger root from Wayanad-Nilgiris", "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500"},

                    // Fruits
                    {"Nagpur Juicy Sweet Oranges", "Fruits", "65.00", "kg", 450, "Famous naturally sweet GI-tagged mandarin oranges from Vidarbha", "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500"},
                    {"Kashmiri Royal Delicious Apples", "Fruits", "135.00", "kg", 350, "Handpicked premium red apples from Sopore-Shopian orchards", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500"},
                    {"Ratnagiri Alphonso Mangoes", "Fruits", "420.00", "dozen", 120, "Pure Konkan naturally ripened king of mangoes", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500"},
                    {"Sholapur Ruby Red Pomegranates (Anar)", "Fruits", "110.00", "kg", 260, "Juicy dark red arils with high antioxidants and soft seeds", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500"},

                    // Grains & Cereals
                    {"Punjab Sharbati Wheat (Grade A)", "Grains & Cereals", "2850.00", "quintal", 50, "Heavy golden Sharbati wheat grains from Malwa-Punjab plains", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500"},
                    {"Dehradun Traditional Basmati Rice", "Grains & Cereals", "95.00", "kg", 600, "Extra-long aged aromatic slender grain paddy rice", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"},
                    {"Andhra Sonamasuri Rice (Raw)", "Grains & Cereals", "58.00", "kg", 750, "Lightweight aromatic medium-grain staple paddy from Kurnool", "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500"},

                    // Pulses & Lentils
                    {"Unpolished Desi Toor Dal", "Pulses & Lentils", "145.00", "kg", 300, "High-protein unpolished pigeon pea dal from Latur-Gulbarga", "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500"},
                    {"MP Green Moong Dal (Whole)", "Pulses & Lentils", "115.00", "kg", 350, "Nutrient-dense clean unpolished whole green gram", "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500"},

                    // Spices & Herbs
                    {"Guntur Sannam Red Chillies", "Spices & Herbs", "190.00", "kg", 200, "Famous fiery pungent dry red chillies with natural red colour", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500"},
                    {"Malabar Tellicherry Black Pepper", "Spices & Herbs", "520.00", "kg", 90, "Bold whole sun-dried black peppercorns from Kerala coast", "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500"},
                    {"Lakadong Organic Turmeric (High Curcumin)", "Spices & Herbs", "240.00", "kg", 110, "Celebrated pure turmeric powder with 7%+ curcumin content", "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500"},

                    // Oilseeds & Cash Crops
                    {"Rajasthan Bold Black Mustard (Sarson)", "Oilseeds & Cash Crops", "92.00", "kg", 450, "Pungent oil-rich mustard seeds from Bharatpur Mandi", "https://images.unsplash.com/photo-1627916607164-7b20241db935?w=500"},
                    {"Saurashtra Raw Groundnuts (Peanuts)", "Oilseeds & Cash Crops", "105.00", "kg", 500, "Double-kernel healthy sweet peanuts from Rajkot-Junagadh", "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500"}
            };

            for (Object[] row : allIndiaCrops) {
                String cropName = (String) row[0];
                String catName = (String) row[1];
                BigDecimal price = new BigDecimal((String) row[2]);
                String unit = (String) row[3];
                int qty = (int) row[4];
                String desc = (String) row[5];
                String img = (String) row[6];

                boolean exists = cropRepository.findAll().stream().anyMatch(c -> c.getName().equalsIgnoreCase(cropName));
                if (!exists) {
                    Category cat = categoryMap.getOrDefault(catName, categoryMap.get("Vegetables"));
                    Crop c = Crop.builder()
                            .name(cropName)
                            .category(cat)
                            .pricePerUnit(price)
                            .unit(unit)
                            .availableQuantity(qty)
                            .available(true)
                            .description(desc)
                            .imageUrl(img)
                            .farmer(farmer)
                            .build();
                    cropRepository.save(c);
                }
            }
            log.info("Ensured All-India Vegetable & Produce market crops are seeded successfully.");
        }

        userRepository.findByPhone(farmerPhone).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("Farmer@123"));
            u.setEnabled(true);
            userRepository.save(u);
        });
        userRepository.findByPhone(buyerPhone).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("Buyer@123"));
            u.setEnabled(true);
            userRepository.save(u);
        });

        seedDemoOrders(farmer);

        log.info("AgriBridge data initialization completed successfully.");
    }

    private void seedDemoOrders(Farmer farmer) {
        if (orderRepository.count() > 0 || farmer == null) {
            return;
        }
        Buyer buyer = buyerRepository.findAll().stream().findFirst().orElse(null);
        List<Crop> crops = cropRepository.findAll();
        if (buyer == null || crops.isEmpty()) {
            return;
        }

        Crop onions = crops.stream().filter(c -> c.getName().toLowerCase().contains("onion")).findFirst().orElse(crops.get(0));
        Crop tomatoes = crops.stream().filter(c -> c.getName().toLowerCase().contains("tomato")).findFirst().orElse(crops.get(0));

        createDemoOrder(buyer, farmer, onions, 25, OrderStatus.SHIPPED, "ORD-DEMO01");
        createDemoOrder(buyer, farmer, tomatoes, 10, OrderStatus.PENDING, "ORD-DEMO02");
        log.info("Seeded demo orders so farmer and buyer can track goods on the map immediately.");
    }

    private void createDemoOrder(Buyer buyer, Farmer farmer, Crop crop, int qty, OrderStatus status, String orderNumber) {
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .buyer(buyer)
                .status(status)
                .deliveryAddress(buyer.getShippingAddress())
                .deliveryCity(buyer.getCity())
                .deliveryPincode(buyer.getPincode())
                .notes(status == OrderStatus.SHIPPED ? "In transit from Nashik farm to Hyderabad" : "Awaiting farmer confirmation")
                .totalAmount(crop.getPricePerUnit().multiply(java.math.BigDecimal.valueOf(qty)))
                .originLat(farmer.getLatitude() != null ? farmer.getLatitude() : 19.9975)
                .originLng(farmer.getLongitude() != null ? farmer.getLongitude() : 73.7898)
                .originLabel(farmer.getFarmName() + " · " + farmer.getFarmLocation())
                .destLat(buyer.getLatitude() != null ? buyer.getLatitude() : 17.4483)
                .destLng(buyer.getLongitude() != null ? buyer.getLongitude() : 78.3915)
                .destLabel(buyer.getShippingAddress() + ", " + buyer.getCity())
                .build();

        OrderItem item = OrderItem.builder()
                .order(order)
                .crop(crop)
                .quantity(qty)
                .unitPrice(crop.getPricePerUnit())
                .subtotal(order.getTotalAmount())
                .build();
        order.setItems(new ArrayList<>(List.of(item)));

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod("UPI")
                .paymentStatus(status == OrderStatus.SHIPPED ? "SUCCESS" : "PENDING")
                .build();
        order.setPayment(payment);

        orderRepository.save(order);
    }
}
