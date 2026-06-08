import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { numericTransformer } from "../common/numeric.transformer";
import { SoftDeletableEntity } from "../database/base.entity";
import { User } from "./user.entity";

@Entity("investments")
export class Investment extends SoftDeletableEntity {
  @Column({ type: "varchar", length: 200, name: "investor_name" })
  investorName!: string;

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericTransformer })
  amount!: number;

  @Column({ type: "varchar", length: 100, name: "transaction_medium", nullable: true })
  transactionMedium!: string | null;

  @Column({ type: "varchar", length: 200, name: "transaction_from_account", nullable: true })
  transactionFromAccount!: string | null;

  @Column({ type: "varchar", length: 200, name: "received_account", nullable: true })
  receivedAccount!: string | null;

  @Column({ type: "text", name: "proof_details", nullable: true })
  proofDetails!: string | null;

  @Column({ type: "text", name: "update_reason", nullable: true })
  updateReason!: string | null;

  @Column({ type: "int", name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "updated_by" })
  updatedByUser!: User | null;
}
