import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { NotFoundError } from "../common/errors/httpErrors";
import { ProductRepository } from "../repositories/product.repository";
import { CreateProductInput, UpdateProductInput } from "../requests/product.request";
import { productResource } from "../resources/product.resource";

export class ProductService {
  constructor(private readonly productRepository = new ProductRepository()) { }

  async create(businessId: number, input: CreateProductInput) {
    const product = await this.productRepository.create(businessId, {
      categoryId: input.categoryId ?? null,
      sku: input.sku ?? null,
      barcode: input.barcode ?? null,
      image: input.image ?? null,
      name: input.name,
      price: input.price,
      costPrice: input.costPrice ?? null,
      lowStockAlert: input.lowStockAlert,
      unit: input.unit ?? null,
      status: input.status ?? 1,
      quantity: input.quantity ?? 0
    });

    return productResource(product);
  }

  async list(
    businessId: number,
    query: { page?: number; limit?: number; search?: string; categoryId?: number; lowStock?: boolean }
  ) {
    const pagination = getPagination(query);
    const { items, total } = await this.productRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      search: query.search,
      categoryId: query.categoryId,
      lowStock: query.lowStock
    });

    return {
      items: items.map(productResource),
      meta: buildPaginationMeta(total, pagination.page, pagination.limit)
    };
  }

  async getById(businessId: number, id: number) {
    const product = await this.productRepository.findById(businessId, id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return productResource(product);
  }

  async update(businessId: number, id: number, input: UpdateProductInput) {
    await this.getById(businessId, id);
    const product = await this.productRepository.update(businessId, id, {
      categoryId: input.categoryId,
      sku: input.sku,
      barcode: input.barcode,
      image: input.image,
      name: input.name,
      price: input.price,
      costPrice: input.costPrice,
      lowStockAlert: input.lowStockAlert,
      unit: input.unit,
      status: input.status,
      quantity: input.quantity
    });
    return productResource(product);
  }

  async delete(businessId: number, id: number) {
    await this.getById(businessId, id);
    await this.productRepository.delete(id);
    return null;
  }
}
