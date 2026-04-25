import { BadRequestError, NotFoundError } from "../common/errors/httpErrors";
import { CategoryRepository } from "../repositories/category.repository";
import { categoryResource, categoryTreeResource } from "../resources/category.resource";
import { CreateCategoryInput, UpdateCategoryInput } from "../requests/category.request";

export class CategoryService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {}

  async create(businessId: number, input: CreateCategoryInput) {
    if (input.parentId) {
      await this.ensureExists(businessId, input.parentId, "Parent category not found");
    }

    const category = await this.categoryRepository.create(businessId, {
      parentId: input.parentId ?? null,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? 1
    });

    return categoryResource(category);
  }

  async list(businessId: number, query: { search?: string; tree?: boolean; status?: number }) {
    const categories = await this.categoryRepository.findMany(businessId, query.search, query.status);
    return query.tree ? categoryTreeResource(categories) : categories.map(categoryResource);
  }

  async getById(businessId: number, id: number) {
    const category = await this.categoryRepository.findById(businessId, id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return categoryResource(category);
  }

  async update(businessId: number, id: number, input: UpdateCategoryInput) {
    await this.ensureExists(businessId, id);

    if (input.parentId === id) {
      throw new BadRequestError("Category cannot be its own parent");
    }

    if (input.parentId) {
      await this.ensureExists(businessId, input.parentId, "Parent category not found");
    }

    const category = await this.categoryRepository.update(businessId, id, {
      parentId: input.parentId,
      name: input.name,
      description: input.description,
      status: input.status
    });

    return categoryResource(category);
  }

  async delete(businessId: number, id: number) {
    await this.ensureExists(businessId, id);
    await this.categoryRepository.delete(id);
    return null;
  }

  private async ensureExists(businessId: number, id: number, message = "Category not found") {
    const category = await this.categoryRepository.findById(businessId, id);
    if (!category) {
      throw new NotFoundError(message);
    }
  }
}
