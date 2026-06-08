import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";
import { Order } from "./order.entity";

@Entity("order_cost")
export class OrderCost extends SoftDeletableEntity {
  @Index()
  @Column({ type: "int", name: "order_id" })
  orderId!: number;

  @OneToOne(() => Order, (order) => order.cost, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "raw_material_cost",
    transformer: numericTransformer,
  })
  rawMaterialCost!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "bottle_cost",
    transformer: numericTransformer,
  })
  bottleCost!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "packaging_cost",
    default: 0,
    transformer: numericTransformer,
  })
  packagingCost!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "delivery_cost",
    transformer: numericTransformer,
  })
  deliveryCost!: number;
}
