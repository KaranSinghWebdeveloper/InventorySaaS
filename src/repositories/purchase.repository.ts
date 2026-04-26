import {
  InventoryReferenceType,
  InventoryTransactionType,
  Prisma,
  PrismaClient,
  PurchaseStatus
} from "@prisma/client";
import { prisma } from "../database/prisma";
import { purchaseWithRelationsArgs } from "../models/purchase.model";
import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
  UpdatePurchaseStatusInput
} from "../requests/purchase.request";

export class PurchaseRepository {
  constructor(private readonly db: PrismaClient = prisma) { }

  create(
    businessId: number,
    input: CreatePurchaseInput,
    computed: { totalAmount: number; purchaseNumber: string; status: PurchaseStatus }
  ) {
    return this.db.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          businessId,
          supplierId: input.supplierId ?? null,
          purchaseNumber: computed.purchaseNumber,
          invoiceNumber: input.invoiceNumber ?? null,
          supplierReference: input.supplierReference ?? null,
          totalAmount: computed.totalAmount,
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          status: computed.status,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
          expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null,
          sentAt: computed.status === PurchaseStatus.SENT ? new Date() : null,
          confirmedAt: computed.status === PurchaseStatus.PENDING_CONFIRM ? new Date() : null,
          receivedAt:
            computed.status === PurchaseStatus.RECEIVED || computed.status === PurchaseStatus.VERIFIED
              ? new Date()
              : null,
          verifiedAt: computed.status === PurchaseStatus.VERIFIED ? new Date() : null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price
            }))
          }
        },
        ...purchaseWithRelationsArgs
      });

      if (this.shouldApplyInventoryOnCreate(computed.status)) {
        await this.applyInventoryReceipt(tx, businessId, purchase.id, input.items);
      }

      return purchase;
    });
  }

  findById(businessId: number, id: number) {
    return this.db.purchase.findFirst({
      where: { id, businessId },
      ...purchaseWithRelationsArgs
    });
  }

  async findMany(args: {
    businessId: number;
    skip: number;
    take: number;
    status?: PurchaseStatus;
    supplierId?: number;
    search?: string;
  }) {
    // Sanitize status - remove empty strings, null, or undefined completely
    let sanitizedStatus: PurchaseStatus | undefined = undefined;

    if (args.status) {
      const statusStr = String(args.status).trim();
      if (statusStr && statusStr.length > 0) {
        sanitizedStatus = args.status;
      }
    }

    const where: Prisma.PurchaseWhereInput = {
      businessId: args.businessId,
      ...(sanitizedStatus ? { status: sanitizedStatus } : {}),
      ...(args.supplierId ? { supplierId: args.supplierId } : {}),
      ...(args.search
        ? {
          OR: [
            { purchaseNumber: { contains: args.search } },
            { invoiceNumber: { contains: args.search } },
            { supplierReference: { contains: args.search } },
            { supplier: { name: { contains: args.search } } }
          ]
        }
        : {})
    };

    const [items, total] = await this.db.$transaction([
      this.db.purchase.findMany({
        where,
        skip: args.skip,
        take: args.take,
        ...purchaseWithRelationsArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.purchase.count({ where })
    ]);
    return { items, total };
  }

  update(
    businessId: number,
    purchaseId: number,
    input: UpdatePurchaseInput,
    totalAmount?: number
  ) {
    return this.db.$transaction(async (tx) => {
      if (input.items) {
        await tx.purchaseItem.deleteMany({
          where: { purchaseId }
        });
      }

      return tx.purchase.update({
        where: { id: purchaseId, businessId },
        data: {
          supplierId: input.supplierId,
          purchaseNumber: input.purchaseNumber,
          invoiceNumber: input.invoiceNumber,
          supplierReference: input.supplierReference,
          totalAmount,
          notes: input.notes,
          terms: input.terms,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
          expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : undefined,
          items: input.items
            ? {
              create: input.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
              }))
            }
            : undefined
        },
        ...purchaseWithRelationsArgs
      });
    });
  }

  updateStatus(
    businessId: number,
    purchase: {
      id: number;
      status: PurchaseStatus;
      invoiceNumber: string | null;
      supplierReference: string | null;
      notes: string | null;
      items: Array<{ productId: number; quantity: number; price: Prisma.Decimal | null; total: Prisma.Decimal | null }>;
    },
    input: UpdatePurchaseStatusInput
  ) {
    return this.db.$transaction(async (tx) => {
      const nextStatusTimestamps = this.getStatusTimestamps(input.status);

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchase.id, businessId },
        data: {
          status: input.status,
          invoiceNumber: input.invoiceNumber ?? purchase.invoiceNumber,
          supplierReference: input.supplierReference ?? purchase.supplierReference,
          notes: input.notes ?? purchase.notes,
          ...nextStatusTimestamps
        },
        ...purchaseWithRelationsArgs
      });

      if (this.shouldApplyInventoryOnStatusChange(purchase.status, input.status)) {
        await this.applyInventoryReceipt(tx, businessId, purchase.id, purchase.items);
      }

      return updatedPurchase;
    });
  }

  private shouldApplyInventoryOnCreate(status: PurchaseStatus) {
    return status === PurchaseStatus.RECEIVED || status === PurchaseStatus.VERIFIED;
  }

  private shouldApplyInventoryOnStatusChange(currentStatus: PurchaseStatus, nextStatus: PurchaseStatus) {
    const alreadyReceived =
      currentStatus === PurchaseStatus.RECEIVED || currentStatus === PurchaseStatus.VERIFIED;
    const becomingReceived = nextStatus === PurchaseStatus.RECEIVED || nextStatus === PurchaseStatus.VERIFIED;
    return !alreadyReceived && becomingReceived;
  }

  private async applyInventoryReceipt(
    tx: Prisma.TransactionClient,
    businessId: number,
    purchaseId: number,
    items: Array<{ productId: number; quantity: number }>
  ) {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } }
      });
    }

    await tx.inventoryTransaction.createMany({
      data: items.map((item) => ({
        businessId,
        productId: item.productId,
        type: InventoryTransactionType.IN,
        referenceType: InventoryReferenceType.PURCHASE,
        referenceId: purchaseId,
        quantity: item.quantity
      }))
    });
  }

  private getStatusTimestamps(status: PurchaseStatus) {
    const now = new Date();

    return {
      sentAt: status === PurchaseStatus.SENT ? now : undefined,
      confirmedAt: status === PurchaseStatus.PENDING_CONFIRM ? now : undefined,
      receivedAt:
        status === PurchaseStatus.RECEIVED || status === PurchaseStatus.VERIFIED ? now : undefined,
      verifiedAt: status === PurchaseStatus.VERIFIED ? now : undefined
    };
  }
}
