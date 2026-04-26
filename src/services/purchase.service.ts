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
  constructor(private readonly purchaseRepository = new PurchaseRepository()) {}

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
    const { items, total } = await this.purchaseRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      status: query.status,
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
}
