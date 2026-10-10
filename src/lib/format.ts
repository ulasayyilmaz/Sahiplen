const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

/** e.g. "11 Eki 2026 14:05" in Turkish time. */
export function formatDateTime(iso: string): string {
  return dateFormat.format(new Date(iso));
}
