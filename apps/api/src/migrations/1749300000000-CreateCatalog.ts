import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Catalog schema: sizes, types, categories, products, product_categories,
 * related_products, product_variants.
 */
export class CreateCatalog1749300000000 implements MigrationInterface {
  name = "CreateCatalog1749300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- sizes ---
    await queryRunner.query(`
      CREATE TABLE "sizes" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying(100) NOT NULL,
        CONSTRAINT "PK_sizes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sizes_name" ON "sizes" ("name")`);

    // --- types ---
    await queryRunner.query(`
      CREATE TABLE "types" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying(100) NOT NULL,
        CONSTRAINT "PK_types" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_types_name" ON "types" ("name")`);

    // --- categories ---
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_categories_name" ON "categories" ("name")`);

    // --- products ---
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "image_url" text,
        "image_alt" character varying(255),
        "meta_title" character varying(255),
        "meta_description" text,
        "og_title" character varying(255),
        "og_description" text,
        "og_image_url" text,
        "inspired_by" character varying(255),
        "top_notes" text,
        "middle_notes" text,
        "base_notes" text,
        "main_accords" text,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_products_slug" ON "products" ("slug")`);

    // --- product_categories (M:N products <-> categories) ---
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "product_id" integer NOT NULL,
        "category_id" integer NOT NULL,
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_product_categories_pair" ON "product_categories" ("product_id", "category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_product" ON "product_categories" ("product_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_categories"
      ADD CONSTRAINT "FK_product_categories_product" FOREIGN KEY ("product_id")
      REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "product_categories"
      ADD CONSTRAINT "FK_product_categories_category" FOREIGN KEY ("category_id")
      REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // --- related_products (self M:N) ---
    await queryRunner.query(`
      CREATE TABLE "related_products" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "product_id" integer NOT NULL,
        "related_product_id" integer NOT NULL,
        CONSTRAINT "PK_related_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_related_products_pair" ON "related_products" ("product_id", "related_product_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "related_products"
      ADD CONSTRAINT "FK_related_products_product" FOREIGN KEY ("product_id")
      REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "related_products"
      ADD CONSTRAINT "FK_related_products_related" FOREIGN KEY ("related_product_id")
      REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // --- product_variants ---
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "product_id" integer NOT NULL,
        "size_id" integer NOT NULL,
        "type_id" integer NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "sku" character varying(100) NOT NULL,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_product_variants_sku" ON "product_variants" ("sku")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variants_product" ON "product_variants" ("product_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      ADD CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("product_id")
      REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      ADD CONSTRAINT "FK_product_variants_size" FOREIGN KEY ("size_id")
      REFERENCES "sizes" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      ADD CONSTRAINT "FK_product_variants_type" FOREIGN KEY ("type_id")
      REFERENCES "types" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "related_products"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "types"`);
    await queryRunner.query(`DROP TABLE "sizes"`);
  }
}
