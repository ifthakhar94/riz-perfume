import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Orders schema: orders, order_items, delivery_orders, order_cost.
 */
export class CreateOrders1749700000000 implements MigrationInterface {
  name = "CreateOrders1749700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "orders_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "delivery_orders_status_enum" AS ENUM ('PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELED')`,
    );

    // --- orders ---
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" integer,
        "username" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(30) NOT NULL,
        "district" character varying(120) NOT NULL,
        "address_line" text NOT NULL,
        "status" "orders_status_enum" NOT NULL DEFAULT 'PENDING',
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user" ON "orders" ("user_id")`);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id")
      REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // --- order_items (no timestamps; immutable line) ---
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" SERIAL NOT NULL,
        "order_id" integer NOT NULL,
        "product_variant_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order" ON "order_items" ("order_id")`);
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id")
      REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_variant" FOREIGN KEY ("product_variant_id")
      REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // --- delivery_orders ---
    await queryRunner.query(`
      CREATE TABLE "delivery_orders" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "order_id" integer NOT NULL,
        "courier_charge_id" integer,
        "courier_charge" numeric(10,2) NOT NULL,
        "status" "delivery_orders_status_enum" NOT NULL DEFAULT 'PENDING',
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "canceled_at" TIMESTAMP WITH TIME ZONE,
        "canceled_reason" text,
        CONSTRAINT "PK_delivery_orders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_delivery_orders_order" ON "delivery_orders" ("order_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "delivery_orders"
      ADD CONSTRAINT "FK_delivery_orders_order" FOREIGN KEY ("order_id")
      REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "delivery_orders"
      ADD CONSTRAINT "FK_delivery_orders_courier" FOREIGN KEY ("courier_charge_id")
      REFERENCES "courier_charges" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // --- order_cost ---
    await queryRunner.query(`
      CREATE TABLE "order_cost" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "order_id" integer NOT NULL,
        "raw_material_cost" numeric(10,2) NOT NULL,
        "bottle_cost" numeric(10,2) NOT NULL,
        "packaging_cost" numeric(10,2) NOT NULL DEFAULT '0',
        "delivery_cost" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_cost" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_order_cost_order" ON "order_cost" ("order_id")`);
    await queryRunner.query(`
      ALTER TABLE "order_cost"
      ADD CONSTRAINT "FK_order_cost_order" FOREIGN KEY ("order_id")
      REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_cost"`);
    await queryRunner.query(`DROP TABLE "delivery_orders"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "delivery_orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "orders_status_enum"`);
  }
}
