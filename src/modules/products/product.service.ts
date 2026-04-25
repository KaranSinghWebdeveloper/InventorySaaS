import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { NotFoundError } from "../../common/errors/httpErrors";
import { ProductRepository } from "./product.repository";
import { CreateProductInput, UpdateProductInput } from "./product.validator";
import { productResource } from "./product.resource";

export class ProductService {
  constructor(private readonly productRepository = new ProductRepository()) {}

  async create(businessId: string, input: CreateProductInput) {
    const product = await this.productRepository.create(businessId, {
      ...input,
      unitPrice: input.unitPrice,
      costPrice: input.costPrice,
      stock: 0
    });

    return productResource(product);
  }

  async list(
    businessId: string,
    query: { page?: number; limit?: number; search?: string; categoryId?: string; lowStock?: boolean }
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

  async getById(businessId: string, id: string) {
    const product = await this.productRepository.findById(businessId, id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return productResource(product);
  }

  async update(businessId: string, id: string, input: UpdateProductInput) {
    await this.getById(businessId, id);
    const product = await this.productRepository.update(businessId, id, input);
    return productResource(product);
  }

  async delete(businessId: string, id: string) {
    await this.getById(businessId, id);
    await this.productRepository.softDelete(businessId, id);
    return null;
  }
}
