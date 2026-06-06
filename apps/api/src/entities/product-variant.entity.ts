import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";
import { Product } from "./product.entity";
import { Size } from "./size.entity";
import { Type } from "./type.entity";

@Entity("product_variants")
export class ProductVariant extends SoftDeletableEntity {
  @Index()
  @Column({ type: "int", name: "product_id" })
  productId!: number;

  @Column({ type: "int", name: "size_id" })
  sizeId!: number;

  @Column({ type: "int", name: "type_id" })
  typeId!: number;

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericTransformer })
  price!: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  sku!: string;

  @Column({ type: "int", name: "stock_quantity", default: 0 })
  stockQuantity!: number;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @ManyToOne(() => Size, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "size_id" })
  size!: Size;

  @ManyToOne(() => Type, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "type_id" })
  type!: Type;
}
