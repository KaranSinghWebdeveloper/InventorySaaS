import { NotFoundError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { SupplierRepository } from "../repositories/supplier.repository";
import { supplierResource } from "../resources/supplier.resource";
import { CreateSupplierInput, UpdateSupplierInput } from "../requests/supplier.request";

export class SupplierService {
  constructor(private readonly supplierRepository = new SupplierRepository()) {}

  async create(businessId: number, input: CreateSupplierInput) {
    return supplierResource(await this.supplierRepository.create(businessId, input));
  }

  async list(businessId: number, query: { page?: number; limit?: number; search?: string }) {
    const pagination = getPagination(query);
    const { items, total } = await this.supplierRepository.findMany(
      businessId,
      pagination.skip,
      pagination.take,
      query.search
    );
    return { items: items.map(supplierResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: number, id: number) {
    const supplier = await this.supplierRepository.findById(businessId, id);
    if (!supplier) throw new NotFoundError("Supplier not found");
    return supplierResource(supplier);
  }

  async update(businessId: number, id: number, input: UpdateSupplierInput) {
    await this.getById(businessId, id);
    return supplierResource(await this.supplierRepository.update(id, input));
  }

  async delete(businessId: number, id: number) {
    await this.getById(businessId, id);
    await this.supplierRepository.delete(id);
    return null;
  }
}
