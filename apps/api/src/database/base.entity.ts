import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/** Base for all entities: auto-incrementing id + created/updated timestamps. */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;
}

/** Base for entities that support soft deletes (a nullable `deleted_at`). */
export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;
}
