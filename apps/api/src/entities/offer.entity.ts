import { Column, Entity } from "typeorm";

import { OfferType } from "../common/enums";
import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";

@Entity("offers")
export class Offer extends SoftDeletableEntity {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "enum", enum: OfferType })
  type!: OfferType;

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericTransformer })
  value!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "min_order_amount",
    nullable: true,
    transformer: numericTransformer,
  })
  minOrderAmount!: number | null;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "discount_up_to_amount",
    nullable: true,
    transformer: numericTransformer,
  })
  discountUpToAmount!: number | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @Column({ type: "timestamptz", name: "start_date" })
  startDate!: Date;

  @Column({ type: "timestamptz", name: "end_date" })
  endDate!: Date;
}
