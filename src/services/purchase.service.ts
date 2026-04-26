import { PurchaseStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import {
  allowedPurchaseTransitions,
  getNextPurchaseNumber,
  isPurchaseLocked
} from "../utils/purchase";
import { PurchaseRepository } from "../repositories/purchase.repository";
import { purchaseResource } from "../resources/purchase.resource";
import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
  UpdatePurchaseStatusInput
} from "../requests/purchase.request";

export class PurchaseService {
  constructor(private readonly purchaseRepository = new PurchaseRepository()) { }

  async create(businessId: number, input: CreatePurchaseInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const status = input.status ?? PurchaseStatus.SAVE_DRAFT;

    return purchaseResource(
      await this.purchaseRepository.create(businessId, input, {
        totalAmount,
        purchaseNumber: input.purchaseNumber ?? getNextPurchaseNumber(),
        status
      })
    );
  }

  async list(
    businessId: number,
    query: { page?: number; limit?: number; status?: PurchaseStatus; supplierId?: number; search?: string }
  ) {
    const pagination = getPagination(query);
    // Ensure status is valid, not empty
    let validStatus: PurchaseStatus | undefined = undefined;
    if (query.status) {
      const statusStr = String(query.status).trim();
      if (statusStr && statusStr.length > 0 && Object.values(PurchaseStatus).includes(statusStr as PurchaseStatus)) {
        validStatus = query.status;
      }
    }
    
    const { items, total } = await this.purchaseRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      status: validStatus,
      supplierId: query.supplierId,
      search: query.search
    });
    return { items: items.map(purchaseResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: number, id: number) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    return purchaseResource(purchase);
  }

  async update(businessId: number, id: number, input: UpdatePurchaseInput) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    if (isPurchaseLocked(purchase.status)) {
      throw new BadRequestError("Received or verified purchases cannot be edited");
    }

    const totalAmount = input.items
      ? input.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      : purchase.totalAmount === null
        ? 0
        : Number(purchase.totalAmount);

    return purchaseResource(await this.purchaseRepository.update(businessId, id, input, totalAmount));
  }

  async updateStatus(businessId: number, id: number, input: UpdatePurchaseStatusInput) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    if (purchase.status === input.status) {
      throw new BadRequestError("Purchase is already in the requested status");
    }

    const allowedTransitions = allowedPurchaseTransitions[purchase.status];

    if (!allowedTransitions.includes(input.status)) {
      throw new BadRequestError(
        `Invalid purchase status transition from ${purchase.status} to ${input.status}`
      );
    }

    return purchaseResource(
      await this.purchaseRepository.updateStatus(businessId, purchase, input)
    );
  }

  async generatePurchasePdf(purchase: any) {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    // Collect PDF data
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    // PDF Content
    doc.fontSize(20).text("PURCHASE ORDER", { align: "center" });
    doc.moveDown(0.5);

    // Purchase details
    doc.fontSize(10).text(`Purchase #: ${purchase.purchaseNumber}`);
    doc.text(`Date: ${new Date(purchase.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${purchase.status}`);
    doc.moveDown();

    // Supplier info
    if (purchase.supplier) {
      doc.fontSize(12).text("Supplier:", { underline: true });
      doc.fontSize(10).text(purchase.supplier.name);
      if (purchase.supplier.email) doc.text(`Email: ${purchase.supplier.email}`);
      if (purchase.supplier.phone) doc.text(`Phone: ${purchase.supplier.phone}`);
      doc.moveDown();
    }

    // Items
    doc.fontSize(12).text("Items:", { underline: true });
    if (purchase.items && purchase.items.length > 0) {
      purchase.items.forEach((item: any) => {
        const itemTotal = item.quantity * item.price;
        doc.fontSize(10).text(
          `- ${item.name || "Item"} x${item.quantity} @ ${item.price} = ${itemTotal}`
        );
      });
    }
    doc.moveDown();

    // Total
    doc.fontSize(12).text(`Total: ${purchase.totalAmount || 0}`, { underline: true });

    // End document
    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);
    });
  }
}
