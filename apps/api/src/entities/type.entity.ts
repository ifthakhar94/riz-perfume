import { Column, Entity, Index } from "typeorm";

import { BaseEntity } from "../database/base.entity";

@Entity("types")
export class Type extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  name!: string;
}
