/** Extract a human-readable message from an RTK Query / API error envelope. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data) {
      const inner = (data as { error?: unknown }).error;
      if (typeof inner === "object" && inner !== null && "message" in inner) {
        const message = (inner as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) return message;
      }
    }
  }
  return fallback;
}
