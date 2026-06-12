import type { MigrationInterface, QueryRunner } from "typeorm";

import { slugify } from "../common/slug";

/**
 * Add a unique, URL-safe `slug` to categories (e.g. "Wood" → "wood") so
 * storefront URLs can read `?category=wood` instead of numeric ids.
 * Backfills existing rows from `name`; collisions get an `-{id}` suffix.
 */
export class AddCategorySlug1749900000000 implements MigrationInterface {
  name = "AddCategorySlug1749900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN "slug" varchar(180)`);

    // Backfill all rows (including soft-deleted, to keep the index unique).
    const rows: { id: number; name: string }[] = await queryRunner.query(
      `SELECT id, name FROM "categories" ORDER BY id`,
    );
    const used = new Set<string>();
    for (const row of rows) {
      let slug = slugify(row.name) || `category-${row.id}`;
      if (used.has(slug)) slug = `${slug}-${row.id}`;
      used.add(slug);
      await queryRunner.query(`UPDATE "categories" SET "slug" = $1 WHERE id = $2`, [slug, row.id]);
    }

    await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_categories_slug" ON "categories" ("slug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_categories_slug"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
  }
}
