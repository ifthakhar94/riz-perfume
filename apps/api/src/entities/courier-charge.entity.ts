import { Column, Entity } from "typeorm";

import { CourierZone, DeliveryType } from "../common/enums";
import { numericTransformer } from "../common/numeric.transformer";
import { BaseEntity } from "../database/base.entity";

@Entity("courier_charges")
export class CourierCharge extends BaseEntity {
  @Column({ type: "varchar", length: 120 })
  courier!: string;

  @Column({ type: "enum", enum: CourierZone })
  zone!: CourierZone;

  @Column({ type: "enum", enum: DeliveryType, name: "delivery_type" })
  deliveryType!: DeliveryType;

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericTransformer })
  charge!: number;

  @Column({ type: "int", name: "quantity_to_multiply_charge", default: 1 })
  quantityToMultiplyCharge!: number;
}
