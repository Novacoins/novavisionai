/**
 * Per-route head metadata helper. Produces title, description, canonical,
 * og:title / og:description / og:url with sensible defaults for Nova Vision AI.
 */
const BASE_URL = "https://novavisionai.lovable.app";

export function pageHead(opts: {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
}) {
  const { path, title, description, ogType = "website" } = opts;
  const url = `${BASE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: ogType },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
