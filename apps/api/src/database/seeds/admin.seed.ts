import "reflect-metadata";

import { UserRole } from "../../common/enums";
import { AppDataSource } from "../../config/data-source";
import { env } from "../../config/env";
import { User } from "../../entities/user.entity";
import { logger } from "../../lib/logger";
import { hashPassword } from "../../modules/auth/utils/password";

/**
 * Seed (or report) the initial ADMIN account from ADMIN_* env vars.
 * Run with: `pnpm --filter @riz/api seed:admin`
 */
const seedAdmin = async (): Promise<void> => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    logger.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed an admin");
    process.exit(1);
  }

  await AppDataSource.initialize();
  try {
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({ where: { email: env.ADMIN_EMAIL } });

    if (existing) {
      logger.info(`Admin already exists: ${existing.email} (role: ${existing.role})`);
      return;
    }

    const admin = await repo.save(
      repo.create({
        fullname: env.ADMIN_FULLNAME ?? "Riz Admin",
        email: env.ADMIN_EMAIL,
        phoneNumber: env.ADMIN_PHONE ?? "+0000000000",
        password: await hashPassword(env.ADMIN_PASSWORD),
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
    logger.info(`✅ Seeded admin: ${admin.email}`);
  } finally {
    await AppDataSource.destroy();
  }
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error({ err }, "Failed to seed admin");
    process.exit(1);
  });
