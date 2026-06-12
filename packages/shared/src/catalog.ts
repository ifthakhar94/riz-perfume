/** Request payload to create/update a product (admin). */
export interface ProductUpsertInput {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  inspiredBy?: string | null;
  topNotes?: string[] | null;
  middleNotes?: string[] | null;
  baseNotes?: string[] | null;
  mainAccords?: string[] | null;
  description?: string | null;
  isActive?: boolean;
  categoryIds?: number[];
  relatedProductIds?: number[];
}

/** Request payload to create/update a product variant (admin). */
export interface VariantUpsertInput {
  sizeId: number;
  typeId: number;
  price: number;
  sku: string;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface SizeDto {
  id: number;
  name: string;
}

export interface TypeDto {
  id: number;
  name: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  /** URL-safe identifier (e.g. "wood") — generated from the name. */
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantDto {
  id: number;
  price: number;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  size: SizeDto;
  type: TypeDto;
}

/** Lightweight product shape for list endpoints. */
export interface ProductListItemDto {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string | null;
  isActive: boolean;
  categories: { id: number; name: string }[];
  fromPrice: number | null;
  createdAt: string;
}

/** Full product shape for the detail endpoint. */
export interface ProductDetailDto extends Omit<ProductListItemDto, "fromPrice"> {
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
  };
  fragrance: {
    inspiredBy: string | null;
    topNotes: string[] | null;
    middleNotes: string[] | null;
    baseNotes: string[] | null;
    mainAccords: string[] | null;
  };
  description: string | null;
  variants: ProductVariantDto[];
  relatedProducts: Pick<ProductListItemDto, "id" | "name" | "slug" | "imageUrl">[];
  updatedAt: string;
}
