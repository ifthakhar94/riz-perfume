import type { ProductDetailDto, ProductListItemDto, ProductVariantDto } from "@riz/shared";

import type { ProductVariant } from "../../entities/product-variant.entity";
import type { Product } from "../../entities/product.entity";

export const toVariantDto = (variant: ProductVariant): ProductVariantDto => ({
  id: variant.id,
  price: variant.price,
  sku: variant.sku,
  stockQuantity: variant.stockQuantity,
  isActive: variant.isActive,
  size: { id: variant.size.id, name: variant.size.name },
  type: { id: variant.type.id, name: variant.type.name },
});

const categoriesOf = (product: Product) =>
  (product.productCategories ?? []).map((pc) => ({ id: pc.category.id, name: pc.category.name }));

export const toProductListItem = (
  product: Product,
  fromPrice: number | null,
): ProductListItemDto => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  imageUrl: product.imageUrl,
  imageAlt: product.imageAlt,
  isActive: product.isActive,
  categories: categoriesOf(product),
  fromPrice,
  createdAt: product.createdAt.toISOString(),
});

export const toProductDetail = (
  product: Product,
  opts: { activeVariantsOnly: boolean },
): ProductDetailDto => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  imageUrl: product.imageUrl,
  imageAlt: product.imageAlt,
  isActive: product.isActive,
  categories: categoriesOf(product),
  seo: {
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    ogTitle: product.ogTitle,
    ogDescription: product.ogDescription,
    ogImageUrl: product.ogImageUrl,
  },
  fragrance: {
    inspiredBy: product.inspiredBy,
    topNotes: product.topNotes,
    middleNotes: product.middleNotes,
    baseNotes: product.baseNotes,
    mainAccords: product.mainAccords,
  },
  description: product.description,
  variants: (product.variants ?? [])
    .filter((variant) => !opts.activeVariantsOnly || variant.isActive)
    .map(toVariantDto),
  relatedProducts: (product.relatedLinks ?? []).map((link) => ({
    id: link.relatedProduct.id,
    name: link.relatedProduct.name,
    slug: link.relatedProduct.slug,
    imageUrl: link.relatedProduct.imageUrl,
  })),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});
