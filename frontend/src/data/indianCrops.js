export const CROP_CATEGORIES = [
  { id: 'ALL', name: 'All Produce', icon: '🌾' },
  { id: 'Cereals', name: 'Cereals & Grains', icon: '🌾' },
  { id: 'Pulses', name: 'Pulses & Lentils', icon: '🫘' },
  { id: 'Fruits', name: 'Fruits', icon: '🍎' },
  { id: 'Vegetables', name: 'Vegetables', icon: '🥕' },
  { id: 'Leafy Vegetables', name: 'Leafy Vegetables', icon: '🥬' },
  { id: 'Spices & Condiments', name: 'Spices & Condiments', icon: '🌶️' },
  { id: 'Oilseeds & Cash Crops', name: 'Oilseeds & Cash Crops', icon: '🌻' },
  { id: 'Plantation Crops', name: 'Plantation Crops', icon: '☕' },
]

export const ALL_INDIA_CROPS = [
  // ─── 1. CEREALS & GRAINS ──────────────────────────────────────────
  { name: 'Wheat (Sharbati Gehun)', category: 'Cereals', icon: '🌾', region: 'Sehore, MP & Punjab', avgPrice: 32, season: 'Rabi' },
  { name: 'Basmati Rice (1121 Pusa)', category: 'Cereals', icon: '🌾', region: 'Karnal, Haryana & Amritsar', avgPrice: 95, season: 'Kharif' },
  { name: 'Sona Masuri Rice', category: 'Cereals', icon: '🌾', region: 'Kurnool, AP & Raichur, Karnataka', avgPrice: 58, season: 'Kharif' },
  { name: 'Paddy / Raw Rice (Dhan)', category: 'Cereals', icon: '🌾', region: 'West Bengal & Chhattisgarh', avgPrice: 26, season: 'Kharif' },
  { name: 'Maize / Yellow Corn (Makka)', category: 'Cereals', icon: '🌽', region: 'Gulbarga, Karnataka & Bihar', avgPrice: 24, season: 'Kharif' },
  { name: 'Pearl Millet (Bajra)', category: 'Cereals', icon: '🌾', region: 'Barmer, Rajasthan & Gujarat', avgPrice: 28, season: 'Kharif' },
  { name: 'Sorghum (Jowar / White Millet)', category: 'Cereals', icon: '🌾', region: 'Solapur, Maharashtra & Karnataka', avgPrice: 35, season: 'Rabi/Kharif' },
  { name: 'Finger Millet (Ragi / Nachni)', category: 'Cereals', icon: '🌾', region: 'Mandya, Karnataka & Tamil Nadu', avgPrice: 42, season: 'Kharif' },
  { name: 'Foxtail Millet (Kangni / Korra)', category: 'Cereals', icon: '🌾', region: 'Anantapur, AP & Karnataka', avgPrice: 48, season: 'Kharif' },
  { name: 'Barley (Jau)', category: 'Cereals', icon: '🌾', region: 'Sri Ganganagar, Rajasthan', avgPrice: 27, season: 'Rabi' },
  { name: 'Oats (Jai)', category: 'Cereals', icon: '🌾', region: 'Ludhiana, Punjab & Haryana', avgPrice: 55, season: 'Rabi' },
  { name: 'Kodo & Little Millet (Samai / Kutki)', category: 'Cereals', icon: '🌾', region: 'Dindori, MP & Tamil Nadu', avgPrice: 45, season: 'Kharif' },

  // ─── 2. PULSES & LENTILS ──────────────────────────────────────────
  { name: 'Chickpea / Desi Chana (Bengal Gram)', category: 'Pulses', icon: '🫘', region: 'Bikaner, Rajasthan & Vidarbha', avgPrice: 68, season: 'Rabi' },
  { name: 'Kabuli Chana (Garbanzo / White Chana)', category: 'Pulses', icon: '🫘', region: 'Indore, MP & Rajasthan', avgPrice: 85, season: 'Rabi' },
  { name: 'Pigeon Pea (Toor / Arhar Dal)', category: 'Pulses', icon: '🫘', region: 'Latur, Maharashtra & Gulbarga', avgPrice: 110, season: 'Kharif' },
  { name: 'Green Gram (Moong Dal)', category: 'Pulses', icon: '🫘', region: 'Nagaur, Rajasthan & MP', avgPrice: 92, season: 'Kharif/Zaid' },
  { name: 'Black Gram (Urad Dal)', category: 'Pulses', icon: '🫘', region: 'Krishna, AP & Gwalior, MP', avgPrice: 98, season: 'Kharif' },
  { name: 'Red Lentil (Masoor Dal)', category: 'Pulses', icon: '🫘', region: 'Bundelkhand, UP & Bihar', avgPrice: 78, season: 'Rabi' },
  { name: 'Kidney Beans (Chitra Rajma)', category: 'Pulses', icon: '🫘', region: 'Bhaderwah, J&K & Chakrata, UK', avgPrice: 130, season: 'Kharif' },
  { name: 'Horse Gram (Kulthi Dal)', category: 'Pulses', icon: '🫘', region: 'Dharmapuri, TN & Karnataka', avgPrice: 58, season: 'Kharif' },
  { name: 'Moth Bean (Matki)', category: 'Pulses', icon: '🫘', region: 'Jodhpur, Rajasthan & Gujarat', avgPrice: 65, season: 'Kharif' },
  { name: 'Cowpea (Lobia / White Barbati)', category: 'Pulses', icon: '🫘', region: 'Varanasi, UP & Odisha', avgPrice: 46, season: 'Kharif/Zaid' },

  // ─── 3. FRUITS ───────────────────────────────────────────────────
  { name: 'Mango (Alphonso / Hapus)', category: 'Fruits', icon: '🥭', region: 'Ratnagiri & Devgad, Maharashtra', avgPrice: 120, season: 'Summer' },
  { name: 'Mango (Kesar / Dasheri)', category: 'Fruits', icon: '🥭', region: 'Gir, Gujarat & Malihabad, UP', avgPrice: 75, season: 'Summer' },
  { name: 'Banana (Robusta / Grand Naine)', category: 'Fruits', icon: '🍌', region: 'Jalgaon, Maharashtra & Theni, TN', avgPrice: 28, season: 'All Year' },
  { name: 'Apple (Kashmiri Delicious)', category: 'Fruits', icon: '🍎', region: 'Sopore, Kashmir & Shimla, HP', avgPrice: 135, season: 'Autumn' },
  { name: 'Nagpur Orange (Santra)', category: 'Fruits', icon: '🍊', region: 'Nagpur & Amravati, Maharashtra', avgPrice: 52, season: 'Winter' },
  { name: 'Pomegranate (Bhagwa Anar)', category: 'Fruits', icon: '🍎', region: 'Solapur & Sangli, Maharashtra', avgPrice: 110, season: 'All Year' },
  { name: 'Grapes (Thompson Seedless)', category: 'Fruits', icon: '🍇', region: 'Nashik & Tasgaon, Maharashtra', avgPrice: 65, season: 'Spring' },
  { name: 'Papaya (Taiwan Red Lady)', category: 'Fruits', icon: '🧡', region: 'Anantapur, AP & Anand, Gujarat', avgPrice: 24, season: 'All Year' },
  { name: 'Guava (Allahabad Safeda / VNR)', category: 'Fruits', icon: '🟢', region: 'Prayagraj, UP & Raipur', avgPrice: 42, season: 'Winter' },
  { name: 'Watermelon (Tarbooz)', category: 'Fruits', icon: '🍉', region: 'Bellary, Karnataka & Rajasthan', avgPrice: 16, season: 'Summer' },
  { name: 'Muskmelon (Kharbooja)', category: 'Fruits', icon: '🍈', region: 'Mathura, UP & Punjab', avgPrice: 25, season: 'Summer' },
  { name: 'Lemon / Lime (Kagzi Nimbu)', category: 'Fruits', icon: '🍋', region: 'Nellore, AP & Mehsana, Gujarat', avgPrice: 50, season: 'All Year' },
  { name: 'Pineapple (Queen Variety)', category: 'Fruits', icon: '🍍', region: 'Vazhakulam, Kerala & Tripura', avgPrice: 38, season: 'All Year' },
  { name: 'Jackfruit (Raw & Ripe Kathal)', category: 'Fruits', icon: '🟡', region: 'Panruti, TN & Idukki, Kerala', avgPrice: 30, season: 'Summer' },
  { name: 'Sapota (Chikoo)', category: 'Fruits', icon: '🤎', region: 'Dahanu, Maharashtra & Navsari', avgPrice: 45, season: 'All Year' },
  { name: 'Custard Apple (Sitaphal)', category: 'Fruits', icon: '💚', region: 'Beed, Maharashtra & Mahbubnagar', avgPrice: 75, season: 'Winter' },
  { name: 'Tender Green Coconut', category: 'Fruits', icon: '🥥', region: 'Pollachi, TN & Mandya, Karnataka', avgPrice: 32, season: 'All Year' },
  { name: 'Strawberry (Chandler / Sweet Charlie)', category: 'Fruits', icon: '🍓', region: 'Mahabaleshwar, Maharashtra', avgPrice: 180, season: 'Winter' },

  // ─── 4. VEGETABLES ───────────────────────────────────────────────
  { name: 'Tomato (Hybrid / Desi Tamatar)', category: 'Vegetables', icon: '🍅', region: 'Kolar, Karnataka & Madanapalle, AP', avgPrice: 30, season: 'All Year' },
  { name: 'Onion (Nashik Red Pyaz)', category: 'Vegetables', icon: '🧅', region: 'Lasalgaon, Nashik & Karnataka', avgPrice: 36, season: 'All Year' },
  { name: 'Potato (Jyoti / Chipsona Aloo)', category: 'Vegetables', icon: '🥔', region: 'Agra, UP & Hooghly, WB', avgPrice: 22, season: 'All Year' },
  { name: 'Green Chilli (G4 / Hari Mirch)', category: 'Vegetables', icon: '🌶️', region: 'Guntur, AP & Indore, MP', avgPrice: 42, season: 'All Year' },
  { name: 'Brinjal / Eggplant (Baingan)', category: 'Vegetables', icon: '🍆', region: 'Belgaum, Karnataka & Hooghly', avgPrice: 28, season: 'All Year' },
  { name: 'Cauliflower (Phool Gobhi)', category: 'Vegetables', icon: '🥦', region: 'Jalandhar, Punjab & Meerut, UP', avgPrice: 25, season: 'Winter/All' },
  { name: 'Capsicum / Bell Pepper (Shimla Mirch)', category: 'Vegetables', icon: '🫑', region: 'Solan, HP & Pune, Maharashtra', avgPrice: 55, season: 'All Year' },
  { name: 'Okra / Lady Finger (Bhindi)', category: 'Vegetables', icon: '🌿', region: 'Surat, Gujarat & Ranga Reddy, TG', avgPrice: 34, season: 'All Year' },
  { name: 'Cucumber (Desi Kheera)', category: 'Vegetables', icon: '🥒', region: 'Nuh, Haryana & Bangalore Rural', avgPrice: 20, season: 'All Year' },
  { name: 'Carrot (Red Desi Gajar)', category: 'Vegetables', icon: '🥕', region: 'Amritsar, Punjab & Ooty, TN', avgPrice: 28, season: 'Winter' },
  { name: 'Radish (White Mooli)', category: 'Vegetables', icon: '🌿', region: 'Alwar, Rajasthan & Meerut, UP', avgPrice: 16, season: 'All Year' },
  { name: 'Bitter Gourd (Karela)', category: 'Vegetables', icon: '🌿', region: 'Cuttack, Odisha & Karimnagar', avgPrice: 38, season: 'All Year' },
  { name: 'Bottle Gourd (Lauki / Ghia)', category: 'Vegetables', icon: '🌿', region: 'Sonipat, Haryana & Bareilly, UP', avgPrice: 18, season: 'All Year' },
  { name: 'Ridge Gourd (Turai / Dodka)', category: 'Vegetables', icon: '🌿', region: 'Pune, Maharashtra & Mehsana', avgPrice: 26, season: 'All Year' },
  { name: 'Pumpkin (Kaddu / Bhopal)', category: 'Vegetables', icon: '🎃', region: 'Faizabad, UP & Mandya, Karnataka', avgPrice: 15, season: 'All Year' },
  { name: 'Green Peas (Matar)', category: 'Vegetables', icon: '🫛', region: 'Jabalpur, MP & Himachal Pradesh', avgPrice: 60, season: 'Winter' },
  { name: 'French Beans (Farasbi)', category: 'Vegetables', icon: '🫘', region: 'Kolar, Karnataka & Nilgiris, TN', avgPrice: 48, season: 'All Year' },
  { name: 'Drumstick / Moringa (Sahjan)', category: 'Vegetables', icon: '🌿', region: 'Dindigul, TN & Chittoor, AP', avgPrice: 44, season: 'All Year' },
  { name: 'Garlic (Lahsun)', category: 'Vegetables', icon: '🧄', region: 'Mandsaur, MP & Kota, Rajasthan', avgPrice: 85, season: 'Winter/Rabi' },
  { name: 'Ginger (Fresh Adrak)', category: 'Vegetables', icon: '🌿', region: 'Wayanad, Kerala & Shimoga', avgPrice: 95, season: 'All Year' },
  { name: 'Sweet Potato (Shakarkandi)', category: 'Vegetables', icon: '🍠', region: 'Mayurbhanj, Odisha & Belgaum', avgPrice: 28, season: 'Winter' },
  { name: 'Mushroom (Fresh Button Khumbi)', category: 'Vegetables', icon: '🍄', region: 'Solan, HP & Dehradun, UK', avgPrice: 120, season: 'All Year' },

  // ─── 5. LEAFY VEGETABLES (FARMING SPECIAL) ───────────────────────
  { name: 'Spinach (Desi Palak Saag)', category: 'Leafy Vegetables', icon: '🥬', region: 'Delhi NCR, Punjab & Maharashtra', avgPrice: 25, season: 'All Year' },
  { name: 'Fenugreek Leaves (Fresh Methi)', category: 'Leafy Vegetables', icon: '🌿', region: 'Nagaur, Rajasthan & Pune', avgPrice: 32, season: 'Winter' },
  { name: 'Amaranth Leaves (Chaulai / Thotakura)', category: 'Leafy Vegetables', icon: '🥬', region: 'Guntur, AP & West Bengal', avgPrice: 26, season: 'All Year' },
  { name: 'Fresh Coriander Leaves (Dhaniya Patta)', category: 'Leafy Vegetables', icon: '🌿', region: 'Kota, Rajasthan & Bangalore', avgPrice: 38, season: 'All Year' },
  { name: 'Fresh Mint Leaves (Pudina)', category: 'Leafy Vegetables', icon: '🌿', region: 'Barabanki, UP & Punjab', avgPrice: 30, season: 'Summer/All' },
  { name: 'Curry Leaves (Kadi Patta)', category: 'Leafy Vegetables', icon: '🌿', region: 'Coimbatore, TN & Krishna, AP', avgPrice: 42, season: 'All Year' },
  { name: 'Mustard Greens (Sarson Ka Saag)', category: 'Leafy Vegetables', icon: '🥬', region: 'Bhatinda, Punjab & Karnal', avgPrice: 22, season: 'Winter' },
  { name: 'Bathua (Chenopodium Album Saag)', category: 'Leafy Vegetables', icon: '🥬', region: 'Alwar, Rajasthan & Western UP', avgPrice: 24, season: 'Winter' },
  { name: 'Sorrel Leaves (Gongura / Pitwaa)', category: 'Leafy Vegetables', icon: '🥬', region: 'Guntur, AP & Warangal, TG', avgPrice: 28, season: 'All Year' },
  { name: 'Moringa / Drumstick Leaves (Munagaku)', category: 'Leafy Vegetables', icon: '🌿', region: 'Theni, TN & Rayalaseema, AP', avgPrice: 35, season: 'All Year' },
  { name: 'Cabbage (Patta Gobhi)', category: 'Leafy Vegetables', icon: '🥬', region: 'Nashik, Maharashtra & Mandi, HP', avgPrice: 18, season: 'All Year' },
  { name: 'Spring Onion Greens (Hara Pyaz)', category: 'Leafy Vegetables', icon: '🧅', region: 'Nashik, Maharashtra & Punjab', avgPrice: 36, season: 'Winter/All' },
  { name: 'Crisp Green Lettuce', category: 'Leafy Vegetables', icon: '🥬', region: 'Ooty, TN & Solan, HP', avgPrice: 55, season: 'All Year' },
  { name: 'Dill Leaves (Shepu / Suva Bhaji)', category: 'Leafy Vegetables', icon: '🌿', region: 'Gujarat & Western Maharashtra', avgPrice: 30, season: 'Winter' },
  { name: 'Malabar Spinach (Poi Saag / Basale)', category: 'Leafy Vegetables', icon: '🥬', region: 'Coastal Karnataka & West Bengal', avgPrice: 25, season: 'Kharif/Monsoon' },

  // ─── 6. SPICES & CONDIMENTS ──────────────────────────────────────
  { name: 'Turmeric (Salem / Nizamabad Haldi)', category: 'Spices & Condiments', icon: '🟡', region: 'Nizamabad, TG & Erode, TN', avgPrice: 130, season: 'Rabi' },
  { name: 'Dry Red Chilli (Guntur Teja / Byadgi)', category: 'Spices & Condiments', icon: '🌶️', region: 'Guntur, AP & Byadgi, Karnataka', avgPrice: 160, season: 'Rabi' },
  { name: 'Black Pepper (Tellicherry Kali Mirch)', category: 'Spices & Condiments', icon: '⚫', region: 'Wayanad, Kerala & Coorg, KA', avgPrice: 520, season: 'Winter' },
  { name: 'Cumin Seeds (Unjha Jeera)', category: 'Spices & Condiments', icon: '🌿', region: 'Unjha, Gujarat & Jodhpur', avgPrice: 270, season: 'Rabi' },
  { name: 'Coriander Seeds (Dhaniya Seed)', category: 'Spices & Condiments', icon: '🌿', region: 'Ramganj Mandi, Rajasthan', avgPrice: 98, season: 'Rabi' },
  { name: 'Green Cardamom (Chhoti Elaichi)', category: 'Spices & Condiments', icon: '🌿', region: 'Idukki, Kerala & Bodinayakanur', avgPrice: 1400, season: 'Autumn' },
  { name: 'Cloves (Laung)', category: 'Spices & Condiments', icon: '🌿', region: 'Kanyakumari, TN & Kerala', avgPrice: 880, season: 'Winter' },
  { name: 'Cinnamon (Dalchini Bark)', category: 'Spices & Condiments', icon: '🌿', region: 'Kannur, Kerala & Nilgiris', avgPrice: 340, season: 'All Year' },
  { name: 'Saffron (Kashmiri Mongra Kesar)', category: 'Spices & Condiments', icon: '🌸', region: 'Pampore, Kashmir', avgPrice: 220000, season: 'Autumn' },
  { name: 'Fennel Seeds (Lucknowi Saunf)', category: 'Spices & Condiments', icon: '🌿', region: 'Abu Road, Rajasthan & Gujarat', avgPrice: 175, season: 'Rabi' },
  { name: 'Ajwain (Desi Carom Seeds)', category: 'Spices & Condiments', icon: '🌿', region: 'Neemuch, MP & Rajasthan', avgPrice: 155, season: 'Rabi' },
  { name: 'Tamarind (Processed Imli)', category: 'Spices & Condiments', icon: '🟤', region: 'Hindupur, AP & Dharmapuri, TN', avgPrice: 85, season: 'Summer' },

  // ─── 7. OILSEEDS & CASH CROPS ────────────────────────────────────
  { name: 'Mustard Seeds (Yellow / Black Sarson)', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Bharatpur, Rajasthan & MP', avgPrice: 58, season: 'Rabi' },
  { name: 'Groundnut / Peanut (Moongphali)', category: 'Oilseeds & Cash Crops', icon: '🥜', region: 'Junagadh, Gujarat & Anantapur', avgPrice: 68, season: 'Kharif' },
  { name: 'Soybean (Yellow Gold)', category: 'Oilseeds & Cash Crops', icon: '🟡', region: 'Ujjain, MP & Latur, Maharashtra', avgPrice: 52, season: 'Kharif' },
  { name: 'Sunflower Seeds', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Bijapur, Karnataka & Latur', avgPrice: 62, season: 'Rabi/Kharif' },
  { name: 'Sesame Seeds (White / Black Til)', category: 'Oilseeds & Cash Crops', icon: '⚪', region: 'Amreli, Gujarat & Sumerpur, RJ', avgPrice: 125, season: 'Kharif' },
  { name: 'Raw Cotton (Shankar-6 Kapas)', category: 'Oilseeds & Cash Crops', icon: '☁️', region: 'Rajkot, Gujarat & Adilabad, TG', avgPrice: 66, season: 'Kharif' },
  { name: 'Sugarcane (High Sugar Ganna)', category: 'Oilseeds & Cash Crops', icon: '🎋', region: 'Kolhapur, Maharashtra & Muzaffarnagar', avgPrice: 4, season: 'Annual' },
  { name: 'Castor Seeds (Arandi)', category: 'Oilseeds & Cash Crops', icon: '🌻', region: 'Mehsana, Gujarat & Banaskantha', avgPrice: 60, season: 'Kharif' },

  // ─── 8. PLANTATION CROPS ──────────────────────────────────────────
  { name: 'Assam Orthodox & CTC Tea', category: 'Plantation Crops', icon: '🍵', region: 'Dibrugarh, Assam & Darjeeling', avgPrice: 240, season: 'All Year' },
  { name: 'Coffee (Arabica / Robusta Parchment)', category: 'Plantation Crops', icon: '☕', region: 'Chikmagalur & Coorg, Karnataka', avgPrice: 290, season: 'Winter' },
  { name: 'Areca Nut (Supari / Betel Nut)', category: 'Plantation Crops', icon: '🟤', region: 'Shimoga, Karnataka & Kasaragod', avgPrice: 340, season: 'Winter' },
  { name: 'Cashew Nut (Raw Kaju)', category: 'Plantation Crops', icon: '🥜', region: 'Sindhudurg, MH & Kollam, Kerala', avgPrice: 680, season: 'Summer' },
]

export const inferCategory = (crop) => {
  if (crop.category?.name) return crop.category.name
  const name = (crop.name || '').toLowerCase()

  const table = [
    ['Leafy Vegetables', [
      'palak', 'spinach', 'methi', 'fenugreek', 'chaulai', 'amaranth', 'dhaniya',
      'coriander leaves', 'pudina', 'mint', 'curry leaves', 'kadi patta', 'sarson ka saag',
      'sarson saag', 'bathua', 'gongura', 'sorrel', 'moringa leaves', 'munagaku',
      'cabbage', 'lettuce', 'spring onion', 'hara pyaz', 'shepu', 'dill', 'poi saag', 'basale'
    ]],
    ['Cereals', [
      'wheat', 'gehun', 'sharbati', 'rice', 'paddy', 'chawal', 'dhan', 'basmati',
      'sona masuri', 'maize', 'corn', 'makka', 'bajra', 'millet', 'jowar', 'sorghum',
      'ragi', 'nachni', 'kangni', 'barley', 'jau', 'oats', 'jai', 'kodo', 'samai', 'kutki'
    ]],
    ['Pulses', [
      'chana', 'chickpea', 'gram', 'toor', 'arhar', 'moong', 'urad', 'masoor', 'lentil',
      'rajma', 'kidney bean', 'kulthi', 'horse gram', 'moth', 'matki', 'lobia', 'cowpea', 'dal'
    ]],
    ['Fruits', [
      'mango', 'aam', 'banana', 'kela', 'apple', 'seb', 'orange', 'santra', 'anar',
      'pomegranate', 'grape', 'angoor', 'papaya', 'papita', 'guava', 'amrud', 'watermelon',
      'tarbooz', 'muskmelon', 'kharbooja', 'lemon', 'nimbu', 'lime', 'pineapple', 'ananas',
      'jackfruit', 'kathal', 'chikoo', 'sapota', 'sitaphal', 'coconut', 'nariyal', 'strawberry'
    ]],
    ['Spices & Condiments', [
      'haldi', 'turmeric', 'chilli', 'mirch', 'pepper', 'jeera', 'cumin', 'elaichi',
      'cardamom', 'clove', 'laung', 'cinnamon', 'dalchini', 'kesar', 'saffron',
      'saunf', 'fennel', 'ajwain', 'tamarind', 'imli', 'hing', 'asafoetida'
    ]],
    ['Oilseeds & Cash Crops', [
      'sarson', 'mustard', 'groundnut', 'moongphali', 'peanut', 'soybean', 'sunflower',
      'til', 'sesame', 'kapas', 'cotton', 'sugarcane', 'ganna', 'arandi', 'castor', 'alsi', 'flax'
    ]],
    ['Plantation Crops', [
      'tea', 'coffee', 'supari', 'areca', 'kaju', 'cashew', 'rubber', 'cocoa'
    ]],
    ['Vegetables', [
      'tomato', 'tamatar', 'onion', 'pyaz', 'potato', 'aloo', 'brinjal', 'baingan',
      'cauliflower', 'gobhi', 'capsicum', 'shimla', 'bhindi', 'okra', 'kheera', 'cucumber',
      'gajar', 'carrot', 'mooli', 'radish', 'karela', 'lauki', 'turai', 'kaddu', 'pumpkin',
      'matar', 'peas', 'beans', 'sahjan', 'drumstick', 'lahsun', 'garlic', 'adrak', 'ginger',
      'shakarkandi', 'sweet potato', 'mushroom', 'khumbi', 'arbi', 'suran'
    ]],
  ]

  for (const [category, keywords] of table) {
    if (keywords.some((k) => name.includes(k))) return category
  }
  return 'Vegetables'
}
