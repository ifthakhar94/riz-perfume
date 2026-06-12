import { Column, Entity, Index } from "typeorm";

import { SoftDeletableEntity } from "../database/base.entity";

@Entity("categories")
export class Category extends SoftDeletableEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 150 })
  name!: string;

  /** URL-safe identifier (e.g. "wood") — generated from the name. */
  @Index({ unique: true })
  @Column({ type: "varchar", length: 180 })
  slug!: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;
}
