import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial auth schema: users + refresh_tokens.
 * Matches User (BaseEntity) and RefreshToken (BaseEntity).
 */
export class InitAuth1749200000000 implements MigrationInterface {
  name = "InitAuth1749200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('ADMIN', 'USER')`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "fullname" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone_number" character varying(30) NOT NULL,
        "password" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'USER',
        "district" character varying(120),
        "address_line" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_phone_number" ON "users" ("phone_number")`,
    );

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" integer NOT NULL,
        "token_hash" character varying(128) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "user_agent" character varying(255),
        "ip_address" character varying(64),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX "UQ_refresh_tokens_token_hash"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "UQ_users_phone_number"`);
    await queryRunner.query(`DROP INDEX "UQ_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
