import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import type { OfferType } from "../common/enums";
import { numericTransformer } from "../common/numeric.transformer";
import { Offer } from "./offer.entity";
import { OrderItem } from "./order-item.entity";

// Item-level offer application. No timestamps per schema.
@Entity("offer_order_items")
export class OfferOrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", name: "order_item_id" })
  orderItemId!: number;

  @ManyToOne(() => OrderItem, (item) => item.offerItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_item_id" })
  orderItem!: OrderItem;

  @Column({ type: "int", name: "offer_id" })
  offerId!: number;

  @ManyToOne(() => Offer, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "offer_id" })
  offer!: Offer;

  @Column({ type: "varchar", length: 40, name: "offer_type" })
  offerType!: OfferType;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "discount_amount",
    transformer: numericTransformer,
  })
  discountAmount!: number;
}
