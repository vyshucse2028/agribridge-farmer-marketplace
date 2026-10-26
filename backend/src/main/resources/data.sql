-- AgriBridge MySQL seed (compatible with MySQL 8)
-- Uses INSERT IGNORE so re-runs do not fail on unique category names.
-- Crop rows are seeded at runtime by DataInitializer (they need a farmer_id).

INSERT IGNORE INTO categories (name, description, icon_url) VALUES
('Vegetables', 'Fresh farm-harvested greens, root veggies, and garden vegetables', '🥬'),
('Fruits', 'Fresh seasonal and tropical farm-picked fruits', '🍎'),
('Grains & Cereals', 'Wheat, rice, millets, maize, and other cereals', '🌾'),
('Pulses & Lentils', 'Protein-rich pulses, chickpeas, and lentils', '🫘'),
('Spices & Herbs', 'Aromatic spices, whole seeds, and culinary herbs', '🌶️'),
('Oilseeds & Cash Crops', 'Mustard, sunflower, groundnut, soybean, and sesame', '🌻'),
('Plantation Crops', 'Tea, coffee, rubber, arecanut, cocoa, and cashew', '☕'),
('Commercial & Fibre', 'Sugarcane, cotton, jute, and industrial farm crops', '🧶'),
('Flowers', 'Cut flowers and loose flowers from Indian floriculture belts', '🌼'),
('Medicinal & Aromatic', 'Ashwagandha, amla, tulsi, mentha, and AYUSH crops', '🌿');
