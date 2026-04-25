import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { PurchaseRepository } from "../repositories/purchase.repository";
import { purchaseResource } from "../resources/purchase.resource";
import { CreatePurchaseInput } from "../requests/purchase.request";

export class PurchaseService {
  constructor(private readonly purchaseRepository = new PurchaseRepository()) {}

  async create(businessId: number, input: CreatePurchaseInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return purchaseResource(await this.purchaseRepository.create(businessId, input, totalAmount));
  }

  async list(businessId: number, query: { page?: number; limit?: number }) {
    const pagination = getPagination(query);
    const { items, total } = await this.purchaseRepository.findMany(businessId, pagination.skip, pagination.take);
    return { items: items.map(purchaseResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }
}
