# PAARA — Complete Setup & Run Guide

## What You Need Before Starting

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| MongoDB | 6+ (local) OR Atlas | `mongod --version` |
| Git (optional) | Any | `git --version` |

---

## STEP 1 — Extract the Project

```bash
# Unzip the downloaded file
unzip paara-complete.zip

# You'll get this structure:
# paara/
# ├── server/    ← Node.js backend
# └── client/    ← React frontend
```

---

## STEP 2 — Set Up MongoDB

### Option A: MongoDB installed locally (recommended for development)

**On Windows:**
```
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB service (it starts automatically after install)
4. Verify: mongod --version
```

**On macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

**On Ubuntu/Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### Option B: MongoDB Atlas (free cloud database — no install needed)
```
1. Go to: https://cloud.mongodb.com
2. Create a free account
3. Create a free M0 cluster
4. Click "Connect" → "Drivers"
5. Copy your connection string:
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/paara
6. Use this string in Step 4 below
```

---

## STEP 3 — Set Up Cloudinary (for image uploads)

```
1. Go to: https://cloudinary.com  (free account, no credit card needed)
2. Sign up / Log in
3. On your Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
4. You'll paste these in Step 4 below
```

> **Note:** If you skip Cloudinary, the app still works — 
> products just won't have image uploads. Everything else functions normally.

---

## STEP 4 — Configure Backend Environment

Open the file `paara/server/.env` in any text editor and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paara

# If using Atlas, replace the above with:
# MONGO_URI=mongodb+srv://yourUser:yourPass@cluster.xxxxx.mongodb.net/paara

JWT_SECRET=paara_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Cloudinary — paste your credentials here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

> **Important:** Change `JWT_SECRET` to a long random string before going live.

---

## STEP 5 — Install Server Dependencies

```bash
# Navigate to the server folder
cd paara/server

# Install all packages (takes 1-2 minutes)
npm install
```

Expected output at the end:
```
added 312 packages in 45s
```

---

## STEP 6 — Install Client Dependencies

Open a **new terminal** (keep the server terminal open):

```bash
# Navigate to the client folder
cd paara/client

# Install all packages (takes 2-3 minutes)
npm install
```

Expected output at the end:
```
added 890 packages in 2m
```

---

## STEP 7 — Seed the Database

Go back to your **server terminal**:

```bash
cd paara/server

# Create the admin account
node scripts/seedAdmin.js
```

Expected output:
```
✅ Admin created: admin@paara.pk / Admin@2026!
```

```bash
# Seed Pakistani cities (12 cities)
node scripts/seedCities.js
```

Expected output:
```
Connected to MongoDB
✅ Seeded: Lahore
✅ Seeded: Multan
✅ Seeded: Hunza
... (12 cities)
Seeded 12 cities successfully
```

---

## STEP 8 — Start the Backend Server

In your **server terminal**:

```bash
cd paara/server
npm run dev
```

Expected output:
```
[nodemon] starting `node server.js`
✅ MongoDB Connected: localhost
Server running on port 5000
```

> The backend API is now live at: **http://localhost:5000**

---

## STEP 9 — Start the Frontend

In your **client terminal**:

```bash
cd paara/client
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 800ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> The app is now live at: **http://localhost:5173**

---

## STEP 10 — Verify Everything Works

Open your browser and go to **http://localhost:5173**

### Quick verification checklist:

**1. Homepage loads correctly**
```
✓ Pakistan flag animation on hero
✓ City/region grid (Lahore, Multan, Hunza etc.)
✓ Navigation bar with PAARA logo
```

**2. Test the API directly**
```
Open browser → http://localhost:5000
Should show: {"message":"PAARA API is running","version":"v1"}
```

**3. Test registration**
```
Go to: http://localhost:5173/register
Create a buyer account with your email
You should be redirected to the homepage after success
```

**4. Test admin login**
```
Go to: http://localhost:5173/login
Email:    admin@paara.pk
Password: Admin@2026!
You should be redirected to the admin panel
```

**5. Test the products page**
```
Go to: http://localhost:5173/products
(Will show mock data until real products are added by a seller)
```

---

## Running Both Servers — Summary

Every time you want to run PAARA, you need **two terminals running simultaneously**:

### Terminal 1 — Backend
```bash
cd paara/server
npm run dev
```

### Terminal 2 — Frontend
```bash
cd paara/client
npm run dev
```

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@paara.pk | Admin@2026! |
| Seller | Register at /register (choose "I'm Crafting") | Your choice |
| Buyer | Register at /register (choose "I'm Discovering") | Your choice |

---

## Workflow to Add a Seller and Products

```
1. Register as a Seller at /register (choose "I'm Crafting")
2. Log in with your seller account
3. Go to /seller → Products → "Add product"
4. Fill in product details (name, price, city, category, description)
5. Save — product is in "pending" status

6. Log in as Admin: admin@paara.pk / Admin@2026!
7. Go to /admin → Products
8. Find your product → click ✅ Approve

9. Log out from admin
10. Go to /products — your product now appears!
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
sudo systemctl status mongod       # Linux
brew services list | grep mongodb  # macOS

# Restart MongoDB
sudo systemctl restart mongod      # Linux
brew services restart mongodb-community  # macOS
```

### "Port 5000 already in use"
```bash
# Kill the process on port 5000
lsof -ti:5000 | xargs kill -9    # macOS/Linux

# Or change the port in server/.env:
PORT=5001
```

### "Port 5173 already in use"
```bash
# Vite will auto-pick 5174, 5175 etc. — check terminal output for actual URL
# Or kill the process:
lsof -ti:5173 | xargs kill -9
```

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
npm install

# If Node version issues:
node --version   # Must be 18+
# Install nvm to manage Node versions:
# https://github.com/nvm-sh/nvm
nvm install 18
nvm use 18
```

### "Cannot POST /api/v1/auth/login" — CORS error in browser
```
Make sure both servers are running:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

Check server/.env has:
ALLOWED_ORIGINS=http://localhost:5173
```

### Products page shows no products
```
This is normal on a fresh install — the database is empty.
Add products as a seller or run:

node scripts/seedCities.js   (seeds city data)

To add sample products, use the seller dashboard after approving a seller.
```

### Cloudinary upload not working
```
Double-check your server/.env:
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name  (not "your_cloud_name_here")
CLOUDINARY_API_KEY=your_actual_key
CLOUDINARY_API_SECRET=your_actual_secret

Then restart the backend: Ctrl+C then npm run dev
```

---

## Production Build (when deploying)

```bash
# Build frontend
cd paara/client
npm run build
# Output goes to paara/client/dist/

# Run backend in production mode
cd paara/server
NODE_ENV=production npm start
```

---

## Full Command Reference

```bash
# Backend
cd paara/server
npm install                    # Install dependencies
node scripts/seedAdmin.js      # Create admin user
node scripts/seedCities.js     # Seed 12 Pakistani cities
npm run dev                    # Start development server (hot reload)
npm start                      # Start production server

# Frontend
cd paara/client
npm install                    # Install dependencies
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build locally
```
