import React, { useState, useRef, useEffect } from 'react'
import { useAppThemeLanguage, INDIAN_LANGUAGES } from '../context/ThemeLanguageContext'

/**
 * AgriChatbot: Small, responsive, portable AI assistant
 * containing comprehensive knowledge about the AgriBridge platform,
 * all 23 Indian languages, mobile OTP delivery to phone, password eye toggle,
 * Pan-India bank dropdown, accurate GPS location, live scrolling news,
 * and streamlined farmer & buyer profiles (About, farming methods & monthly volume removed).
 */
const WELCOME_GREETINGS = {
  en: "Hello! 👋 I am **AgriBot AI**, your smart agricultural assistant for AgriBridge.\n\nI can help you with:\n• 🌐 All 23 Indian Languages & Dark/Light Themes\n• 🌾 Listing crops & checking Pan-India APMC rates\n• 📱 Mobile OTP delivery to phone (SMS & WhatsApp)\n• 👁️ Eye toggle to check and verify passwords\n• 🏦 Pan-India Bank dropdown for payouts & checkouts\n• 📍 High-accuracy GPS location detection\n• 📺 Live scrolling news from DD Kisan, Krishi Jagran, ICAR & PIB\n\nHow can I help you today?",
  hi: "नमस्ते! 👋 मैं **AgriBot AI** हूँ, एग्रीब्रिज पर आपका स्मार्ट कृषि सहायक।\n\nमैं आपकी सहायता कर सकता हूँ:\n• 🌐 भारत की सभी प्रमुख भाषाएं व डार्क/लाइट थीम\n• 🌾 फसलें जोड़ना व मंडी भाव देखना\n• 📱 फोन पर सीधा OTP (SMS व WhatsApp)\n• 👁️ पासवर्ड देखने के लिए आँख का विकल्प\n• 🏦 सभी भारतीय बैंकों की ड्रॉपडाउन सूची\n• 📍 सटीक GPS स्थान निर्धारण\n• 📺 डीडी किसान व कृषि जागरण से लाइव ब्रेकिंग न्यूज़\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?",
  te: "నమస్కారం! 👋 నేను **AgriBot AI**, అగ్రిబ్రిడ్జ్‌లో మీ స్మార్ట్ వ్యవసాయ సహాయకుడిని.\n\nనేను మీకు సహాయం చేయగలను:\n• 🌐 23 భారతీయ భాషలు మరియు డార్క్/లైట్ థీమ్‌లు\n• 🌾 పంటలను నమోదు చేయడం మరియు మార్కెట్ ధరలు\n• 📱 ఫోన్‌కు నేరుగా వచ్చే OTP (SMS & WhatsApp)\n• 👁️ పాస్‌వర్డ్ చూసేందుకు ఐ ఆప్షన్\n• 🏦 భారతదేశంలోని అన్ని బ్యాంకుల డ్రాప్‌డౌన్ మెనూ\n• 📍 ఖచ్చితమైన GPS స్థాన గుర్తింపు\n• 📺 DD కిసాన్ మరియు కృషి జాగరణ్ లైవ్ న్యూస్ స్క్రోలింగ్\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
  ta: "வணக்கம்! 👋 நான் **AgriBot AI**, உங்கள் ஸ்மார்ட் வேளாண் உதவியாளர்.\n\nநான் உங்களுக்கு உதவ முடியும்:\n• 🌐 23 இந்திய மொழிகள் மற்றும் டார்க்/லைட் தீம்கள்\n• 🌾 பயிர்களை பட்டியலிடுதல் மற்றும் மண்டி விலைகள்\n• 📱 போனுக்கு நேரடியாக வரும் OTP (SMS & WhatsApp)\n• 👁️ கடவுச்சொல்லை சரிபார்க்க கண் ஐகான்\n• 🏦 அனைத்து இந்திய வங்கிகளின் கீழிறங்கும் மெனு\n• 📍 துல்லியமான GPS இருப்பிடத்தைக் கண்டறிதல்\n• 📺 DD கிசான் மற்றும் கிருஷி ஜாக்ரான் நேரலை செய்திகள்\n\nஇன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
  kn: "ನಮಸ್ಕಾರ! 👋 ನಾನು **AgriBot AI**, ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ.\n\nನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• 🌐 ಎಲ್ಲಾ 23 ಭಾರತೀಯ ಭಾಷೆಗಳು ಮತ್ತು ಥೀಮ್‌ಗಳು\n• 🌾 ಬೆಳೆಗಳ ಪಟ್ಟಿ ಮತ್ತು ಮಂಡಿ ದರಗಳು\n• 📱 ಫೋನ್‌ಗೆ ನೇರವಾಗಿ ಬರುವ OTP (SMS & WhatsApp)\n• 👁️ ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲಿಸಲು ಐ ಆಯ್ಕೆ\n• 🏦 ಭಾರತದ ಎಲ್ಲಾ ಬ್ಯಾಂಕ್‌ಗಳ ಡ್ರಾಪ್‌ಡೌನ್ ಪಟ್ಟಿ\n• 📍 ನಿಖರವಾದ GPS ಸ್ಥಳ ಪತ್ತೆ\n• 📺 DD ಕಿಸಾನ್ ಮತ್ತು ಲೈವ್ ಕೃಷಿ ಸುದ್ದಿಗಳು\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
  mr: "नमस्कार! 👋 मी **AgriBot AI** आहे, तुमचा स्मार्ट कृषी सहाय्यक.\n\nमी तुम्हाला मदत करू शकतो:\n• 🌐 सर्व २३ भारतीय भाषा आणि डार्क/लाइट थीम\n• 🌾 पिके जोडणे आणि थेट बाजारभाव पाहणे\n• 📱 थेट फोनवर येणारा OTP (SMS व WhatsApp)\n• 👁️ पासवर्ड तपासण्यासाठी डोळ्याचा पर्याय\n• 🏦 सर्व भारतीय बँकांची ड्रॉपडाउन यादी\n• 📍 अचूक GPS स्थान शोध\n• 📺 डीडी किसान व कृषी जागरण थेट बातम्या\n\nआज मी तुम्हाला कशी मदत करू शकतो?",
  bn: "নমস্কার! 👋 আমি **AgriBot AI**, আপনার স্মার্ট কৃষি সহকারী।\n\nআমি আপনাকে সাহায্য করতে পারি:\n• 🌐 ভারতের সব ২৩টি ভাষা এবং থিম\n• 🌾 ফসল তালিকা ও মাণ্ডি দর\n• 📱 ফোনে সরাসরি OTP (SMS ও WhatsApp)\n• 👁️ পাসওয়ার্ড দেখার জন্য আই অপশন\n• 🏦 সর্বভারতীয় ব্যাংকের ড্রপডাউন তালিকা\n• 📍 সঠিক GPS অবস্থান সন্ধান\n• 📺 ডিডি কিষাণ ও লাইভ কৃষি সংবাদ\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  gu: "નમસ્તે! 👋 હું **AgriBot AI** છું, તમારો સ્માર્ટ કૃષિ સહાયક.\n\nહું તમને મદદ કરી શકું છું:\n• 🌐 ભારતીય ભાષાઓ અને થીમ\n• 🌾 પાક સૂચિ અને માર્કેટ યાર્ડ ભાવો\n• 📱 ફોન પર સીધો OTP (SMS અને WhatsApp)\n• 👁️ પાસવર્ડ જોવા માટે આઇ વિકલ્પ\n• 🏦 ઓલ-ઇન્ડિયા બેંક ડ્રોપડાઉન\n• 📍 સચોટ GPS સ્થાન નિર્ધારણ\n• 📺 ડીડી કિસાન લાઇવ કૃષિ સમાચાર\n\nઆજે હું તમારી શું મદદ કરી શકું?",
  ml: "നമസ്കാരം! 👋 ഞാൻ **AgriBot AI**, നിങ്ങളുടെ കൃഷി സഹായി.\n\nഎനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും:\n• 🌐 എല്ലാ ഇന്ത്യൻ ഭാഷകളും തീമുകളും\n• 🌾 വിളകൾ ചേർക്കലും മാർക്കറ്റ് നിരക്കുകളും\n• 📱 ഫോണിലേക്ക് വരുന്ന OTP (SMS & WhatsApp)\n• 👁️ പാസ്‌വേഡ് കാണാൻ ഐ ഓപ്ഷൻ\n• 🏦 അഖിലേന്ത്യാ ബാങ്ക് ഡ്രോപ്പ്ഡൗൺ മെനു\n• 📍 കൃത്യമായ GPS ലൊക്കേഷൻ\n• 📺 തത്സമയ കൃഷി വാർത്തകൾ\n\nഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കണം?",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 👋 ਮੈਂ **AgriBot AI** ਹਾਂ, ਤੁਹਾਡਾ ਸਮਾਰਟ ਖੇਤੀ ਸਹਾਇਕ।\n\nਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n• 🌐 ਭਾਰਤ ਦੀਆਂ ਸਾਰੀਆਂ 23 ਭਾਸ਼ਾਵਾਂ\n• 🌾 ਫਸਲਾਂ ਦੀ ਸੂਚੀ ਤੇ ਮੰਡੀ ਭਾਅ\n• 📱 ਫੋਨ ਤੇ ਸਿੱਧਾ OTP (SMS ਤੇ WhatsApp)\n• 👁️ ਪਾਸਵਰਡ ਦੇਖਣ ਲਈ ਅੱਖ ਦਾ ਬਟਨ\n• 🏦 ਭਾਰਤ ਦੇ ਸਾਰੇ ਬੈਂਕਾਂ ਦੀ ਸੂਚੀ\n• 📍 ਸਹੀ GPS ਲੋਕੇਸ਼ਨ\n• 📺 ਡੀਡੀ ਕਿਸਾਨ ਲਾਈਵ ਖੇਤੀ ਖ਼ਬਰਾਂ\n\nਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  ur: "السلام علیکم! 👋 میں **AgriBot AI** ہوں، آپ کا زرعی معاون۔\n\nمیں آپ کی مدد کر سکتا ہوں:\n• 🌐 تمام 23 ہندوستانی زبانیں\n• 🌾 فصلوں کی فہرست اور منڈی کے بھاؤ\n• 📱 فون پر براہ راست موصول ہونے والا OTP\n• 👁️ پاس ورڈ چیک کرنے کا آپشن\n• 🏦 تمام ہندوستانی بینکوں کی فہرست\n• 📍 درست GPS لوکیشن\n• 📺 لائیو زرعی خبریں\n\nآج میں آپ کی کیا مدد کر سکتا ہوں؟"
}

const AgriChatbot = () => {
  const { t, language, setLanguage } = useAppThemeLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const firstName = localStorage.getItem('firstName') || 'Friend'

  const getGreeting = (lang) => {
    return WELCOME_GREETINGS[lang] || WELCOME_GREETINGS.en
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: getGreeting(language),
      time: 'Just now'
    }
  ])

  // Update greeting when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{ id: 1, sender: 'bot', text: getGreeting(language), time: 'Just now' }]
      }
      return prev
    })
  }, [language])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  // Suggested prompt chips covering all new platform capabilities
  const suggestedQuestions = [
    '🌐 What languages are supported?',
    '📱 How does OTP arrive on phone?',
    '👁️ How to check password with eye icon?',
    '🏦 Which banks are in the Pan-India dropdown?',
    '📍 How is accurate GPS location detected?',
    '📺 How to view & update live news scrolling?',
    '🌾 How do I list crops as a farmer?',
    '🥬 What leafy vegetables are available?',
    '🎨 How to toggle between Dark & Light themes?'
  ]

  // Intelligent AI Response Engine
  const generateBotReply = (query) => {
    const q = query.toLowerCase()

    // 1. All Languages in India
    if (q.includes('language') || q.includes('bhasha') || q.includes('hindi') || q.includes('telugu') || q.includes('tamil') || q.includes('kannada') || q.includes('marathi') || q.includes('bengali') || q.includes('gujarati') || q.includes('punjabi') || q.includes('odia') || q.includes('malayalam') || q.includes('assamese') || q.includes('urdu') || q.includes('sanskrit')) {
      return `🌐 **All Available Languages in India on AgriBridge:**\n\nAgriBridge supports all **23 major Indian languages** (all 22 Eighth Schedule languages + English):\n\n1. 🇬🇧 English\n2. 🇮🇳 हिंदी (Hindi)\n3. 🇮🇳 తెలుగు (Telugu)\n4. 🇮🇳 தமிழ் (Tamil)\n5. 🇮🇳 ಕನ್ನಡ (Kannada)\n6. 🇮🇳 मराठी (Marathi)\n7. 🇮🇳 বাংলা (Bengali)\n8. 🇮🇳 ગુજરાતી (Gujarati)\n9. 🇮🇳 മലയാളം (Malayalam)\n10. 🇮🇳 ਪੰਜਾਬੀ (Punjabi)\n11. 🇮🇳 ଓଡ଼ିଆ (Odia)\n12. 🇮🇳 অসমীয়া (Assamese)\n13. 🇮🇳 اردو (Urdu)\n14. 🇮🇳 मैथिली (Maithili)\n15. 🇮🇳 संथाली (Santali)\n16. 🇮🇳 कॉशुर (Kashmiri)\n17. 🇮🇳 नेपाली (Nepali)\n18. 🇮🇳 कोंकणी (Konkani)\n19. 🇮🇳 سنڌي (Sindhi)\n20. 🇮🇳 डोगरी (Dogri)\n21. 🇮🇳 মণিপুরী (Manipuri)\n22. 🇮🇳 बोडो (Bodo)\n23. 🇮🇳 संस्कृतम् (Sanskrit)\n\n👉 You can switch your preferred language right here in the **AgriBot header dropdown** or in the **top navigation bar**!`
    }

    // 2. Theme (Dark & Light only - No Forest Theme)
    if (q.includes('theme') || q.includes('forest') || q.includes('dark') || q.includes('light') || q.includes('mode')) {
      return `🎨 **Theme Options on AgriBridge:**\n\n• The platform offers two clean, high-contrast themes:\n  1. **🌙 Dark Mode:** Optimized for low eye strain, battery efficiency, and night use in mandi yards.\n  2. **☀️ Light Mode:** Crisp, high-readability daytime viewing for bright outdoor farm environments.\n• **Note on Forest Theme:** As per specifications, the **Forest Green theme has been completely removed** from all pages. The theme switcher strictly toggles between **🌙 Dark** and **☀️ Light** modes.\n• Click the theme button in the navbar anytime to switch!`
    }

    // 3. OTP delivered directly to phone (SMS & WhatsApp)
    if (q.includes('otp') || q.includes('sms') || q.includes('whatsapp') || q.includes('phone') || q.includes('mobile') || q.includes('notification')) {
      return `📱 **OTP Delivery to Phone (SMS & WhatsApp):**\n\nWhen requesting an OTP on AgriBridge:\n• The OTP arrives directly on your mobile phone!\n• **Simulated Incoming Phone Notification:** A live on-screen alert banner pops up at the top showing the incoming message from *AGRIBRG-GOV* with your 6-digit verification code and a 1-click **⚡ Auto-Fill** button.\n• **Direct WhatsApp Delivery:** Click **💬 Open in WhatsApp** to launch the pre-filled verification code directly in WhatsApp Web or the WhatsApp mobile app.\n• **Direct SMS Delivery:** Click **📱 Open SMS** to trigger your phone's native messaging application with the OTP.\n• Email is completely removed — everything is tied directly to your 10-digit Indian mobile number!`
    }

    // 4. Eye Option to Check Password
    if (q.includes('eye') || q.includes('check password') || q.includes('show password') || q.includes('hide password') || q.includes('visibility') || q.includes('password')) {
      return `👁️ **Eye Option to Check Passwords:**\n\n• An interactive eye toggle button (**👁️ / 🙈**) is provided on **all password fields** across the platform:\n  1. **Login Page:** In the standard password login field.\n  2. **Forgot Password Screen:** In both the 'New Password' and 'Confirm New Password' fields.\n  3. **Register Page:** In the registration password field.\n• Simply click the eye icon to reveal the hidden characters and verify your password before submitting!`
    }

    // 5. Removed "About" and "Farming Method" (Farmer) / "Monthly Volume" (Buyer)
    if (q.includes('about') || q.includes('farming method') || q.includes('method') || q.includes('volume') || q.includes('monthly volume') || q.includes('profile')) {
      return `🧑‍🌾 **Streamlined Farmer & Buyer Personal Dashboards:**\n\nTo make profiles fast, practical, and clean for agricultural trade:\n• **For Farmers:**\n  - ❌ **Removed:** 'About Me' / bio narrative.\n  - ❌ **Removed:** 'Farming Method' page and selector.\n  - ✅ **Kept:** Farm Name, Land Area (Acres), Experience, High-Accuracy GPS Location, and Pan-India Bank Account.\n• **For Buyers:**\n  - ❌ **Removed:** 'About Me' narrative.\n  - ❌ **Removed:** 'Monthly Volume' field.\n  - ✅ **Kept:** Business / Mandi Trading Name, Delivery Address, GPS Location, and Pan-India Bank Account.\n• You can edit and update these details repeatedly — the dashboard auto-refreshes immediately upon saving!`
    }

    // 6. Accurate Location Detection (GPS & Nominatim)
    if (q.includes('location') || q.includes('gps') || q.includes('accurat') || q.includes('detect') || q.includes('nominatim') || q.includes('pincode') || q.includes('district') || q.includes('village')) {
      return `📍 **Accurate GPS & Mandi Location Detection:**\n\n• Both Farmers and Buyers can detect their location with pinpoint accuracy:\n• Click **📍 Detect Live GPS Location** in the Personal Dashboard.\n• AgriBridge uses high-accuracy device geolocation (\`enableHighAccuracy: true\`, \`maximumAge: 0\`) combined with **OpenStreetMap Nominatim Reverse Geocoding**.\n• It automatically resolves your:\n  - Exact village / locality / suburb\n  - Tehsil / sub-district & city\n  - District & State\n  - 6-digit Indian Postal Pincode\n• You can also enter a custom preferred delivery or mandi address anytime!`
    }

    // 7. Pan-India Bank Dropdown Menu
    if (q.includes('bank') || q.includes('dropdown') || q.includes('ifsc') || q.includes('account') || q.includes('payout') || q.includes('sbi') || q.includes('hdfc')) {
      return `🏦 **Pan-India Bank Dropdown Menu:**\n\n• The free-text bank input has been replaced with a comprehensive **Pan-India Bank Dropdown Menu** for both Farmers and Buyers.\n• It includes all operational banks across India:\n  - **Public Sector Banks:** State Bank of India (SBI), Punjab National Bank (PNB), Bank of Baroda, Canara Bank, Union Bank, etc.\n  - **Private Sector Banks:** HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra, IndusInd, IDBI, YES Bank, etc.\n  - **Regional Rural & Grameen Banks:** AP Grameena Vikas, Baroda UP Bank, Aryavart Bank, Kerala Gramin Bank, Prathama UP, Karnataka Gramin, etc.\n  - **Small Finance & Payments Banks:** AU Small Finance, Equitas, Airtel Payments Bank, Paytm Payments Bank, India Post Payments Bank (IPPB).\n• Selecting your bank automatically suggests the official 4-character **IFSC prefix**!`
    }

    // 8. Live Scrolling News from All-India Channels
    if (q.includes('news') || q.includes('channel') || q.includes('scroll') || q.includes('dd kisan') || q.includes('krishi jagran') || q.includes('ticker') || q.includes('icar') || q.includes('pib')) {
      return `📺 **Live Scrolling Agricultural News Ticker:**\n\n• Both **Farmer Dashboard** and **Buyer Dashboard** feature a continuous real-time scrolling news ticker.\n• Aggregates live breaking bulletins from leading agricultural channels across India:\n  - 📡 **DD Kisan** (Doordarshan Kisan TV)\n  - 🌾 **Krishi Jagran** (National Farm News)\n  - 🏛️ **ICAR Mandi Bulletins** (Indian Council of Agricultural Research)\n  - 📰 **PIB Agriculture** (Press Information Bureau, Govt of India)\n  - 📺 **ETV Annadata** (Regional Farm Broadcasts)\n  - ⚡ **Kisan Tak** (India Today Agri Network)\n• **Real-Time Updates:** Ticker automatically refreshes every 35 seconds, and you can click the **🔄 Update News** button anytime to instantly pull the latest mandi prices and weather advisories!`
    }

    // 9. Categories and Produce
    if (q.includes('categor') || q.includes('leafy') || q.includes('cereal') || q.includes('pulse') || q.includes('fruit') || q.includes('vegetable')) {
      return `🥬 **Produce Categories on AgriBridge:**\n\n1. **Cereals & Grains (🌾):** Sharbati Wheat, Basmati Rice, Sona Masuri, Bajra, Jowar, Ragi, Maize.\n2. **Pulses & Lentils (🫘):** Desi Chana, Kabuli Chana, Toor Dal, Moong, Urad, Masoor, Rajma.\n3. **Fruits (🍎):** Alphonso & Kesar Mango, Banana, Kashmiri Apple, Nagpur Orange, Pomegranate.\n4. **Vegetables (🥕):** Tomatoes, Nashik Onions, Potatoes, Brinjal, Capsicum, Okra, Peas, Garlic.\n5. **Leafy Vegetables (🥬):** Desi Palak, Fresh Methi, Chaulai, Dhaniya, Pudina, Gongura, Sarson Saag, Cabbage, Lettuce.\n6. **Spices (🌶️):** Salem Turmeric, Guntur Chilli, Black Pepper, Jeera/Cumin, Cardamom, Saffron.\n7. **Oilseeds & Cash Crops (🌻):** Mustard, Groundnut, Soybean, Sunflower, Sesame (Til), Cotton.`
    }

    // Default Fallback
    return `🌾 **AgriBridge AI Assistant:**\n\nI understand you are asking about: *"${query}"*.\n\nHere are the latest platform capabilities:\n• **23 Indian Languages:** Select from English and all 22 official languages of India.\n• **Themes:** Clean Dark & Light modes (no forest theme).\n• **Direct Phone OTP:** Delivery via on-screen banner, SMS, or WhatsApp.\n• **Password Eye Toggle:** View/hide passwords with 1-click.\n• **Accurate GPS Location:** OpenStreetMap Nominatim reverse geocoding.\n• **Pan-India Bank Dropdown:** Covering all public, private, and Grameen banks.\n• **Live News Ticker:** Real-time bulletins from DD Kisan, Krishi Jagran, ICAR, and PIB.\n\nType any query or select a topic chip below to learn more!`
  }

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const replyText = generateBotReply(query.trim())
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ─── Floating Launcher Button ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: isOpen ? '54px' : '62px',
          height: isOpen ? '54px' : '62px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          border: '2px solid rgba(255,255,255,0.25)',
          color: 'white',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(22, 101, 52, 0.5)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        id="agribot-launcher"
        title="Chat with AgriBot AI Assistant"
        aria-label="AgriBot AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* ─── Collapsible Chat Window (Portable for Mobile & Desktop) ── */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '95px',
          right: '24px',
          width: 'calc(100vw - 32px)',
          maxWidth: '400px',
          height: '560px',
          maxHeight: 'calc(100vh - 120px)',
          background: 'var(--bg-card)',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 15px 45px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>
                🤖
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: 700 }}>
                    AgriBot AI
                  </h3>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 8px #4ade80'
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#bbf7d0' }}>
                  AgriBridge Knowledge & Market Assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setMessages([{ id: 1, sender: 'bot', text: getGreeting(language), time: 'Just now' }])}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
                title="Reset conversation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ─── Indian Language Selector Strip (All 23 Indian Languages) ─── */}
          <div style={{
            background: '#064e3b',
            padding: '6px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 650 }}>
              <span>🌐</span> All-India Language:
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '200px'
              }}
              id="agribot-language-select"
              aria-label="Select Chatbot Language from All Indian Languages"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} style={{ background: '#0f172a', color: 'white' }}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-dark)'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                    color: 'white',
                    padding: '0.75rem 0.95rem',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                alignSelf: 'flex-start',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}>
                <span>🤖 AgriBot is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none'
          }}>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about AgriBridge..."
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-dark)',
                color: 'var(--text-main)',
                fontSize: '0.88rem'
              }}
              id="agribot-input"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
                opacity: !input.trim() ? 0.6 : 1
              }}
              id="agribot-send-btn"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AgriChatbot
