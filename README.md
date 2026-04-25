# Inventory SaaS Backend

Production-ready Node.js backend for a multi-tenant Inventory Management System using Express.js, TypeScript, Prisma, PostgreSQL, JWT authentication, Zod validation, Pino logging, and Swagger/OpenAPI.

## Structure

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── sales/
│   ├── purchases/
│   ├── customers/
│   └── suppliers/
├── common/
│   ├── middleware/
│   ├── errors/
│   ├── response/
│   └── validators/
├── config/
├── database/
├── routes/
├── utils/
├── app.ts
└── server.ts
```

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API base URL: `http://localhost:4000/api/v1`

Swagger UI: `http://localhost:4000/docs`

## Core Endpoints

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
GET    /api/v1/users/me

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id

GET    /api/v1/categories?tree=true
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id

GET    /api/v1/inventory
POST   /api/v1/inventory/transactions

GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/suppliers
POST   /api/v1/suppliers

GET    /api/v1/sales
POST   /api/v1/sales
GET    /api/v1/purchases
POST   /api/v1/purchases
```

Every protected route requires:

```text
Authorization: Bearer <access_token>
```

## Response Format

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errors": null
}
```

## Notes

- All tenant-owned tables include `business_id`.
- Product, category, customer, and supplier reads exclude soft-deleted records.
- Sales decrement stock and purchases increment stock inside database transactions.
- Inventory transactions provide an audit trail for manual stock movement, sales, and purchases.
- Admin-only deletes are enforced with role middleware.
