import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { SoftDeletableEntity } from "../database/base.entity";
import { Product } from "./product.entity";

@Index(["productId", "relatedProductId"], { unique: true })
@Entity("related_products")
export class RelatedProduct extends SoftDeletableEntity {
  @Column({ type: "int", name: "product_id" })
  productId!: number;

  @Column({ type: "int", name: "related_product_id" })
  relatedProductId!: number;

  @ManyToOne(() => Product, (product) => product.relatedLinks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "related_product_id" })
  relatedProduct!: Product;
}
