import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../database/base.entity";
import { User } from "./user.entity";

@Entity("refresh_tokens")
export class RefreshToken extends BaseEntity {
  @Index()
  @Column({ type: "int", name: "user_id" })
  userId!: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  // SHA-256 hash of the opaque refresh token (the raw value never touches the DB).
  @Index({ unique: true })
  @Column({ type: "varchar", length: 128, name: "token_hash" })
  tokenHash!: string;

  @Column({ type: "timestamptz", name: "expires_at" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", name: "revoked_at", nullable: true })
  revokedAt!: Date | null;

  @Column({ type: "varchar", length: 255, name: "user_agent", nullable: true })
  userAgent!: string | null;

  @Column({ type: "varchar", length: 64, name: "ip_address", nullable: true })
  ipAddress!: string | null;
}
