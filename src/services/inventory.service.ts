import { InventoryTransactionType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { InventoryRepository } from "../repositories/inventory.repository";
import { inventoryTransactionResource } from "../resources/inventory.resource";
import { CreateInventoryTransactionInput } from "../requests/inventory.request";

export class InventoryService {
  constructor(private readonly inventoryRepository = new InventoryRepository()) {}

  async createTransaction(businessId: number, input: CreateInventoryTransactionInput) {
    const product = await this.inventoryRepository.findProduct(businessId, input.productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const quantityDelta = input.type === InventoryTransactionType.IN ? input.quantity : -input.quantity;

    if (product.quantity + quantityDelta < 0) {
      throw new BadRequestError("Insufficient stock");
    }

    const { transaction } = await this.inventoryRepository.createTransaction({
      businessId,
      productId: input.productId,
      type: input.type,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      quantity: input.quantity,
      quantityDelta
    });

    return inventoryTransactionResource(transaction);
  }

  async list(
    businessId: number,
    query: { page?: number; limit?: number; productId?: number; type?: InventoryTransactionType }
  ) {
    const pagination = getPagination(query);
    const { items, total } = await this.inventoryRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      productId: query.productId,
      type: query.type
    });

    return {
      items: items.map(inventoryTransactionResource),
      meta: buildPaginationMeta(total, pagination.page, pagination.limit)
    };
  }
}
