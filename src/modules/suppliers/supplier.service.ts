import { NotFoundError } from "../../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { SupplierRepository } from "./supplier.repository";
import { supplierResource } from "./supplier.resource";
import { CreateSupplierInput, UpdateSupplierInput } from "./supplier.validator";

export class SupplierService {
  constructor(private readonly supplierRepository = new SupplierRepository()) {}

  async create(businessId: string, input: CreateSupplierInput) {
    return supplierResource(await this.supplierRepository.create(businessId, input));
  }

  async list(businessId: string, query: { page?: number; limit?: number; search?: string }) {
    const pagination = getPagination(query);
    const { items, total } = await this.supplierRepository.findMany(
      businessId,
      pagination.skip,
      pagination.take,
      query.search
    );
    return { items: items.map(supplierResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: string, id: string) {
    const supplier = await this.supplierRepository.findById(businessId, id);
    if (!supplier) throw new NotFoundError("Supplier not found");
    return supplierResource(supplier);
  }

  async update(businessId: string, id: string, input: UpdateSupplierInput) {
    await this.getById(businessId, id);
    return supplierResource(await this.supplierRepository.update(businessId, id, input));
  }

  async delete(businessId: string, id: string) {
    await this.getById(businessId, id);
    await this.supplierRepository.softDelete(businessId, id);
    return null;
  }
}
