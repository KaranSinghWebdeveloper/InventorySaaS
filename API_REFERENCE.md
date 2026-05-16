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

## Dashboard

### `GET /dashboard`

Returns the complete dashboard payload for the authenticated user's business. Revenue, monthly sales, category distribution, and recent activity include both regular sales and POS sales.

Response:

```json
{
  "success": true,
  "message": "Dashboard overview fetched",
  "data": {
    "stats": {
      "totalRevenue": {
        "title": "Total Revenue",
        "value": 67890,
        "format": "currency",
        "trend": { "value": 12.5, "isPositive": true }
      },
      "totalProducts": {
        "title": "Total Products",
        "value": 1234,
        "format": "number",
        "trend": { "value": 8.2, "isPositive": true }
      },
      "lowStockItems": {
        "title": "Low Stock Items",
        "value": 23,
        "format": "number",
        "trend": { "value": 3.1, "isPositive": false }
      },
      "salesThisMonth": {
        "title": "Sales This Month",
        "value": 45230,
        "format": "currency",
        "trend": { "value": 15.3, "isPositive": true }
      }
    },
    "salesPurchasesTrend": [
      { "month": "Jan", "sales": 45000, "purchases": 32000 }
    ],
    "categoryDistribution": [
      { "name": "Electronics", "value": 35000, "percent": 35, "color": "#6366f1" }
    ],
    "recentActivity": [
      {
        "id": "sale-1",
        "type": "sale",
        "title": "Sale to John Doe",
        "amount": 350,
        "quantity": null,
        "status": "paid",
        "createdAt": "2026-05-16T10:30:00.000Z"
      }
    ]
  },
  "errors": null
}
```

## POS Sales

POS sale create/update APIs compute `subtotal`, `discountAmount`, `taxAmount`, and `totalAmount` on the server. Creating a POS sale reduces product stock. Updating a POS sale reverses the old stock movement and applies the new one. Deleting a POS sale restores stock.

### `GET /pos-sales?page=1&limit=20&search=INV&paymentMethod=CASH&dateFrom=2026-05-01&dateTo=2026-05-16`

Response:

```json
{
  "success": true,
  "message": "POS sales fetched",
  "data": {
    "items": [
      {
        "id": 1,
        "businessId": 1,
        "invoiceNo": "POS-1778910000000",
        "customerName": "John Doe",
        "customerPhone": "9876543210",
        "subtotal": 1200,
        "discountAmount": 50,
        "taxAmount": 18,
        "totalAmount": 1168,
        "paymentMethod": "CASH",
        "paidAmount": 1168,
        "createdBy": 1,
        "creator": { "id": 1, "name": "Admin User" },
        "items": [
          {
            "id": 1,
            "productId": 3,
            "productName": "Wireless Headphones",
            "batchNo": "BATCH-01",
            "expiryDate": null,
            "quantity": 2,
            "unitPrice": 600,
            "discountAmount": 50,
            "taxAmount": 18,
            "totalAmount": 1168,
            "updatedAt": "2026-05-16T10:30:00.000Z"
          }
        ],
        "createdAt": "2026-05-16T10:30:00.000Z",
        "updatedAt": "2026-05-16T10:30:00.000Z"
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

Available payment methods:

```text
CASH
UPI
CARD
CREDIT
```

### `POST /pos-sales`

Request:

```json
{
  "invoiceNo": "POS-1001",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "paymentMethod": "CASH",
  "paidAmount": 1168,
  "items": [
    {
      "productId": 3,
      "batchNo": "BATCH-01",
      "expiryDate": null,
      "quantity": 2,
      "unitPrice": 600,
      "discountAmount": 50,
      "taxAmount": 18
    }
  ]
}
```

`invoiceNo` is optional. If omitted, the API generates one.

### `GET /pos-sales/:id`

### `PATCH /pos-sales/:id`

Use this to edit customer details, payment details, invoice number, or sale items. If `items` are provided, stock is recalculated transactionally.

Request:

```json
{
  "customerName": "Jane Smith",
  "paymentMethod": "UPI",
  "paidAmount": 2340,
  "items": [
    {
      "productId": 3,
      "quantity": 3,
      "unitPrice": 800,
      "discountAmount": 100,
      "taxAmount": 40
    }
  ]
}
```

### `DELETE /pos-sales/:id`

Deletes the POS sale and restores the sold stock.

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
      "profileImage": null,
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
      "profileImage": null,
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

### `GET /users/profile`

Response:

```json
{
  "success": true,
  "message": "Authenticated user fetched",
  "data": {
    "id": 1,
    "businessId": 1,
    "name": "System Admin",
    "email": "admin@inventory.local",
    "profileImage": "https://example.com/profile.jpg",
    "role": "ADMIN",
    "createdAt": "2026-04-25T08:05:02.000Z",
    "updatedAt": "2026-04-25T08:05:02.000Z"
  },
  "errors": null
}
```

### `PATCH /users/profile`

Request:

```json
{
  "name": "Updated Admin",
  "email": "updated-admin@example.com",
  "profileImage": "https://example.com/profile.jpg"
}
```

`profile_image` is also accepted as an alias for `profileImage`.

Response:

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": 1,
    "businessId": 1,
    "name": "Updated Admin",
    "email": "updated-admin@example.com",
    "profileImage": "https://example.com/profile.jpg",
    "role": "ADMIN",
    "createdAt": "2026-04-25T08:05:02.000Z",
    "updatedAt": "2026-05-10T07:30:00.000Z"
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
        "purchaseNumber": "PO-1001",
        "invoiceNumber": "PUR-1001",
        "supplierReference": "SUP-REF-PO-1001",
        "totalAmount": 28950,
        "notes": "Initial stock purchase",
        "terms": "Net 15",
        "status": "RECEIVED",
        "purchaseDate": "2026-04-20T00:00:00.000Z",
        "expectedDeliveryDate": "2026-04-24T00:00:00.000Z",
        "sentAt": null,
        "confirmedAt": null,
        "receivedAt": "2026-04-24T00:00:00.000Z",
        "verifiedAt": null,
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
  "purchaseNumber": "PO-1002",
  "invoiceNumber": "PUR-1002",
  "supplierReference": "SUP-APR-25",
  "purchaseDate": "2026-04-25",
  "expectedDeliveryDate": "2026-04-30",
  "notes": "Urgent replenishment order",
  "terms": "Net 30",
  "status": "SAVE_DRAFT",
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

Available purchase statuses:

```text
SAVE_DRAFT
SENT
PENDING_CONFIRM
RECEIVED
VERIFIED
```

### `GET /purchases/:id`

### `PATCH /purchases/:id`

Use this to edit purchase-order details before the order is received or verified.

Request:

```json
{
  "purchaseNumber": "PO-1002",
  "invoiceNumber": "PUR-1002",
  "supplierReference": "SUP-APR-25-REV1",
  "purchaseDate": "2026-04-25",
  "expectedDeliveryDate": "2026-05-02",
  "notes": "Supplier requested updated delivery date",
  "terms": "Net 30",
  "items": [
    {
      "productId": 1,
      "quantity": 12,
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

### `PATCH /purchases/:id/status`

Use this for workflow progression. Inventory is updated when status moves into `RECEIVED` for the first time.

Request:

```json
{
  "status": "SENT",
  "supplierReference": "MAIL-PO-1002",
  "notes": "Purchase order emailed to supplier"
}
```

Example receive request:

```json
{
  "status": "RECEIVED",
  "invoiceNumber": "INV-SUP-8821",
  "notes": "All ordered items received in good condition"
}
```
