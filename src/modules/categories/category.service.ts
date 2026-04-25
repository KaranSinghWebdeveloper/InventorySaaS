import { BadRequestError, NotFoundError } from "../../common/errors/httpErrors";
import { toSlug } from "../../utils/slug";
import { CategoryRepository } from "./category.repository";
import { categoryResource, categoryTreeResource } from "./category.resource";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validator";

export class CategoryService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {}

  async create(businessId: string, input: CreateCategoryInput) {
    if (input.parentId) {
      await this.ensureExists(businessId, input.parentId, "Parent category not found");
    }

    const category = await this.categoryRepository.create(businessId, {
      parentId: input.parentId ?? null,
      name: input.name,
      slug: toSlug(input.name)
    });

    return categoryResource(category);
  }

  async list(businessId: string, query: { search?: string; tree?: boolean }) {
    const categories = await this.categoryRepository.findMany(businessId, query.search);
    return query.tree ? categoryTreeResource(categories) : categories.map(categoryResource);
  }

  async getById(businessId: string, id: string) {
    const category = await this.categoryRepository.findById(businessId, id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return categoryResource(category);
  }

  async update(businessId: string, id: string, input: UpdateCategoryInput) {
    await this.ensureExists(businessId, id);

    if (input.parentId === id) {
      throw new BadRequestError("Category cannot be its own parent");
    }

    if (input.parentId) {
      await this.ensureExists(businessId, input.parentId, "Parent category not found");
    }

    const category = await this.categoryRepository.update(businessId, id, {
      ...input,
      ...(input.name ? { slug: toSlug(input.name) } : {})
    });

    return categoryResource(category);
  }

  async delete(businessId: string, id: string) {
    await this.ensureExists(businessId, id);
    await this.categoryRepository.softDelete(businessId, id);
    return null;
  }

  private async ensureExists(businessId: string, id: string, message = "Category not found") {
    const category = await this.categoryRepository.findById(businessId, id);

    if (!category) {
      throw new NotFoundError(message);
    }
  }
}
