import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Commerce configuration tables: product_variant_cost + courier_charges.
 * Prerequisites for the orders module (cost + delivery pricing).
 */
export class CreateCommerceConfig1749500000000 implements MigrationInterface {
  name = "CreateCommerceConfig1749500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- product_variant_cost ---
    await queryRunner.query(`
      CREATE TABLE "product_variant_cost" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "product_variant_id" integer NOT NULL,
        "raw_material_cost" numeric(10,2) NOT NULL,
        "bottle_cost" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_product_variant_cost" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_cost_variant" ON "product_variant_cost" ("product_variant_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_variant_cost"
      ADD CONSTRAINT "FK_product_variant_cost_variant" FOREIGN KEY ("product_variant_id")
      REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // --- courier_charges ---
    await queryRunner.query(
      `CREATE TYPE "courier_charges_zone_enum" AS ENUM ('inside_dhaka', 'outside_dhaka')`,
    );
    await queryRunner.query(
      `CREATE TYPE "courier_charges_delivery_type_enum" AS ENUM ('home_delivery', 'courier_pickup')`,
    );
    await queryRunner.query(`
      CREATE TABLE "courier_charges" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "courier" character varying(120) NOT NULL,
        "zone" "courier_charges_zone_enum" NOT NULL,
        "delivery_type" "courier_charges_delivery_type_enum" NOT NULL,
        "charge" numeric(10,2) NOT NULL,
        "quantity_to_multiply_charge" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_courier_charges" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "courier_charges"`);
    await queryRunner.query(`DROP TYPE "courier_charges_delivery_type_enum"`);
    await queryRunner.query(`DROP TYPE "courier_charges_zone_enum"`);
    await queryRunner.query(
      `ALTER TABLE "product_variant_cost" DROP CONSTRAINT "FK_product_variant_cost_variant"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_product_variant_cost_variant"`);
    await queryRunner.query(`DROP TABLE "product_variant_cost"`);
  }
}
