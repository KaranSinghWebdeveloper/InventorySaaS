import { NotFoundError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { CustomerRepository } from "../repositories/customer.repository";
import { customerResource } from "../resources/customer.resource";
import { CreateCustomerInput, UpdateCustomerInput } from "../requests/customer.request";

export class CustomerService {
  constructor(private readonly customerRepository = new CustomerRepository()) {}

  async create(businessId: number, input: CreateCustomerInput) {
    return customerResource(await this.customerRepository.create(businessId, input));
  }

  async list(businessId: number, query: { page?: number; limit?: number; search?: string }) {
    const pagination = getPagination(query);
    const { items, total } = await this.customerRepository.findMany(
      businessId,
      pagination.skip,
      pagination.take,
      query.search
    );
    return { items: items.map(customerResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: number, id: number) {
    const customer = await this.customerRepository.findById(businessId, id);
    if (!customer) throw new NotFoundError("Customer not found");
    return customerResource(customer);
  }

  async update(businessId: number, id: number, input: UpdateCustomerInput) {
    await this.getById(businessId, id);
    return customerResource(await this.customerRepository.update(id, input));
  }

  async delete(businessId: number, id: number) {
    await this.getById(businessId, id);
    await this.customerRepository.delete(id);
    return null;
  }
}
