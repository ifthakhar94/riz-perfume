import { Category } from "./category.entity";
import { ProductCategory } from "./product-category.entity";
import { ProductVariant } from "./product-variant.entity";
import { Product } from "./product.entity";
import { RefreshToken } from "./refresh-token.entity";
import { RelatedProduct } from "./related-product.entity";
import { Size } from "./size.entity";
import { Type } from "./type.entity";
import { User } from "./user.entity";

/**
 * Explicit entity registry for the TypeORM DataSource (deterministic loading).
 * Add new entities here as modules are introduced.
 */
export const entities = [
  User,
  RefreshToken,
  Category,
  Size,
  Type,
  Product,
  ProductCategory,
  RelatedProduct,
  ProductVariant,
];

export {
  Category,
  Product,
  ProductCategory,
  ProductVariant,
  RefreshToken,
  RelatedProduct,
  Size,
  Type,
  User,
};
