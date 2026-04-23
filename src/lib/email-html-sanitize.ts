import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

/** Côté serveur uniquement (dépend de sanitize-html). */
export function sanitizeEmailBodyHtml(dirty: string): string {
  return sanitizeHtml(dirty, SANITIZE_OPTIONS);
}
