import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Finance schema: expense_categories, expenses, investments.
 */
export class CreateFinance1749600000000 implements MigrationInterface {
  name = "CreateFinance1749600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- expense_categories ---
    await queryRunner.query(`
      CREATE TABLE "expense_categories" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying(150) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_expense_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_expense_categories_name" ON "expense_categories" ("name")`,
    );

    // --- expenses ---
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "expense_category_id" integer NOT NULL,
        "expense_date" date NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "description" text,
        "vendor_name" character varying(200),
        "payment_method" character varying(100),
        "transaction_reference" character varying(200),
        "invoice_number" character varying(100),
        "created_by" integer,
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_category" ON "expenses" ("expense_category_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD CONSTRAINT "FK_expenses_category" FOREIGN KEY ("expense_category_id")
      REFERENCES "expense_categories" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD CONSTRAINT "FK_expenses_created_by" FOREIGN KEY ("created_by")
      REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // --- investments ---
    await queryRunner.query(`
      CREATE TABLE "investments" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "investor_name" character varying(200) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "transaction_medium" character varying(100),
        "transaction_from_account" character varying(200),
        "received_account" character varying(200),
        "proof_details" text,
        "update_reason" text,
        "updated_by" integer,
        CONSTRAINT "PK_investments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "investments"
      ADD CONSTRAINT "FK_investments_updated_by" FOREIGN KEY ("updated_by")
      REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "investments" DROP CONSTRAINT "FK_investments_updated_by"`,
    );
    await queryRunner.query(`DROP TABLE "investments"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_created_by"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_category"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP INDEX "UQ_expense_categories_name"`);
    await queryRunner.query(`DROP TABLE "expense_categories"`);
  }
}
