import { Prisma } from "@prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "../common/errors/httpErrors";
import { PosSaleWithRelationsModel } from "../models/pos-sale.model";
import {
  ComputedPosSaleItem,
  ComputedPosSaleTotals,
  PosSaleRepository
} from "../repositories/pos-sale.repository";
import {
  CreatePosSaleInput,
  PosSaleListQuery,
  UpdatePosSaleInput
} from "../requests/pos-sale.request";
import { posSaleResource } from "../resources/pos-sale.resource";
import { buildPaginationMeta, getPagination } from "../utils/pagination";

export class PosSaleService {
  constructor(private readonly posSaleRepository = new PosSaleRepository()) {}

  async create(businessId: number, createdBy: number, input: CreatePosSaleInput) {
    const items = this.computeItems(input.items);
    const computed = this.computeTotals({
      invoiceNo: input.invoiceNo ?? this.getNextInvoiceNo(),
      items,
      discountAmount: input.discountAmount,
      taxAmount: input.taxAmount
    });

    try {
      return posSaleResource(
        await this.posSaleRepository.create(businessId, createdBy, input, computed, items)
      );
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async list(businessId: number, query: PosSaleListQuery) {
    const pagination = getPagination(query);
    const { items, total } = await this.posSaleRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      query
    });

    return {
      items: items.map(posSaleResource),
      meta: buildPaginationMeta(total, pagination.page, pagination.limit)
    };
  }

  async getById(businessId: number, id: number) {
    const sale = await this.posSaleRepository.findById(businessId, id);

    if (!sale) {
      throw new NotFoundError("POS sale not found");
    }

    return posSaleResource(sale);
  }

  async update(businessId: number, id: number, input: UpdatePosSaleInput) {
    const existing = await this.posSaleRepository.findById(businessId, id);

    if (!existing) {
      throw new NotFoundError("POS sale not found");
    }

    const items = input.items ? this.computeItems(input.items) : undefined;
    const computed = this.computeTotals({
      invoiceNo: input.invoiceNo ?? existing.invoiceNo,
      items: items ?? this.itemsFromExistingSale(existing),
      discountAmount:
        input.discountAmount ?? (items ? undefined : Number(existing.discountAmount)),
      taxAmount: input.taxAmount ?? (items ? undefined : Number(existing.taxAmount))
    });

    try {
      return posSaleResource(await this.posSaleRepository.update(businessId, id, input, computed, items));
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async delete(businessId: number, id: number) {
    try {
      await this.posSaleRepository.delete(businessId, id);
      return null;
    } catch (error) {
      if (error instanceof Error && error.message === "POS_SALE_NOT_FOUND") {
        throw new NotFoundError("POS sale not found");
      }
      throw error;
    }
  }

  private computeItems(items: CreatePosSaleInput["items"]): ComputedPosSaleItem[] {
    return items.map((item) => {
      const discountAmount = item.discountAmount ?? 0;
      const taxAmount = item.taxAmount ?? 0;
      const totalAmount = item.quantity * item.unitPrice - discountAmount + taxAmount;

      if (totalAmount < 0) {
        throw new BadRequestError("POS sale item total cannot be negative");
      }

      return {
        productId: item.productId,
        batchNo: item.batchNo ?? null,
        expiryDate: item.expiryDate ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount,
        taxAmount,
        totalAmount: this.roundMoney(totalAmount)
      };
    });
  }

  private computeTotals(args: {
    invoiceNo: string;
    items: ComputedPosSaleItem[];
    discountAmount?: number;
    taxAmount?: number;
  }): ComputedPosSaleTotals {
    const subtotal = this.roundMoney(
      args.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    );
    const itemDiscountAmount = this.roundMoney(
      args.items.reduce((sum, item) => sum + item.discountAmount, 0)
    );
    const itemTaxAmount = this.roundMoney(args.items.reduce((sum, item) => sum + item.taxAmount, 0));
    const discountAmount = this.roundMoney(args.discountAmount ?? itemDiscountAmount);
    const taxAmount = this.roundMoney(args.taxAmount ?? itemTaxAmount);
    const totalAmount = this.roundMoney(subtotal - discountAmount + taxAmount);

    if (totalAmount < 0) {
      throw new BadRequestError("POS sale total cannot be negative");
    }

    return {
      invoiceNo: args.invoiceNo,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount
    };
  }

  private itemsFromExistingSale(sale: PosSaleWithRelationsModel): ComputedPosSaleItem[] {
    return sale.items.map((item) => ({
      productId: item.productId,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate?.toISOString().slice(0, 10) ?? null,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount)
    }));
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      throw new BadRequestError("Insufficient stock for one or more POS sale items");
    }

    if (error instanceof Error && error.message === "POS_SALE_NOT_FOUND") {
      throw new NotFoundError("POS sale not found");
    }

    if (this.isUniqueConstraintError(error)) {
      throw new ConflictError("POS invoice number already exists");
    }

    throw error;
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private getNextInvoiceNo() {
    return `POS-${Date.now()}`;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
