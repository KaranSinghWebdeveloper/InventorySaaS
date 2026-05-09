const bcrypt = require("bcrypt");
const { PrismaClient, UserRole, PurchaseStatus, SaleStatus, InventoryTransactionType, InventoryReferenceType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.$transaction([
    prisma.inventoryTransaction.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.purchaseItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.businessModule.deleteMany(),
    prisma.business.deleteMany(),
    prisma.module.deleteMany()
  ]);

  // Create modules
  const modules = await Promise.all([
    prisma.module.create({ data: { name: "products", description: "Product management" } }),
    prisma.module.create({ data: { name: "categories", description: "Category management" } }),
    prisma.module.create({ data: { name: "inventory", description: "Inventory tracking" } }),
    prisma.module.create({ data: { name: "customers", description: "Customer management" } }),
    prisma.module.create({ data: { name: "suppliers", description: "Supplier management" } }),
    prisma.module.create({ data: { name: "sales", description: "Sales management" } }),
    prisma.module.create({ data: { name: "purchases", description: "Purchase management" } }),
    prisma.module.create({ data: { name: "users", description: "User management" } })
  ]);

  const business = await prisma.business.create({
    data: {
      name: "Demo Inventory Pvt Ltd",
      email: "demo@inventory.local",
      phone: "+91-9999999999",
      address: "Bengaluru, India"
    }
  });

  // Enable all modules for the business
  await prisma.businessModule.createMany({
    data: modules.map(module => ({
      businessId: business.id,
      moduleId: module.id,
      enabled: true
    }))
  });

  const adminUser = await prisma.user.create({
    data: {
      businessId: business.id,
      name: "System Admin",
      email: "admin@inventory.local",
      password: passwordHash,
      role: UserRole.ADMIN
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      businessId: business.id,
      name: "Store Staff",
      email: "staff@inventory.local",
      password: passwordHash,
      role: UserRole.STAFF
    }
  });

  const electronics = await prisma.category.create({
    data: {
      businessId: business.id,
      name: "Electronics",
      description: "Electronic products",
      status: 1
    }
  });

  const accessories = await prisma.category.create({
    data: {
      businessId: business.id,
      name: "Accessories",
      parentId: electronics.id,
      description: "Device accessories",
      status: 1
    }
  });

  const groceries = await prisma.category.create({
    data: {
      businessId: business.id,
      name: "Groceries",
      description: "Daily essentials",
      status: 1
    }
  });

  const supplierA = await prisma.supplier.create({
    data: {
      businessId: business.id,
      name: "Tech Wholesale Hub",
      email: "sales@techhub.local",
      phone: "+91-8888888888",
      address: "Mumbai, India"
    }
  });

  const supplierB = await prisma.supplier.create({
    data: {
      businessId: business.id,
      name: "Fresh Supply Co",
      email: "hello@freshsupply.local",
      phone: "+91-7777777777",
      address: "Hyderabad, India"
    }
  });

  const customerA = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91-9000000001",
      address: "Delhi, India"
    }
  });

  const customerB = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Priya Nair",
      email: "priya@example.com",
      phone: "+91-9000000002",
      address: "Kochi, India"
    }
  });

  const wirelessMouse = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: accessories.id,
      name: "Wireless Mouse",
      sku: "ACC-WM-001",
      barcode: "890000000001",
      price: 899.0,
      costPrice: 550.0,
      quantity: 45,
      lowStockAlert: 10,
      unit: "pcs",
      status: 1
    }
  });

  const keyboard = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: accessories.id,
      name: "Mechanical Keyboard",
      sku: "ACC-KB-001",
      barcode: "890000000002",
      price: 2499.0,
      costPrice: 1800.0,
      quantity: 20,
      lowStockAlert: 5,
      unit: "pcs",
      status: 1
    }
  });

  const riceBag = await prisma.product.create({
    data: {
      businessId: business.id,
      categoryId: groceries.id,
      name: "Rice Bag 5kg",
      sku: "GRC-RC-001",
      barcode: "890000000003",
      price: 420.0,
      costPrice: 350.0,
      quantity: 60,
      lowStockAlert: 15,
      unit: "bag",
      status: 1
    }
  });

  const purchase = await prisma.purchase.create({
    data: {
      businessId: business.id,
      supplierId: supplierA.id,
      purchaseNumber: "PO-1001",
      invoiceNumber: "PUR-1001",
      supplierReference: "SUP-REF-PO-1001",
      totalAmount: 28950.0,
      notes: "Initial stock purchase",
      terms: "Net 15",
      status: PurchaseStatus.RECEIVED,
      purchaseDate: new Date("2026-04-20"),
      expectedDeliveryDate: new Date("2026-04-24"),
      receivedAt: new Date("2026-04-24"),
      items: {
        create: [
          {
            productId: wirelessMouse.id,
            quantity: 30,
            price: 550.0,
            total: 16500.0
          },
          {
            productId: keyboard.id,
            quantity: 5,
            price: 1800.0,
            total: 9000.0
          },
          {
            productId: riceBag.id,
            quantity: 10,
            price: 345.0,
            total: 3450.0
          }
        ]
      }
    },
    include: { items: true }
  });

  await prisma.inventoryTransaction.createMany({
    data: purchase.items.map((item) => ({
      businessId: business.id,
      productId: item.productId,
      type: InventoryTransactionType.IN,
      referenceType: InventoryReferenceType.PURCHASE,
      referenceId: purchase.id,
      quantity: item.quantity
    }))
  });

  const sale = await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: customerA.id,
      invoiceNumber: "SAL-1001",
      totalAmount: 5096.0,
      paidAmount: 4000.0,
      dueAmount: 1096.0,
      status: SaleStatus.PARTIAL,
      saleDate: new Date("2026-04-22"),
      items: {
        create: [
          {
            productId: wirelessMouse.id,
            quantity: 2,
            price: 899.0,
            total: 1798.0
          },
          {
            productId: keyboard.id,
            quantity: 1,
            price: 2499.0,
            total: 2499.0
          },
          {
            productId: riceBag.id,
            quantity: 2,
            price: 399.5,
            total: 799.0
          }
        ]
      }
    },
    include: { items: true }
  });

  await prisma.inventoryTransaction.createMany({
    data: sale.items.map((item) => ({
      businessId: business.id,
      productId: item.productId,
      type: InventoryTransactionType.OUT,
      referenceType: InventoryReferenceType.SALE,
      referenceId: sale.id,
      quantity: item.quantity
    }))
  });

  await prisma.payment.createMany({
    data: [
      {
        businessId: business.id,
        type: "PURCHASE",
        referenceId: purchase.id,
        amount: 28950.0,
        method: "UPI",
        paymentDate: new Date("2026-04-20")
      },
      {
        businessId: business.id,
        type: "SALE",
        referenceId: sale.id,
        amount: 4000.0,
        method: "CASH",
        paymentDate: new Date("2026-04-22")
      }
    ]
  });

  await prisma.setting.createMany({
    data: [
      {
        businessId: business.id,
        key: "currency",
        value: "INR"
      },
      {
        businessId: business.id,
        key: "timezone",
        value: "Asia/Kolkata"
      }
    ]
  });

  console.log("Seed completed successfully.");
  console.log("Business:", business.name);
  console.log("Admin login:", adminUser.email, "/ Admin@123");
  console.log("Staff login:", staffUser.email, "/ Admin@123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
