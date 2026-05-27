# PAARA — Pakistan's Heritage Marketplace

Verified artisans, regional crafts, premium experience.

## Quick start (Docker)

```bash
cd paara
cp server/.env.example server/.env
docker compose up --build
```

App: http://localhost  ·  API: http://localhost:5000/api/v1

## Manual dev

```bash
# Backend
cd paara/server && npm install && npm run dev

# Frontend (new terminal)
cd paara/client && npm install && npm run dev
```

## Test accounts

| Role  | Email                       | Password    |
|-------|-----------------------------|-------------|
| Buyer | buyer2@test.local           | NewStrong123! |
| Seller| seller1@test.local          | Test1234!    |
| Demo  | demo.artisans@paara.pk      | Demo123!     |
| Admin | admin@paara.pk              | Admin@2026!  |

## Seed demo data

```bash
cd paara/server
node scripts/seedDemoProducts.js
node scripts/migrateSellerProfiles.js
```

## Stack

- Backend: Node 20 · Express · Mongoose · MongoDB
- Frontend: Vite · React · TanStack Router/Query · Tailwind · shadcn/ui · recharts
- Infra: Docker · GitHub Actions
