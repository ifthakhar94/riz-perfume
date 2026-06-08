import { Column, Entity, Index } from "typeorm";

import { BaseEntity } from "../database/base.entity";

@Entity("expense_categories")
export class ExpenseCategory extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;
}
