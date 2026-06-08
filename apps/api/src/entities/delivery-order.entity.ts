import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { DeliveryStatus } from "../common/enums";
import { numericTransformer } from "../common/numeric.transformer";
import { BaseEntity } from "../database/base.entity";
import { CourierCharge } from "./courier-charge.entity";
import { Order } from "./order.entity";

@Entity("delivery_orders")
export class DeliveryOrder extends BaseEntity {
  @Index()
  @Column({ type: "int", name: "order_id" })
  orderId!: number;

  @OneToOne(() => Order, (order) => order.delivery, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({ type: "int", name: "courier_charge_id", nullable: true })
  courierChargeId!: number | null;

  @ManyToOne(() => CourierCharge, { onDelete: "SET NULL" })
  @JoinColumn({ name: "courier_charge_id" })
  courierChargeRef!: CourierCharge | null;

  // Snapshot of the delivery charge at order time.
  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "courier_charge",
    transformer: numericTransformer,
  })
  courierCharge!: number;

  @Column({ type: "enum", enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status!: DeliveryStatus;

  @Column({ type: "timestamptz", name: "delivered_at", nullable: true })
  deliveredAt!: Date | null;

  @Column({ type: "timestamptz", name: "canceled_at", nullable: true })
  canceledAt!: Date | null;

  @Column({ type: "text", name: "canceled_reason", nullable: true })
  canceledReason!: string | null;
}
