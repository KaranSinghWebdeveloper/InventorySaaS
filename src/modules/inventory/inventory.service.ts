import { InventoryTransactionType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { InventoryRepository } from "./inventory.repository";
import { inventoryTransactionResource } from "./inventory.resource";
import { CreateInventoryTransactionInput } from "./inventory.validator";

export class InventoryService {
  constructor(private readonly inventoryRepository = new InventoryRepository()) {}

  async createTransaction(businessId: string, input: CreateInventoryTransactionInput) {
    const product = await this.inventoryRepository.findProduct(businessId, input.productId);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const stockDelta = this.getStockDelta(input.type, input.quantity);

    if (product.stock + stockDelta < 0) {
      throw new BadRequestError("Insufficient stock");
    }

    const { transaction } = await this.inventoryRepository.createTransaction({
      businessId,
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      reference: input.reference,
      notes: input.notes,
      stockDelta
    });

    return inventoryTransactionResource(transaction);
  }

  async list(
    businessId: string,
    query: { page?: number; limit?: number; productId?: string; type?: InventoryTransactionType }
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

  private getStockDelta(type: InventoryTransactionType, quantity: number) {
    if (type === InventoryTransactionType.STOCK_IN || type === InventoryTransactionType.PURCHASE) {
      return quantity;
    }

    if (type === InventoryTransactionType.STOCK_OUT || type === InventoryTransactionType.SALE) {
      return -quantity;
    }

    return quantity;
  }
}
