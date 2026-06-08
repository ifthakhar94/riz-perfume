/** Format a number as Bangladeshi Taka. */
export const formatBDT = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Compact taka (e.g. for chart axes / cards). */
export const formatTaka = (value: number) =>
  `৳${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Date + time (client-side; e.g. "07 Jun 2026, 14:32"). */
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Date only (client-side; e.g. "07 Jun 2026"). */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
