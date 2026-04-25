# API Reference

Base URL:

```text
http://localhost:4000/api/v1
```

Swagger UI:

```text
http://localhost:4000/docs
```

## Authentication

Protected routes require:

```text
Authorization: Bearer <access_token>
```

Standard API response format:

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errors": null
}
```

Error response example:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "path": "body.email",
      "message": "Invalid email"
    }
  ]
}
```

## Health

### `GET /health`

Response:

```json
{
  "success": true,
  "message": "Inventory SaaS API is healthy",
  "data": {
    "uptime": 123.45
  },
  "errors": null
}
```

## Auth

### `POST /auth/register`

Request:

```json
{
  "businessName": "Demo Store",
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "business": {
      "id": 2,
      "name": "Demo Store",
      "email": "admin@example.com",
      "phone": null,
      "address": null,
      "logo": null,
      "createdAt": "2026-04-25T08:10:00.000Z"
    },
    "user": {
      "id": 3,
      "businessId": 2,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2026-04-25T08:10:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "errors": null
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "admin@inventory.local",
  "password": "Admin@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "businessId": 1,
      "name": "System Admin",
      "email": "admin@inventory.local",
      "role": "ADMIN",
      "createdAt": "2026-04-25T08:05:02.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "errors": null
}
```

### `POST /auth/refresh-token`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "tokens": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token"
    }
  },
  "errors": null
}
```

## Users

### `GET /users/me`

Response:

```json
{
  "success": true,
  "message": "Authenticated user fetched",
  "data": {
    "id": 1,
    "businessId": 1,
    "role": "ADMIN"
  },
  "errors": null
}
```

## Products

### `GET /products?page=1&limit=20&search=mouse&categoryId=2&lowStock=false`

Response:

```json
{
  "success": true,
  "message": "Products fetched",
  "data": {
    "items": [
      {
        "id": 1,
        "businessId": 1,
        "categoryId": 2,
        "name": "Wireless Mouse",
        "sku": "ACC-WM-001",
        "barcode": "890000000001",
        "price": 899,
        "costPrice": 550,
        "quantity": 45,
        "lowStockAlert": 10,
        "unit": "pcs",
        "status": 1,
        "category": {
          "id": 2,
          "name": "Accessories"
        },
        "createdAt": "2026-04-25T08:05:02.000Z",
        "updatedAt": "2026-04-25T08:05:02.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "errors": null
}
```

### `POST /products`

Request:

```json
{
  "categoryId": 2,
  "sku": "ACC-HD-001",
  "barcode": "890000000004",
  "name": "USB Headset",
  "price": 1599,
  "costPrice": 1100,
  "lowStockAlert": 8,
  "unit": "pcs",
  "status": 1
}
```

### `GET /products/:id`

Response:

```json
{
  "success": true,
  "message": "Product fetched",
  "data": {
    "id": 1,
    "businessId": 1,
    "categoryId": 2,
    "name": "Wireless Mouse",
    "sku": "ACC-WM-001",
    "barcode": "890000000001",
    "price": 899,
    "costPrice": 550,
    "quantity": 45,
    "lowStockAlert": 10,
    "unit": "pcs",
    "status": 1,
    "category": {
      "id": 2,
      "name": "Accessories"
    },
    "createdAt": "2026-04-25T08:05:02.000Z",
    "updatedAt": "2026-04-25T08:05:02.000Z"
  },
  "errors": null
}
```

### `PATCH /products/:id`

Request:

```json
{
  "price": 1699,
  "costPrice": 1200,
  "lowStockAlert": 6
}
```

### `DELETE /products/:id`

Response:

```json
{
  "success": true,
  "message": "Product deleted",
  "data": null,
  "errors": null
}
```

## Categories

### `GET /categories?tree=true&status=1`

Response:

```json
{
  "success": true,
  "message": "Categories fetched",
  "data": [
    {
      "id": 1,
      "parentId": null,
      "name": "Electronics",
      "description": "Electronic products",
      "status": 1,
      "children": [
        {
          "id": 2,
          "parentId": 1,
          "name": "Accessories",
          "description": "Device accessories",
          "status": 1,
          "children": []
        }
      ]
    }
  ],
  "errors": null
}
```

### `POST /categories`

Request:

```json
{
  "parentId": 1,
  "name": "Chargers",
  "description": "Charging accessories",
  "status": 1
}
```

### `GET /categories/:id`

### `PATCH /categories/:id`

Request:

```json
{
  "name": "Mobile Chargers",
  "description": "Updated category",
  "status": 1
}
```

### `DELETE /categories/:id`

Response:

```json
{
  "success": true,
  "message": "Category deleted",
  "data": null,
  "errors": null
}
```

## Inventory

### `GET /inventory?page=1&limit=20&productId=1&type=IN`

Response:

```json
{
  "success": true,
  "message": "Inventory transactions fetched",
  "data": {
    "items": [
      {
        "id": 1,
        "businessId": 1,
        "productId": 1,
        "type": "IN",
        "referenceType": "PURCHASE",
        "referenceId": 1,
        "quantity": 30,
        "product": {
          "id": 1,
          "name": "Wireless Mouse",
          "sku": "ACC-WM-001",
          "quantity": 45
        },
        "createdAt": "2026-04-25T08:05:02.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "errors": null
}
```

### `POST /inventory/transactions`

Request:

```json
{
  "productId": 1,
  "type": "IN",
  "referenceType": "MANUAL",
  "referenceId": 1001,
  "quantity": 5
}
```

## Customers

### `GET /customers?page=1&limit=20&search=Aarav`

### `POST /customers`

Request:

```json
{
  "name": "Rohit Verma",
  "email": "rohit@example.com",
  "phone": "+91-9000000003",
  "address": "Pune, India"
}
```

### `GET /customers/:id`

### `PATCH /customers/:id`

Request:

```json
{
  "phone": "+91-9000000099",
  "address": "Updated Address"
}
```

### `DELETE /customers/:id`

## Suppliers

### `GET /suppliers?page=1&limit=20&search=Tech`

### `POST /suppliers`

Request:

```json
{
  "name": "Office Supplies Ltd",
  "email": "contact@office.local",
  "phone": "+91-9555555555",
  "address": "Chennai, India"
}
```

### `GET /suppliers/:id`

### `PATCH /suppliers/:id`

Request:

```json
{
  "email": "sales@office.local",
  "phone": "+91-9666666666"
}
```

### `DELETE /suppliers/:id`

## Sales

### `GET /sales?page=1&limit=20`

Response:

```json
{
  "success": true,
  "message": "Sales fetched",
  "data": {
    "items": [
      {
        "id": 1,
        "businessId": 1,
        "customerId": 1,
        "invoiceNumber": "SAL-1001",
        "totalAmount": 5096,
        "paidAmount": 4000,
        "dueAmount": 1096,
        "status": "PARTIAL",
        "saleDate": "2026-04-22T00:00:00.000Z",
        "customer": {
          "id": 1,
          "name": "Aarav Sharma"
        },
        "items": [
          {
            "id": 1,
            "productId": 1,
            "productName": "Wireless Mouse",
            "quantity": 2,
            "price": 899,
            "total": 1798
          }
        ],
        "createdAt": "2026-04-25T08:05:02.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "errors": null
}
```

### `POST /sales`

Request:

```json
{
  "customerId": 1,
  "invoiceNumber": "SAL-1002",
  "paidAmount": 1500,
  "saleDate": "2026-04-25",
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "price": 899
    },
    {
      "productId": 3,
      "quantity": 2,
      "price": 420
    }
  ]
}
```

## Purchases

### `GET /purchases?page=1&limit=20`

Response:

```json
{
  "success": true,
  "message": "Purchases fetched",
  "data": {
    "items": [
      {
        "id": 1,
        "businessId": 1,
        "supplierId": 1,
        "invoiceNumber": "PUR-1001",
        "totalAmount": 28950,
        "status": "COMPLETED",
        "purchaseDate": "2026-04-20T00:00:00.000Z",
        "supplier": {
          "id": 1,
          "name": "Tech Wholesale Hub"
        },
        "items": [
          {
            "id": 1,
            "productId": 1,
            "productName": "Wireless Mouse",
            "quantity": 30,
            "price": 550,
            "total": 16500
          }
        ],
        "createdAt": "2026-04-25T08:05:02.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "errors": null
}
```

### `POST /purchases`

Request:

```json
{
  "supplierId": 1,
  "invoiceNumber": "PUR-1002",
  "purchaseDate": "2026-04-25",
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "price": 560
    },
    {
      "productId": 2,
      "quantity": 4,
      "price": 1820
    }
  ]
}
```
