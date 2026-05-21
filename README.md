🛡️ AllergySafe Guardian

Real-Time AI Menu Analyzer & Severe Food Allergy Dining Companion

Key Innovations • System Architecture • Data Flow Lifecycle • Run Locally • API Contract • Firebase Console Setup • Docker & Cloud Deployment

🌟 Key Innovations

📸 Tri-Input Scanner with Live WebRTC Processing

Diners can ingest restaurant menus using three distinct approaches, designed for varying network conditions and environmental constraints:

Interactive Text Clipboard: Direct raw copy/paste for digital menus.

File System Asset Upload: High-resolution file capture supporting JPEG, PNG, and WebP.

Hardware WebRTC Integration: Stream-to-canvas snapshot capture utilizing native device camera permissions without blocking global state or interface animations.

🧠 GenAI Allergen Reasoning Engine

The heart of AllergySafe Guardian is a custom model pipeline orchestrated through Google's @google/genai SDK, targeting Gemini 2.5 Flash and Gemini 2.5 Pro:

Inferred Ingredient Detection: Looks beyond simple text matching to infer hidden ingredients. For example, it automatically flags Pesto for tree nuts/dairy, Béchamel for dairy/gluten, Soy Sauce for wheat/gluten, and Aioli for egg.

Vigilance Thresholding: Dynamically swaps prompt context instructions depending on the user's safety tolerance:

Extreme Vigilance: If there is any reasonable doubt, lack of manufacturing clarity, hidden base, or risk of shared frying equipment, the dish is flagged as POSSIBLE_RISK or HIGH_RISK.

Standard: Balanced evaluation of probable direct ingredients and common cross-contamination parameters.

Flexible: Flags dishes only when there is a high statistical probability of allergen presence.

Confidence Calibration: Post-processes Gemini's evaluations. If a dish is returned with a safety classification of SAFE but carries a model confidence score of $\text{confidence} < 70\%$, the backend automatically overrides the result to POSSIBLE_RISK and appends a notice highlighting the low confidence margin.

Native Translation Engine: When traveling internationally, the system enforces a strict translation mandate, translating dish names, ingredients, risk flags, and explanations into target scripts (e.g., Spanish, Japanese) to enable fluent communication with overseas kitchen staff.

🧑‍🍳 Printable Chef Warning Card

Generates a targeted, high-contrast, severe allergy safety card. Includes:

Big bold warnings emphasizing the life-threatening nature of the allergies.

Highlighted target ingredient lists dynamically rendered from active user profiles.

Auto-generated "Ask the Chef" specific queries for each analyzed dish.

Optimized @media print CSS rules that automatically hide sidebars, navigations, footers, and dashboard panels, isolating only the physical paper card layout for a perfect receipt-sized printout.

☁️ Hybrid Persistence Architecture

Provides frictionless access across different user authentication scopes:

Guest Mode: Tracks, caches, and saves active profile allergy criteria, settings, and historical scans to hardware localStorage.

Cloud Account: Logs in with a single click using Firebase Google OAuth. Upon login, local allergy metrics sync up with Google Cloud Firestore. From that point on, real-time snapshot listeners maintain synchronization across all active devices.

🏗️ System Architecture

AllergySafe Guardian is built as a modular hybrid monolith, optimizing performance by rendering an SPA on the client-side while protecting API secrets and serving heavy data processing pipelines from a secure Node/Express backend.

allergy-safe-menu-scanner/
├── src/
│   ├── components/
│   │   ├── layout/            # Persistent UI Shell Components
│   │   │   ├── Header.tsx             # Responsive header, auth gates & light/dark modes
│   │   │   └── BottomNavigation.tsx   # Floating navigation bar with Framer Motion layouts
│   │   └── screens/           # Modular Sub-Screen Presentational Panels
│   │       ├── ProfileScreen.tsx      # Core allergies configuration & dietary preferences
│   │       ├── ScanScreen.tsx         # Dashboard displaying inputs, camera stream & analysis
│   │       ├── HistoryScreen.tsx      # Interactive search, review, & deletion of previous scans
│   │       ├── SettingsScreen.tsx     # Custom settings, export limits & clean resets
│   │       └── ChefCardScreen.tsx     # Printable card preview layout
│   ├── hooks/                 # Custom React Hooks isolating side-effects & state rules
│   │   ├── useAuth.ts                 # Firebase Authentication session listener
│   │   ├── useAllergies.ts            # LocalStorage/Firestore atomic sync for profiles
│   │   ├── useCamera.ts               # WebRTC media track and stream buffer capture controls
│   │   └── useScanHistory.ts          # History sync, delete operations & offline cache
│   ├── lib/                   # Utility configuration files
│   │   └── utils.ts                   # Tailwind Merge / Clsx visual utilities
│   ├── types.ts               # Strict TS definitions and static allergen presets
│   ├── utils.tsx              # Prompt utilities & dynamic "Ask the Chef" algorithms
│   ├── firebase.ts            # Client-side Firebase SDK configuration
│   ├── main.tsx               # Frontend startup mount point
│   └── App.tsx                # Master state router and context controller
├── server.ts                  # Hybrid Node.js/Express.js backend and Gemini Pipeline router
├── firestore.rules            # Security-hardened Firebase security rules
├── Dockerfile                 # Multi-stage optimized production container build script
├── package.json               # Package manifests, task dependencies & scripts
└── tsconfig.json              # TypeScript engine configurations


🔄 Data Flow Lifecycle

The diagram below details the end-to-end lifecycle of a menu safety analysis scan:

[ Diner Interface (React) ]
         │
         ├── 1. Captures Menu Source (Text/Base64 Image)
         ├── 2. Grabs Active Allergy/Diet Profile
         └── 3. Packages Settings (Strictness, Language, Model Choice)
         │
         ▼
[ POST /api/analyze-menu ]  ──► (Backend Express Server)
         │
         ├── 4. Sanitizes input & verifies system variables
         ├── 5. Compiles Dynamic Context-Aware Prompt (Appends Diet, Strictness & Language)
         │
         ▼
[ Google Gemini GenAI API ] ──► (Generates Structured JSON Array)
         │
         ├── 6. Infers hidden ingredients (e.g., Pesto -> Dairy/Pine nuts)
         └── 7. Formulates safety scores & "Ask the Chef" guidelines
         │
         ▼
[ Safety Calibration Step ] ──► (Backend Post-Processing)
         │
         └── 8. Overrides "SAFE" with < 70% confidence to "POSSIBLE_RISK"
         │
         ▼
[ Sync & Persistence Layer ]
         │
         ├── Cloud User: Writes record to Firestore collection (/users/{uid}/scans)
         └── Guest User: Cache pushes to Client LocalStorage
         │
         ▼
[ Render Results UI ] ──► Dynamically colors badges, displays warnings, generates Chef Card


🚀 Run Locally

Prerequisites

Node.js (v22+ recommended)

Google Gemini API Key (Obtained from Google AI Studio)

Firebase Project Console Account

Step 1: Clone the Codebase

git clone [https://github.com/mohd-ali10/allergy-safe-menu-scanner.git](https://github.com/mohd-ali10/allergy-safe-menu-scanner.git)
cd allergy-safe-menu-scanner


Step 2: Install System Dependencies

Install both backend compilation dependencies and frontend package modules in one go:

npm install


Step 3: Configure Environment Variables

Create a .env.local file inside the root project directory:

# Backend Port and Gemini SDK Credentials
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here


Step 4: Setup client-side Firebase Configuration

Create a file named firebase-applet-config.json inside the root directory (allergy-safe-menu-scanner/). Place your active Firebase Web SDK config parameters inside it:

{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "firestoreDatabaseId": "YOUR_DATABASE_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_SENDER_ID"
}


(An empty template is available in firebase-applet-config.example.json for reference).

Step 5: Start Local Development

Run the combined TSX Node and Vite compiler pipeline:

npm run dev


Navigate to http://localhost:3000 inside your web browser.

🌐 Backend API Contract

All menu processing queries flow securely through the Express API layer to prevent exposing your GEMINI_API_KEY to the client.

POST /api/analyze-menu

Processes raw menu text or base64 visual assets against active allergy safety constraints.

Headers: Content-Type: application/json

JSON Request Body Parameters:

Parameter

Type

Required

Description

allergies

Array<string>

Yes

Active allergens list (e.g., ["dairy", "gluten", "peanuts"]).

menuText

string

Conditional

Plain text representing dishes and menus. (Required if image is null).

image

string

Conditional

Base64-encoded image string. (Required if menuText is null).

dietaryPreference

string

No

Dietary restriction filter: vegan, vegetarian, pescatarian, or none.

strictness

string

No

Strictness behavior modifier: flexible, standard, or extreme.

outputLanguage

string

No

Language name for the output (e.g., Spanish, Japanese, English).

modelSelected

string

No

AI Model Choice: gemini-2.5-flash or gemini-2.5-pro.

Example Payload

{
  "allergies": ["dairy", "gluten", "peanuts"],
  "menuText": "Classic Pesto Penne: Fresh basil pasta tossed in creamy pine nut olive oil emulsion and aged parmesan.",
  "image": null,
  "dietaryPreference": "none",
  "strictness": "extreme",
  "outputLanguage": "English",
  "modelSelected": "gemini-2.5-flash"
}


Example Response (Success: HTTP Code 200)

[
  {
    "dish": "Classic Pesto Penne",
    "ingredients": ["Penne Pasta", "Basil", "Pine Nuts", "Olive Oil", "Cream", "Parmesan Cheese"],
    "allergens": ["dairy", "gluten", "tree nuts"],
    "risk": "HIGH_RISK",
    "explanation": "Dish contains explicit gluten from penne pasta, dairy from cream and parmesan, and pine nuts which pose a severe risk to tree nut allergies.",
    "confidence": 98
  }
]


⚙️ Firebase Console & Security Setup

Follow these steps to configure your database and authentication settings:

1. Enable Google Sign-In Provider

Go to the Firebase Console and select your project.

Navigate to Authentication > Sign-in Method.

Select Google from the list of provider options, toggle "Enable", and click "Save".

2. Configure Cloud Firestore Rules

Ensure that users can only view or delete their own saved scan history by updating your security rules in the console or applying the local firestore.rules configuration file:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lock user profile collections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Protect associated scan indices
      match /scans/{scanId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}


📦 Production Deployment & Containerization

Standard Deployment (No Docker)

This codebase is ready for zero-config deployments on cloud platforms like Render, Railway, or Heroku:

Connect your active GitHub repository to the hosting platform.

Select Node/TypeScript as the runtime environment.

Configure the following execution commands:

Build Command: npm install && npm run build

Start Command: npm start (This launches TSX in production mode, serving pre-compiled React static assets).

Add your Environment Variables: Set GEMINI_API_KEY inside the platform's Environment Variables panel.

Dockerized Container Deployment

A highly optimized, multi-stage production Dockerfile is provided in the root directory. This separates compile-time environments from production runtimes to keep the image slim, fast, and secure.

# ==========================================
# STAGE 1: Build Frontend Assets & Packages
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# ==========================================
# STAGE 2: Lightweight Production Runner
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only production dependencies and compiled assets
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/firebase-applet-config.json ./

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]


Run with Docker locally:

# 1. Build the lightweight production container
docker build -t allergy-safe-scanner .

# 2. Start the container on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" allergy-safe-scanner


⚠️ Medical Disclaimer

AllergySafe Guardian is an AI-powered assistant designed to facilitate menu parsing and ingredient extraction. Artificial intelligence models can make mistakes, and restaurant kitchen recipes or cross-contamination protocols change rapidly. Users must always cross-examine and directly confirm any risk evaluations with the waitstaff and executive kitchen chef before consuming any meals.