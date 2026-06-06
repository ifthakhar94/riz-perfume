import { Column, Entity, Index } from "typeorm";

import { SoftDeletableEntity } from "../database/base.entity";

@Entity("categories")
export class Category extends SoftDeletableEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;
}
