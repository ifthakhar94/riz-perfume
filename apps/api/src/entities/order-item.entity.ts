import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { OfferOrderItem } from "./offer-order-item.entity";
import { Order } from "./order.entity";
import { ProductVariant } from "./product-variant.entity";

// Per the schema, order_items has no timestamps — it is an immutable line snapshot.
@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", name: "order_id" })
  orderId!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ type: "int", name: "product_variant_id" })
  productVariantId!: number;

  @ManyToOne(() => ProductVariant, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "product_variant_id" })
  productVariant!: ProductVariant;

  @Column({ type: "int" })
  quantity!: number;

  // Price snapshot at purchase time.
  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "unit_price",
    transformer: numericTransformer,
  })
  unitPrice!: number;

  @OneToMany(() => OfferOrderItem, (offerItem) => offerItem.orderItem)
  offerItems!: OfferOrderItem[];
}
