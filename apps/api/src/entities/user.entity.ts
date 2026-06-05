import { Column, Entity, Index, OneToMany } from "typeorm";

import { UserRole } from "../common/enums";
import { BaseEntity } from "../database/base.entity";
import { RefreshToken } from "./refresh-token.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 150 })
  fullname!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 30, name: "phone_number" })
  phoneNumber!: string;

  // Never selected by default — must be explicitly requested (e.g. at login).
  @Column({ type: "varchar", select: false })
  password!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "varchar", length: 120, nullable: true })
  district!: string | null;

  @Column({ type: "text", name: "address_line", nullable: true })
  addressLine!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: RefreshToken[];
}
