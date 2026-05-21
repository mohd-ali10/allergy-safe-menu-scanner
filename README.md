# 🛡️ AllergySafe Guardian

> **Real-Time AI Menu Analyzer & Severe Food Allergy Dining Companion**

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Gemini-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <strong>🍽️ Eat with Confidence • 🌍 Travel Safely • 🤖 AI-Powered Protection</strong>
</p>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Innovations](#-key-innovations)
- [🏗️ Architecture](#️-architecture)
- [🔄 Data Flow](#-data-flow)
- [🚀 Quick Start](#-quick-start)
- [🌐 API Reference](#-api-reference)
- [⚙️ Firebase Setup](#️-firebase-setup)
- [📦 Deployment](#-deployment)
- [⚠️ Medical Disclaimer](#️-medical-disclaimer)
- [📄 License](#-license)

---

## 🌟 Overview

**AllergySafe Guardian** is a cutting-edge dining companion that leverages Google's Gemini AI to analyze restaurant menus in real-time, identifying potential allergen risks for users with severe food allergies.

### 🎯 What It Does

| Feature | Benefit |
|---------|---------|
| 🔍 **Tri-Input Scanner** | Capture menus via text paste, image upload, or live camera |
| 🧠 **AI Reasoning** | Detect hidden ingredients & cross-contamination risks |
| 🎚️ **Vigilance Modes** | Choose safety strictness: Extreme, Standard, or Flexible |
| 🌐 **Multi-Language** | Translate results to communicate with kitchen staff worldwide |
| 🖨️ **Chef Warning Card** | Generate printable, high-contrast allergy alerts |
| ☁️ **Hybrid Sync** | Offline-first with automatic cloud backup via Firebase |

---

## ✨ Key Innovations

### 📸 Tri-Input Scanner

Capture menus your way:

- **📋 Clipboard**: Paste text from digital menus
- **📁 File Upload**: Upload JPEG, PNG, or WebP images
- **🎥 Live Camera**: Snap photos using device camera via WebRTC

### 🧠 GenAI Allergen Reasoning

Powered by Google Gemini 2.5 (Flash & Pro):

| Menu Item | Inferred Allergens | Why |
|-----------|-------------------|-----|
| 🥗 Pesto | Tree nuts, Dairy | Contains pine nuts, parmesan |
| 🍝 Béchamel | Dairy, Gluten | Made with butter, flour, milk |
| 🥢 Soy Sauce | Wheat, Soy | Traditional fermentation |
| 🧄 Aioli | Egg, Garlic | Egg yolk emulsion base |

### 🎚️ Vigilance Thresholds

Customize safety sensitivity:

- **🔴 Extreme**: Flag anything with reasonable doubt
- **🟡 Standard**: Balanced risk assessment (default)
- **🟢 Flexible**: Only flag high-probability risks

### 📊 Confidence Calibration

Safety-first post-processing: If AI returns "SAFE" but confidence < 70%, result auto-upgrades to **POSSIBLE_RISK** with a verification notice.

### 🌍 Native Translation

Output results in 50+ languages to communicate clearly with international kitchen staff.

### 🖨️ Chef Warning Card

Print-ready, high-contrast allergy alert card featuring:
- Bold life-threatening allergy warnings
- Dynamic ingredient lists from user profile
- Auto-generated "Ask the Chef" questions
- Print-optimized CSS that hides all non-essential UI

---

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph Client["📱 Frontend - React SPA"]
        A[User Interface]
        B[Profile Screen]
        C[Scan Screen]
        D[History Screen]
        E[Chef Card]
    end
    
    subgraph Backend["🖥️ Backend - Node/Express"]
        F[API Gateway]
        G[Auth Middleware]
        H[Gemini Router]
        I[Validation Layer]
    end
    
    subgraph Services["☁️ External Services"]
        J[Gemini AI API]
        K[Firebase Auth]
        L[Firestore DB]
    end
    
    A --> B & C & D & E
    C --> F
    F --> G --> H --> I
    I --> J
    G --> K
    H --> L
    
    style Client fill:#e1f5ff
    style Backend fill:#fff4e1
    style Services fill:#f0e1ff
```

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx - Root Router]
    
    App --> Layout[Layout Components]
    App --> Screens[Screen Components]
    
    Layout --> Header[Header.tsx]
    Layout --> Nav[BottomNavigation.tsx]
    
    Screens --> Profile[ProfileScreen.tsx]
    Screens --> Scan[ScanScreen.tsx]
    Screens --> History[HistoryScreen.tsx]
    Screens --> Settings[SettingsScreen.tsx]
    Screens --> ChefCard[ChefCardScreen.tsx]
    
    Scan --> Camera[useCamera Hook]
    Scan --> Analyzer[Analysis Engine]
    
    Profile --> Allergies[useAllergies Hook]
    History --> Storage[useScanHistory Hook]
    
    style App fill:#4a90d9,color:#fff
    style Layout fill:#7cb3e2,color:#fff
    style Screens fill:#7cb3e2,color:#fff
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TSX |
| AI | Google Gemini 2.5 (Flash/Pro) |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore |
| Deployment | Docker + Multi-stage builds |

### Project Structure

```
allergy-safe-menu-scanner/
├── src/
│   ├── components/     # UI components (layout + screens)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities & config
│   ├── firebase.ts     # Firebase client setup
│   ├── main.tsx        # App entry point
│   └── App.tsx         # Root router & context
├── server.ts           # Express API + Gemini router
├── firestore.rules     # Security rules
├── Dockerfile          # Production container
├── package.json        # Dependencies & scripts
└── tsconfig.json       # TypeScript config
```

---

## 🔄 Data Flow

### End-to-End Analysis Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant UI as 🎨 React UI
    participant API as 🔌 Express API
    participant AI as 🤖 Gemini AI
    participant DB as 💾 Firestore
    
    User->>UI: 1. Capture Menu<br/>(text/image/camera)
    UI->>UI: 2. Get Allergy Profile
    UI->>API: 3. POST /api/analyze-menu<br/>{allergies, menu, settings}
    
    API->>API: 4. Validate & Sanitize
    API->>AI: 5. Generate Content<br/>(context-aware prompt)
    
    AI-->>API: 6. Return Analysis<br/>{ingredients, allergens, risk}
    
    API->>API: 7. Apply Confidence<br/>Calibration
    
    alt Cloud User
        API->>DB: 8. Save to /users/{uid}/scans
    else Guest User
        API->>UI: 8. Cache in localStorage
    end
    
    API-->>UI: 9. Return Results
    
    UI->>UI: 10. Render Badges<br/>+ Generate Chef Card
    UI-->>User: 11. Display Analysis
```

### Data Persistence Flow

```mermaid
graph LR
    A[App Launch] --> B{Authenticated?}
    
    B -->|No| C[Guest Mode]
    B -->|Yes| D[Cloud Mode]
    
    C --> E[localStorage]
    D --> F[Firestore]
    
    E --> G{User Logs In?}
    G -->|Yes| H[Sync to Firestore]
    G -->|No| I[Continue Offline]
    
    F --> J[Real-time Sync]
    J --> K[Multi-Device Update]
    
    H --> K
    
    style C fill:#fff4e1
    style D fill:#e1f5ff
    style E fill:#ffe0b2
    style F fill:#bbdefb
```

### User Journey Flow

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing --> GuestMode: Continue as Guest
    Landing --> SignIn: Sign In with Google
    
    GuestMode --> ScanMenu: Capture Menu
    SignIn --> ScanMenu
    
    ScanMenu --> Analyzing: Processing...
    Analyzing --> Results: Analysis Complete
    
    Results --> ViewDetails: View Dish Details
    Results --> GenerateCard: Create Chef Card
    Results --> SaveHistory: Save to History
    
    ViewDetails --> Results
    GenerateCard --> PrintCard: Print Warning Card
    PrintCard --> Results
    
    SaveHistory --> [*]
    
    note right of Analyzing
        AI checks:
        - Hidden ingredients
        - Cross-contamination
        - Confidence scoring
    end note
    
    note left of GenerateCard
        High-contrast
        Print-optimized
        Auto questions
    end note
```

---

## 🚀 Quick Start

### ✅ Prerequisites

- Node.js v22+ 
- Google Gemini API Key ([Get one here](https://aistudio.google.com/))
- Firebase Project ([Console](https://console.firebase.google.com/))

### 📥 1. Clone & Install

```bash
git clone https://github.com/mohd-ali10/allergy-safe-menu-scanner.git
cd allergy-safe-menu-scanner
npm install
```

### ⚙️ 2. Configure Environment

Create `.env.local` in project root:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 🔥 3. Firebase Config

Create `firebase-applet-config.json` in root:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID"
}
```

### ▶️ 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to begin.

---

## 🌐 API Reference

### POST `/api/analyze-menu`

Analyze menu content against user allergy profile.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allergies` | string[] | ✅ | Allergens to check: `["dairy", "gluten", "peanuts", ...]` |
| `menuText` | string | ⚠️ | Plain text menu (required if no image) |
| `image` | string | ⚠️ | Base64 image (required if no menuText) |
| `strictness` | string | ❌ | `"flexible"`, `"standard"`, `"extreme"` (default: standard) |
| `outputLanguage` | string | ❌ | Language for results (default: English) |
| `modelSelected` | string | ❌ | `"gemini-2.5-flash"` or `"gemini-2.5-pro"` |

#### Example Request

```json
{
  "allergies": ["dairy", "gluten"],
  "menuText": "Creamy Mushroom Risotto with parmesan",
  "strictness": "extreme",
  "outputLanguage": "English"
}
```

#### Example Response

```json
[
  {
    "dish": "Creamy Mushroom Risotto",
    "ingredients": ["Arborio Rice", "Mushrooms", "Parmesan", "Butter", "Cream"],
    "allergens": ["dairy", "gluten"],
    "risk": "HIGH_RISK",
    "explanation": "Contains dairy from parmesan, butter, and cream. Risotto may use gluten-containing stock.",
    "confidence": 96,
    "chefQuestions": [
      "Is the stock gluten-free?",
      "Can this be prepared without butter or cream?"
    ]
  }
]
```

#### Error Responses

| Code | Meaning |
|------|---------|
| `400` | Missing required fields |
| `401` | Invalid API key or auth token |
| `413` | Image too large (>10MB) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## ⚙️ Firebase Setup

### 1. Enable Google Sign-In

Firebase Console → Authentication → Sign-in method → Enable **Google**

### 2. Apply Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /scans/{scanId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 3. Firestore Data Structure

```
/users/{userId}
  ├── /profile
  │   ├── allergies: string[]
  │   ├── dietaryPreference: string
  │   └── strictness: string
  └── /scans/{scanId}
      ├── dish: string
      ├── risk: string
      ├── timestamp: timestamp
      └── ingredients: string[]
```

---

## 📦 Deployment

### 🚀 Cloud Platforms (Render / Railway / Heroku)

1. Connect GitHub repo
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add env var: `GEMINI_API_KEY`

### 🐳 Docker

```bash
# Build
docker build -t allergy-safe-scanner .

# Run
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" allergy-safe-scanner
```

### Deployment Architecture

```mermaid
graph TB
    subgraph Local["🖥️ Development"]
        A[Local Dev Server]
        B[Hot Reload]
    end
    
    subgraph Docker["🐳 Docker Production"]
        C[Multi-stage Build]
        D[Alpine Node Runtime]
        E[Optimized Image ~150MB]
    end
    
    subgraph Cloud["☁️ Cloud Platform"]
        F[Render/Railway]
        G[Auto SSL]
        H[Auto Scaling]
    end
    
    A --> B
    C --> D --> E
    E --> F --> G --> H
    
    style Local fill:#e3f2fd
    style Docker fill:#fff3e0
    style Cloud fill:#e8f5e9
```

---

## ⚠️ Medical Disclaimer

> **AllergySafe Guardian is an AI assistant, not a medical device.**

- ❗ AI can make mistakes — always verify with restaurant staff
- ✅ Cross-check results before consuming any food
- 🔄 Re-scan if menu items or preparation methods change
- 🆘 Always carry emergency medication (e.g., epinephrine)
- 🌐 Use translation features to communicate clearly with kitchen teams

**This application does not replace professional medical advice.**

---

## 📄 License

MIT License — See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <strong>🛡️ Built for safer dining experiences worldwide</strong><br/>
  <sub>Made with ❤️ by the AllergySafe Guardian Team</sub>
</p>

<p align="center">
  <a href="#-allergysafe-guardian">⬆️ Back to Top</a>
</p>