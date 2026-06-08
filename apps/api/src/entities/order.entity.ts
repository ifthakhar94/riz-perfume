import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

import { OrderStatus } from "../common/enums";
import { BaseEntity } from "../database/base.entity";
import { DeliveryOrder } from "./delivery-order.entity";
import { OfferOrder } from "./offer-order.entity";
import { OrderCost } from "./order-cost.entity";
import { OrderItem } from "./order-item.entity";
import { User } from "./user.entity";

@Entity("orders")
export class Order extends BaseEntity {
  // Nullable → guest checkout is supported.
  @Index()
  @Column({ type: "int", name: "user_id", nullable: true })
  userId!: number | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  // Customer snapshot (kept even for guest orders / if the user changes details later).
  @Column({ type: "varchar", length: 150 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 30 })
  phone!: string;

  @Column({ type: "varchar", length: 120 })
  district!: string;

  @Column({ type: "text", name: "address_line" })
  addressLine!: string;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @OneToOne(() => DeliveryOrder, (delivery) => delivery.order)
  delivery!: DeliveryOrder | null;

  @OneToOne(() => OrderCost, (cost) => cost.order)
  cost!: OrderCost | null;

  @OneToMany(() => OfferOrder, (offerOrder) => offerOrder.order)
  offerOrders!: OfferOrder[];
}
