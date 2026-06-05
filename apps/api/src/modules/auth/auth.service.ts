import type { PublicUser } from "@riz/shared";

import { UserRole } from "../../common/enums";
import { AppDataSource } from "../../config/data-source";
import { env } from "../../config/env";
import { RefreshToken } from "../../entities/refresh-token.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../utils/app-error";
import { toPublicUser } from "../users/user.mapper";
import type { LoginDto, RegisterDto } from "./auth.validation";
import { hashPassword, verifyPassword } from "./utils/password";
import { generateRefreshToken, hashRefreshToken } from "./utils/refresh-token";
import { accessTokenTtlSeconds, signAccessToken } from "./utils/tokens";

export interface RequestContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface IssuedSession {
  user: PublicUser;
  accessToken: string;
  /** Opaque refresh token — delivered to the client as an httpOnly cookie. */
  refreshToken: string;
  expiresIn: number;
}

const refreshTtlMs = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Create a refresh-token record + access token for an authenticated user. */
const issueSession = async (user: User, ctx: RequestContext): Promise<IssuedSession> => {
  const repo = AppDataSource.getRepository(RefreshToken);
  const rawRefreshToken = generateRefreshToken();

  await repo.save(
    repo.create({
      userId: user.id,
      tokenHash: hashRefreshToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + refreshTtlMs),
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
    }),
  );

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    refreshToken: rawRefreshToken,
    expiresIn: accessTokenTtlSeconds,
  };
};

export const authService = {
  async register(
    dto: RegisterDto,
    ctx: RequestContext,
    requesterRole?: UserRole,
  ): Promise<IssuedSession> {
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({
      where: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
    });
    if (existing) {
      throw AppError.badRequest("A user with this email or phone number already exists");
    }

    // Default to USER. A non-USER role is only honored for an authenticated
    // ADMIN caller — this prevents public privilege escalation via registration.
    let role = UserRole.USER;
    if (dto.role && dto.role !== UserRole.USER) {
      if (requesterRole !== UserRole.ADMIN) {
        throw AppError.forbidden("Only an admin can assign an elevated role");
      }
      role = dto.role;
    }

    const user = await repo.save(
      repo.create({
        fullname: dto.fullname,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: await hashPassword(dto.password),
        district: dto.district ?? null,
        addressLine: dto.addressLine ?? null,
        role,
        isActive: true,
      }),
    );

    return issueSession(user, ctx);
  },

  async login(dto: LoginDto, ctx: RequestContext): Promise<IssuedSession> {
    const repo = AppDataSource.getRepository(User);
    // password has `select: false`, so request it explicitly here.
    const user = await repo
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email: dto.email })
      .getOne();

    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw AppError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw AppError.forbidden("This account has been disabled");
    }

    return issueSession(user, ctx);
  },

  async refresh(rawToken: string, ctx: RequestContext): Promise<IssuedSession> {
    const repo = AppDataSource.getRepository(RefreshToken);
    const record = await repo.findOne({
      where: { tokenHash: hashRefreshToken(rawToken) },
      relations: { user: true },
    });

    if (!record || record.revokedAt !== null || record.expiresAt.getTime() < Date.now()) {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }
    if (!record.user.isActive) {
      throw AppError.unauthorized("This account is unavailable");
    }

    // Rotate: revoke the presented token before issuing a fresh session.
    record.revokedAt = new Date();
    await repo.save(record);

    return issueSession(record.user, ctx);
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const repo = AppDataSource.getRepository(RefreshToken);
    await repo.update({ tokenHash: hashRefreshToken(rawToken) }, { revokedAt: new Date() });
  },

  async getProfile(userId: number): Promise<PublicUser> {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return toPublicUser(user);
  },
};
