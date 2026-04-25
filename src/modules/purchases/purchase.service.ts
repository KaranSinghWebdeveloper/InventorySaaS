import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { PurchaseRepository } from "./purchase.repository";
import { purchaseResource } from "./purchase.resource";
import { CreatePurchaseInput } from "./purchase.validator";

export class PurchaseService {
  constructor(private readonly purchaseRepository = new PurchaseRepository()) {}

  async create(businessId: string, input: CreatePurchaseInput) {
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    return purchaseResource(await this.purchaseRepository.create(businessId, input, total));
  }

  async list(businessId: string, query: { page?: number; limit?: number }) {
    const pagination = getPagination(query);
    const { items, total } = await this.purchaseRepository.findMany(businessId, pagination.skip, pagination.take);
    return { items: items.map(purchaseResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }
}
