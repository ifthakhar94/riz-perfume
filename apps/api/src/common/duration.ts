const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 } as const;

type Unit = keyof typeof UNIT_SECONDS;

/**
 * Parse a short duration string (e.g. "15m", "7d", "30s", "1h") into seconds.
 * Throws on malformed input so misconfiguration fails fast.
 */
export function parseDurationToSeconds(input: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid duration: "${input}" (expected e.g. "15m", "7d")`);
  }
  const value = Number(match[1]);
  const unit = match[2] as Unit;
  return value * UNIT_SECONDS[unit];
}
