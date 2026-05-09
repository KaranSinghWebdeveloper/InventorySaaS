import { SaleStatus } from "@prisma/client";
import { BadRequestError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { SaleRepository } from "../repositories/sale.repository";
import { saleResource } from "../resources/sale.resource";
import { CreateSaleInput } from "../requests/sale.request";

export class SaleService {
  constructor(private readonly saleRepository = new SaleRepository()) {}

  async create(businessId: number, input: CreateSaleInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const paidAmount = input.paidAmount;
    const dueAmount = totalAmount - paidAmount;
    const status =
      dueAmount <= 0 ? SaleStatus.PAID : paidAmount > 0 ? SaleStatus.PARTIAL : SaleStatus.UNPAID;

    try {
      return saleResource(
        await this.saleRepository.create(businessId, input, {
          totalAmount,
          paidAmount,
          dueAmount,
          status
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
        throw new BadRequestError("Insufficient stock for one or more sale items");
      }
      throw error;
    }
  }

  async list(businessId: number, query: { page?: number; limit?: number; search?: string }) {
    const pagination = getPagination(query);
    const search = query.search?.trim();
    const { items, total } = await this.saleRepository.findMany(
      businessId,
      pagination.skip,
      pagination.take,
      search
    );
    return { items: items.map(saleResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }
}
