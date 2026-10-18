# UniRetrieve Mobile App (React Native / Expo)

Cross-platform native mobile application for **UniRetrieve — An AI-Powered Geospatial Framework for Secure Campus Asset Recovery**.

---

## 📱 Features

1. **Native Camera & Gallery Ingestion:** Capture photos of lost or found items with immediate image preview and compression (`expo-camera`, `expo-image-picker`).
2. **Native GPS Geolocation:** Acquires device hardware GPS coordinates and performs reverse geocoding to resolve campus location labels (`expo-location`).
3. **Automated AI Categorization:** Submits image to backend YOLOv5 model for categorization and visual tag suggestions.
4. **Interactive Challenge-Response Claims:** Submit ownership verification with Student ID confirmation directly from your phone.
5. **Real-time Peer-to-Peer Chat:** Integrated Socket.io messaging with quick meeting arrangement action presets.
6. **Dark/Cyberpunk UI:** Matches the web design language with neon cyan, amber, and red accents.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go app](https://expo.dev/client) installed on your physical iOS or Android device (or an active Android Studio Emulator / iOS Simulator).

### 2. Configure Backend API Endpoint
Open `mobile/src/api/config.js`:
- For **Android Emulator**: uses `http://10.0.2.2:3001` (default).
- For **Physical Phone via Expo Go**: replace with your development machine's local Wi-Fi IP address (e.g., `http://192.168.1.15:3001`).
- For **iOS Simulator**: uses `http://localhost:3001`.

### 3. Installation
Navigate into the mobile folder:
```bash
cd mobile
npm install
```

### 4. Start the Application
```bash
npx expo start
```
- **Android Device / Emulator:** Press `a` in the terminal or scan the displayed terminal QR code using the **Expo Go** app on Android.
- **iOS Device / Simulator:** Scan the QR code using the iOS Camera app to open Expo Go.
- **Web Preview:** Press `w` to run in web mode for quick UI verification.

---

## 📁 Architecture Overview

```
mobile/
├── App.js                   # Root component with Providers & Navigation
├── app.json                 # Expo project & permission configuration
├── package.json             # Mobile dependencies
└── src/
    ├── api/
    │   └── config.js        # Host detection & REST/Socket endpoints
    ├── context/
    │   ├── AuthContext.js   # JWT session & user credentials
    │   └── AppContext.js    # Items, matches, claims, & socket state
    ├── navigation/
    │   └── AppNavigator.js  # BottomTab & NativeStack navigation
    ├── screens/
    │   ├── AuthScreen.js         # Student sign-in & registration
    │   ├── HomeScreen.js         # Overview & recovery statistics
    │   ├── BrowseScreen.js       # Search, filter, & browse catalog
    │   ├── ReportItemScreen.js   # Camera photo & GPS coordinates capture
    │   ├── MatchesScreen.js      # AI similarity cards & claim modal
    │   ├── ChatScreen.js         # Live Socket.io recovery chat
    │   └── MyItemsScreen.js      # User reports & profile actions
    └── theme/
        └── colors.js        # Color palette
```
