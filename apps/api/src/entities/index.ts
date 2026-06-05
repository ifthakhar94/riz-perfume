import { RefreshToken } from "./refresh-token.entity";
import { User } from "./user.entity";

/**
 * Explicit entity registry for the TypeORM DataSource (deterministic loading).
 * Add new entities here as modules are introduced.
 */
export const entities = [User, RefreshToken];

export { RefreshToken, User };
