import { Column, Entity, Index, OneToMany } from "typeorm";

import { SoftDeletableEntity } from "../database/base.entity";
import { ProductCategory } from "./product-category.entity";
import { ProductVariant } from "./product-variant.entity";
import { RelatedProduct } from "./related-product.entity";

@Entity("products")
export class Product extends SoftDeletableEntity {
  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  slug!: string;

  @Column({ type: "text", name: "image_url", nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 255, name: "image_alt", nullable: true })
  imageAlt!: string | null;

  // ---- SEO ----
  @Column({ type: "varchar", length: 255, name: "meta_title", nullable: true })
  metaTitle!: string | null;

  @Column({ type: "text", name: "meta_description", nullable: true })
  metaDescription!: string | null;

  @Column({ type: "varchar", length: 255, name: "og_title", nullable: true })
  ogTitle!: string | null;

  @Column({ type: "text", name: "og_description", nullable: true })
  ogDescription!: string | null;

  @Column({ type: "text", name: "og_image_url", nullable: true })
  ogImageUrl!: string | null;

  // ---- Fragrance ----
  @Column({ type: "varchar", length: 255, name: "inspired_by", nullable: true })
  inspiredBy!: string | null;

  @Column({ type: "jsonb", name: "top_notes", nullable: true })
  topNotes!: string[] | null;

  @Column({ type: "jsonb", name: "middle_notes", nullable: true })
  middleNotes!: string[] | null;

  @Column({ type: "jsonb", name: "base_notes", nullable: true })
  baseNotes!: string[] | null;

  @Column({ type: "jsonb", name: "main_accords", nullable: true })
  mainAccords!: string[] | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants!: ProductVariant[];

  @OneToMany(() => ProductCategory, (pc) => pc.product)
  productCategories!: ProductCategory[];

  @OneToMany(() => RelatedProduct, (rp) => rp.product)
  relatedLinks!: RelatedProduct[];
}
