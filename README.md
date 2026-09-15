# WorkGo 🚀
> **"Work nearby. Earn today."**

WorkGo connects people looking for temporary work with businesses/individuals who need temporary workers.

Marketplace categories include:
- Catering Staff
- Waiter / Server
- Kitchen Helper
- Event Promoter
- Event Setup
- Cleaning Staff
- Loading / Unloading
- Retail Helper
- Delivery Helper
- General Helper

---

## 🏗️ Architecture

```text
workgo/
│
├── mobile/             # React Native Expo App (Worker + Employer modes in ONE app)
│   ├── app/            # Expo Router file-based routes
│   │   ├── (auth)/     # Login, OTP, Role Selection
│   │   ├── (worker)/   # Home, Jobs, Applications, Bookings, Profile
│   │   └── (employer)/ # Home, Post Job, Jobs, Bookings, Profile
│   └── src/
│       ├── components/ # Design system (Text, Button, Card, Badge, Input)
│       ├── constants/  # Indian marketplace theme tokens (Colors, Typography)
│       ├── services/   # Axios API client with JWT interceptors
│       ├── store/      # Zustand auth and user mode stores
│       └── types/      # Shared domain types
│
├── server/             # Node.js + Express + TypeScript + Mongoose Backend
│   ├── src/
│   │   ├── config/     # Database and validated environment configuration
│   │   ├── controllers/# Health, Auth, Jobs, etc.
│   │   ├── middleware/ # JWT Auth, Role RBAC, Error Handler, Zod Validator
│   │   ├── models/     # Mongoose models (User, Job, Application, Booking, etc.)
│   │   ├── routes/     # REST API routes mounted at /api/v1
│   │   └── types/      # Server domain types
│   └── package.json
│
└── admin/              # React Admin Panel (Scaffolded for Step 16)
```

---

## ⚡ Quick Start

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
The server will boot up at `http://localhost:5000`:
- Health check: `http://localhost:5000/api/health`
- REST endpoints: `http://localhost:5000/api/v1`

### 2. Start Mobile App
```bash
cd mobile
npm install
npx expo start
```
Press `w` to run in web browser, `a` for Android emulator, or scan the QR code with Expo Go on your physical iOS/Android phone.
