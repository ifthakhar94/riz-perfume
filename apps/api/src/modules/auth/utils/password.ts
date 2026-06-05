import bcrypt from "bcryptjs";

import { env } from "../../../config/env";

/**
 * Password hashing via bcrypt (pure-JS bcryptjs — no native build step, which
 * keeps installs reliable across machines/CI). argon2id is a future upgrade.
 */
export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
