/** Utilitaires HTML → texte, utilisables côté client ou serveur (sans dépendance lourde). */

export function emailHtmlToPlainSummary(html: string, maxLen = 800): string {
  const collapsed = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (collapsed.length <= maxLen) return collapsed;
  return `${collapsed.slice(0, maxLen)}…`;
}

export function isEmailBodyHtmlEmpty(html: string): boolean {
  const plain = emailHtmlToPlainSummary(html, 50_000);
  return plain.length === 0;
}
