import { Category } from "@prisma/client";

type CategoryNode = Category & {
  children?: Category[];
  parent?: Category | null;
};

export const categoryResource = (category: CategoryNode) => ({
  id: category.id,
  businessId: category.businessId,
  parentId: category.parentId,
  name: category.name,
  slug: category.slug,
  parent: category.parent
    ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug
      }
    : null,
  children: category.children?.map((child) => ({
    id: child.id,
    parentId: child.parentId,
    name: child.name,
    slug: child.slug
  })) ?? [],
  createdAt: category.createdAt,
  updatedAt: category.updatedAt
});

export const categoryTreeResource = (categories: Category[]) => {
  const byParent = new Map<string | null, Category[]>();

  categories.forEach((category) => {
    const parentId = category.parentId ?? null;
    byParent.set(parentId, [...(byParent.get(parentId) ?? []), category]);
  });

  const build = (parentId: string | null): unknown[] =>
    (byParent.get(parentId) ?? []).map((category) => ({
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      children: build(category.id)
    }));

  return build(null);
};
