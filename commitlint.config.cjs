/**
 * Conventional Commits configuration.
 * @see https://www.conventionalcommits.org/
 *
 * Examples:
 *   feat(web): add coming soon page
 *   fix(api): handle missing database connection
 *   chore(repo): configure husky hooks
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["web", "api", "shared", "config", "repo", "ci", "deps", "release"],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
  },
};
