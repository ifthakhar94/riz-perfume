import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../database/base.entity";
import { Category } from "./category.entity";
import { Product } from "./product.entity";

@Index(["productId", "categoryId"], { unique: true })
@Entity("product_categories")
export class ProductCategory extends BaseEntity {
  @Column({ type: "int", name: "product_id" })
  productId!: number;

  @Column({ type: "int", name: "category_id" })
  categoryId!: number;

  @ManyToOne(() => Product, (product) => product.productCategories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category!: Category;
}
