import { Category } from "@prisma/client";
import { CategoryWithRelationsModel } from "../models/category.model";

export const categoryResource = (category: CategoryWithRelationsModel) => ({
  id: category.id,
  businessId: category.businessId,
  parentId: category.parentId,
  name: category.name,
  description: category.description,
  status: category.status,
  parent: category.parent
    ? {
        id: category.parent.id,
        name: category.parent.name
      }
    : null,
  children: category.children?.map((child) => ({
    id: child.id,
    parentId: child.parentId,
    name: child.name,
    status: child.status
  })) ?? [],
  createdAt: category.createdAt,
  updatedAt: category.updatedAt
});

export const categoryTreeResource = (categories: Category[]) => {
  const byParent = new Map<number | null, Category[]>();

  categories.forEach((category) => {
    const parentId = category.parentId ?? null;
    byParent.set(parentId, [...(byParent.get(parentId) ?? []), category]);
  });

  const build = (parentId: number | null): unknown[] =>
    (byParent.get(parentId) ?? []).map((category) => ({
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      description: category.description,
      status: category.status,
      children: build(category.id)
    }));

  return build(null);
};
