import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Offers schema: offers, offer_orders, offer_order_items.
 */
export class CreateOffers1749800000000 implements MigrationInterface {
  name = "CreateOffers1749800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "offers_type_enum" AS ENUM ('FREE_DELIVERY', 'PRODUCT_PERCENT', 'ORDER_PERCENT', 'FLAT_DISCOUNT_TK')`,
    );

    // --- offers ---
    await queryRunner.query(`
      CREATE TABLE "offers" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        "type" "offers_type_enum" NOT NULL,
        "value" numeric(10,2) NOT NULL,
        "min_order_amount" numeric(10,2),
        "discount_up_to_amount" numeric(10,2),
        "is_active" boolean NOT NULL DEFAULT true,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_offers" PRIMARY KEY ("id")
      )
    `);

    // --- offer_orders (no timestamps) ---
    await queryRunner.query(`
      CREATE TABLE "offer_orders" (
        "id" SERIAL NOT NULL,
        "order_id" integer NOT NULL,
        "offer_id" integer NOT NULL,
        "offer_type" character varying(40) NOT NULL,
        "discount_amount" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_offer_orders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_offer_orders_order" ON "offer_orders" ("order_id")`);
    await queryRunner.query(`
      ALTER TABLE "offer_orders"
      ADD CONSTRAINT "FK_offer_orders_order" FOREIGN KEY ("order_id")
      REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "offer_orders"
      ADD CONSTRAINT "FK_offer_orders_offer" FOREIGN KEY ("offer_id")
      REFERENCES "offers" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // --- offer_order_items (no timestamps) ---
    await queryRunner.query(`
      CREATE TABLE "offer_order_items" (
        "id" SERIAL NOT NULL,
        "order_item_id" integer NOT NULL,
        "offer_id" integer NOT NULL,
        "offer_type" character varying(40) NOT NULL,
        "discount_amount" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_offer_order_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_order_items_item" ON "offer_order_items" ("order_item_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "offer_order_items"
      ADD CONSTRAINT "FK_offer_order_items_item" FOREIGN KEY ("order_item_id")
      REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "offer_order_items"
      ADD CONSTRAINT "FK_offer_order_items_offer" FOREIGN KEY ("offer_id")
      REFERENCES "offers" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "offer_order_items"`);
    await queryRunner.query(`DROP TABLE "offer_orders"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TYPE "offers_type_enum"`);
  }
}
