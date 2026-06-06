import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Convert product fragrance-note columns from `text` to `jsonb` arrays.
 * Existing non-null text values are wrapped into a single-element array.
 */
export class AlterProductNotesToJsonb1749400000000 implements MigrationInterface {
  name = "AlterProductNotesToJsonb1749400000000";

  private readonly columns = ["top_notes", "middle_notes", "base_notes", "main_accords"];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.columns) {
      await queryRunner.query(`
        ALTER TABLE "products"
        ALTER COLUMN "${column}" TYPE jsonb
        USING (CASE WHEN "${column}" IS NULL THEN NULL ELSE to_jsonb(ARRAY["${column}"]) END)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.columns) {
      await queryRunner.query(`
        ALTER TABLE "products"
        ALTER COLUMN "${column}" TYPE text
        USING (
          CASE WHEN "${column}" IS NULL THEN NULL
          ELSE array_to_string(ARRAY(SELECT jsonb_array_elements_text("${column}")), ', ') END
        )
      `);
    }
  }
}
