import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";
import { ProductVariant } from "./product-variant.entity";

@Entity("product_variant_cost")
export class ProductVariantCost extends SoftDeletableEntity {
  @Index()
  @Column({ type: "int", name: "product_variant_id" })
  productVariantId!: number;

  @ManyToOne(() => ProductVariant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_variant_id" })
  productVariant!: ProductVariant;

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
}
