import { Category } from "./category.entity";
import { CourierCharge } from "./courier-charge.entity";
import { DeliveryOrder } from "./delivery-order.entity";
import { ExpenseCategory } from "./expense-category.entity";
import { Expense } from "./expense.entity";
import { Investment } from "./investment.entity";
import { OfferOrderItem } from "./offer-order-item.entity";
import { OfferOrder } from "./offer-order.entity";
import { Offer } from "./offer.entity";
import { OrderCost } from "./order-cost.entity";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";
import { ProductCategory } from "./product-category.entity";
import { ProductVariantCost } from "./product-variant-cost.entity";
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
  ProductVariantCost,
  CourierCharge,
  ExpenseCategory,
  Expense,
  Investment,
  Order,
  OrderItem,
  DeliveryOrder,
  OrderCost,
  Offer,
  OfferOrder,
  OfferOrderItem,
];

export {
  Category,
  CourierCharge,
  DeliveryOrder,
  Expense,
  ExpenseCategory,
  Investment,
  Offer,
  OfferOrder,
  OfferOrderItem,
  Order,
  OrderCost,
  OrderItem,
  Product,
  ProductCategory,
  ProductVariant,
  ProductVariantCost,
  RefreshToken,
  RelatedProduct,
  Size,
  Type,
  User,
};
