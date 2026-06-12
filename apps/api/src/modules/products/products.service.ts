import { In, type EntityManager } from "typeorm";

import type { ProductListItemDto } from "@riz/shared";

import { slugify } from "../../common/slug";
import { AppDataSource } from "../../config/data-source";
import { Category } from "../../entities/category.entity";
import { ProductCategory } from "../../entities/product-category.entity";
import { ProductVariant } from "../../entities/product-variant.entity";
import { Product } from "../../entities/product.entity";
import { RelatedProduct } from "../../entities/related-product.entity";
import { AppError } from "../../utils/app-error";
import { toProductListItem } from "./product.mapper";
import type { CreateProductDto, UpdateProductDto } from "./products.validation";

const DETAIL_RELATIONS = {
  productCategories: { category: true },
  variants: { size: true, type: true },
  relatedLinks: { relatedProduct: true },
};

/** Replace a product's category links with the given set (validates existence). */
const syncCategories = async (manager: EntityManager, productId: number, categoryIds: number[]) => {
  const repo = manager.getRepository(ProductCategory);
  await repo.delete({ productId });
  const unique = [...new Set(categoryIds)];
  if (!unique.length) return;
  const count = await manager.getRepository(Category).countBy({ id: In(unique) });
  if (count !== unique.length) throw AppError.badRequest("One or more categoryIds do not exist");
  await repo.insert(unique.map((categoryId) => ({ productId, categoryId })));
};

/** Replace a product's related-product links with the given set (excludes self). */
const syncRelated = async (manager: EntityManager, productId: number, relatedIds: number[]) => {
  const repo = manager.getRepository(RelatedProduct);
  await repo.delete({ productId });
  const unique = [...new Set(relatedIds)].filter((id) => id !== productId);
  if (!unique.length) return;
  const count = await manager.getRepository(Product).countBy({ id: In(unique) });
  if (count !== unique.length) {
    throw AppError.badRequest("One or more relatedProductIds do not exist");
  }
  await repo.insert(unique.map((relatedProductId) => ({ productId, relatedProductId })));
};

const loadDetailed = async (id: number): Promise<Product> => {
  const product = await AppDataSource.getRepository(Product).findOne({
    where: { id },
    relations: DETAIL_RELATIONS,
  });
  if (!product) throw AppError.notFound("Product not found");
  return product;
};

/** Map of productId → minimum active variant price (for list "from" pricing). */
const minPrices = async (ids: number[]): Promise<Map<number, number>> => {
  const map = new Map<number, number>();
  if (!ids.length) return map;
  const rows = await AppDataSource.getRepository(ProductVariant)
    .createQueryBuilder("v")
    .select("v.productId", "pid")
    .addSelect("MIN(v.price)", "min")
    .where("v.productId IN (:...ids)", { ids })
    .andWhere("v.isActive = :active", { active: true })
    .groupBy("v.productId")
    .getRawMany<{ pid: number; min: string }>();
  for (const row of rows) map.set(Number(row.pid), Number(row.min));
  return map;
};

export interface ListProductsParams {
  skip: number;
  take: number;
  search?: string;
  categoryId?: number;
  /** Category slug (e.g. "wood") — the storefront's URL-friendly filter. */
  categorySlug?: string;
  includeInactive?: boolean;
}

export const productsService = {
  async list(params: ListProductsParams): Promise<{ items: ProductListItemDto[]; total: number }> {
    const qb = AppDataSource.getRepository(Product)
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.productCategories", "pc")
      .leftJoinAndSelect("pc.category", "category")
      .orderBy("product.createdAt", "DESC")
      .skip(params.skip)
      .take(params.take);

    if (!params.includeInactive) qb.andWhere("product.isActive = :active", { active: true });
    if (params.search) qb.andWhere("product.name ILIKE :search", { search: `%${params.search}%` });
    if (params.categoryId) {
      qb.andWhere(
        "product.id IN (SELECT pc2.product_id FROM product_categories pc2 WHERE pc2.category_id = :categoryId)",
        { categoryId: params.categoryId },
      );
    }
    if (params.categorySlug) {
      qb.andWhere(
        `product.id IN (
          SELECT pc3.product_id FROM product_categories pc3
          JOIN categories c3 ON c3.id = pc3.category_id
          WHERE c3.slug = :categorySlug
        )`,
        { categorySlug: params.categorySlug },
      );
    }

    const [products, total] = await qb.getManyAndCount();
    const priceMap = await minPrices(products.map((p) => p.id));
    const items = products.map((p) => toProductListItem(p, priceMap.get(p.id) ?? null));
    return { items, total };
  },

  getBySlug(slug: string): Promise<Product | null> {
    return AppDataSource.getRepository(Product).findOne({
      where: { slug },
      relations: DETAIL_RELATIONS,
    });
  },

  getById(id: number): Promise<Product> {
    return loadDetailed(id);
  },

  async create(dto: CreateProductDto): Promise<Product> {
    const id = await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Product);
      const { categoryIds, relatedProductIds, slug, ...fields } = dto;
      const product = await repo.save(
        repo.create({ ...fields, slug: slug?.trim() || slugify(dto.name) }),
      );
      await syncCategories(manager, product.id, categoryIds ?? []);
      await syncRelated(manager, product.id, relatedProductIds ?? []);
      return product.id;
    });
    return loadDetailed(id);
  },

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Product);
      const product = await repo.findOne({ where: { id } });
      if (!product) throw AppError.notFound("Product not found");
      const { categoryIds, relatedProductIds, slug, ...fields } = dto;
      Object.assign(product, fields);
      if (slug !== undefined) product.slug = slug.trim() || slugify(product.name);
      await repo.save(product);
      if (categoryIds !== undefined) await syncCategories(manager, id, categoryIds);
      if (relatedProductIds !== undefined) await syncRelated(manager, id, relatedProductIds);
    });
    return loadDetailed(id);
  },

  async remove(id: number): Promise<void> {
    const result = await AppDataSource.getRepository(Product).softDelete({ id });
    if (!result.affected) throw AppError.notFound("Product not found");
  },
};
