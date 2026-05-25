# PAARA · A Precious Piece of Pakistan
## Heritage Marketplace — Full-Stack Application

> **Frontend:** React 19 + TanStack Router + shadcn/ui + Tailwind CSS  
> **Backend:** Node.js + Express.js + MongoDB/Mongoose + JWT

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **MongoDB** (local or Atlas)
- **Cloudinary** account (free tier — for image uploads)
- **Git**

---

## Project Structure

```
paara/
├── client/    ← React frontend (Vite + TanStack Router)
└── server/    ← Node.js/Express backend (API)
```

---

## 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../client
npm install
```

---

## 2. Environment Setup

### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paara
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Cloudinary (get free credentials at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`client/.env`)

```env
VITE_API_URL=/api/v1
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## 3. Database Seeding

### Create default admin user:

```bash
cd server
node scripts/seedAdmin.js
```

This creates: **admin@paara.pk** / **Admin@2026!**

---

## 4. Run in Development

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# ✅ Server running on port 5000
# ✅ MongoDB Connected
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# ✅ Vite ready at http://localhost:5173
```

Open **http://localhost:5173**

---

## 5. Default Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@paara.pk | Admin@2026! |

Register new buyers/sellers through the `/register` page.

---

## 6. API Base URL

All API endpoints are at:
- **Development:** `http://localhost:5000/api/v1/`
- **Via Vite proxy:** `/api/v1/` (used by frontend)

Also available at `/api/` (deprecated aliases — sunset June 2026).

---

## 7. Key API Endpoints

```
POST /api/v1/auth/register   — Register buyer or seller
POST /api/v1/auth/login      — Login → returns JWT token
GET  /api/v1/products        — Browse products (filterable)
GET  /api/v1/products/:id    — Product detail
POST /api/v1/cart/checkout   — Place order
GET  /api/v1/orders/my-orders — Buyer's order history
GET  /api/v1/admin/dashboard — Admin stats (admin only)
```

---

## 8. Cloudinary Setup (for image uploads)

1. Sign up free at https://cloudinary.com
2. Copy your **Cloud Name**, **API Key**, **API Secret**
3. Paste into `server/.env`

Without Cloudinary, products can still be created — just without images.

---

## 9. Production Build

```bash
# Build frontend
cd client
npm run build
# Output in client/dist/

# Start backend in production
cd server
NODE_ENV=production npm start
```

For production, serve `client/dist/` via Nginx/CDN and set:
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
```

---

## 10. User Roles

| Role | Access |
|------|--------|
| `buyer` | Browse, cart, orders, wishlist, account |
| `seller` | All buyer access + seller dashboard (products, orders, analytics, payouts) |
| `admin` | Full access + admin panel (users, products, sellers, analytics) |

Sellers must be **approved** by admin before their products are visible.

---

## 11. Features

### Buyer
- Browse 13+ heritage craft products with filtering by region, category, price
- Product detail with origin story, artisan card, reviews, Q&A
- Cart with gift wrap options and Pakistani payment methods (JazzCash, EasyPaisa, Bank Transfer, COD)
- Checkout with real order creation
- Account dashboard: orders, addresses, wishlist, cultural journey

### Seller
- Dashboard with revenue stats and order management
- Add/edit/delete products with full heritage metadata
- Order fulfillment with courier tracking
- Analytics charts (30-day revenue)
- Payout requests

### Admin
- Platform overview (users, products, revenue)
- Product moderation queue (approve/reject/suspend)
- Seller verification management
- User management
- Platform analytics

---

## 12. Tech Stack Details

### Frontend
- React 19 with TypeScript
- TanStack Router v1 (file-based routing)
- TanStack Query v5 (server state)
- Zustand (client state: cart, auth)
- shadcn/ui + Radix UI primitives
- Tailwind CSS v3
- Sonner (toast notifications)
- Recharts (analytics charts)
- Axios (HTTP client)

### Backend
- Express.js 4.x with security middleware (Helmet, CORS, rate limiting)
- Mongoose 8.x (MongoDB ODM)
- JWT authentication (jsonwebtoken)
- bcryptjs (password hashing)
- Cloudinary + Multer (image uploads)
- Speakeasy + QRCode (2FA ready)

---

## 13. Brand

PAARA (پارہ) means "a precious piece" — the name reflects the platform's mission to bring verified Pakistani heritage crafts to the world.

**Colors:** Forest `#1C3A2A` · Saffron `#C9921A` · Parchment `#F5EDD8`  
**Fonts:** Cormorant Garamond (display) · DM Sans (body) · Noto Nastaliq Urdu (Urdu)
