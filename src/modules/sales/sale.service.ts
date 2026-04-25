import { BadRequestError } from "../../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { SaleRepository } from "./sale.repository";
import { saleResource } from "./sale.resource";
import { CreateSaleInput } from "./sale.validator";

export class SaleService {
  constructor(private readonly saleRepository = new SaleRepository()) {}

  async create(businessId: string, input: CreateSaleInput) {
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    try {
      return saleResource(await this.saleRepository.create(businessId, input, total));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
        throw new BadRequestError("Insufficient stock for one or more sale items");
      }
      throw error;
    }
  }

  async list(businessId: string, query: { page?: number; limit?: number }) {
    const pagination = getPagination(query);
    const { items, total } = await this.saleRepository.findMany(businessId, pagination.skip, pagination.take);
    return { items: items.map(saleResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }
}
