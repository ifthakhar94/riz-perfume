import type { ValueTransformer } from "typeorm";

/**
 * Postgres `numeric`/`decimal` columns come back as strings (to preserve
 * precision). This transformer surfaces them as JS numbers on the entity while
 * writing them back unchanged.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null): number | null | undefined =>
    value === null || value === undefined ? value : Number(value),
};
