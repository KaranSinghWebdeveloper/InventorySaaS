import { NotFoundError } from "../../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { CustomerRepository } from "./customer.repository";
import { customerResource } from "./customer.resource";
import { CreateCustomerInput, UpdateCustomerInput } from "./customer.validator";

export class CustomerService {
  constructor(private readonly customerRepository = new CustomerRepository()) {}

  async create(businessId: string, input: CreateCustomerInput) {
    return customerResource(await this.customerRepository.create(businessId, input));
  }

  async list(businessId: string, query: { page?: number; limit?: number; search?: string }) {
    const pagination = getPagination(query);
    const { items, total } = await this.customerRepository.findMany(
      businessId,
      pagination.skip,
      pagination.take,
      query.search
    );
    return { items: items.map(customerResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: string, id: string) {
    const customer = await this.customerRepository.findById(businessId, id);
    if (!customer) throw new NotFoundError("Customer not found");
    return customerResource(customer);
  }

  async update(businessId: string, id: string, input: UpdateCustomerInput) {
    await this.getById(businessId, id);
    return customerResource(await this.customerRepository.update(businessId, id, input));
  }

  async delete(businessId: string, id: string) {
    await this.getById(businessId, id);
    await this.customerRepository.softDelete(businessId, id);
    return null;
  }
}
