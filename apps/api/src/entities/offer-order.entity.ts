import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import type { OfferType } from "../common/enums";
import { numericTransformer } from "../common/numeric.transformer";
import { Offer } from "./offer.entity";
import { Order } from "./order.entity";

// Order-level offer application. No timestamps per schema.
@Entity("offer_orders")
export class OfferOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", name: "order_id" })
  orderId!: number;

  @ManyToOne(() => Order, (order) => order.offerOrders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ type: "int", name: "offer_id" })
  offerId!: number;

  @ManyToOne(() => Offer, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "offer_id" })
  offer!: Offer;

  // Snapshot of the offer type at application time (varchar per schema).
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
