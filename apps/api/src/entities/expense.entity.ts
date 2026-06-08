import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";
import { ExpenseCategory } from "./expense-category.entity";
import { User } from "./user.entity";

@Entity("expenses")
export class Expense extends SoftDeletableEntity {
  @Index()
  @Column({ type: "int", name: "expense_category_id" })
  expenseCategoryId!: number;

  @ManyToOne(() => ExpenseCategory, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "expense_category_id" })
  category!: ExpenseCategory;

  @Column({ type: "date", name: "expense_date" })
  expenseDate!: string;

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericTransformer })
  amount!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 200, name: "vendor_name", nullable: true })
  vendorName!: string | null;

  @Column({ type: "varchar", length: 100, name: "payment_method", nullable: true })
  paymentMethod!: string | null;

  @Column({ type: "varchar", length: 200, name: "transaction_reference", nullable: true })
  transactionReference!: string | null;

  @Column({ type: "varchar", length: 100, name: "invoice_number", nullable: true })
  invoiceNumber!: string | null;

  @Column({ type: "int", name: "created_by", nullable: true })
  createdBy!: number | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  createdByUser!: User | null;
}
