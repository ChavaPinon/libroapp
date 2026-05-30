// Open Library integration. Free, no API key. We normalize their search docs
// into our own shape so the UI and DB stay decoupled from their schema.

export type OpenLibraryBook = {
  externalId: string; // work key, e.g. "/works/OL893415W"
  title: string;
  author: string;
  year?: number;
  pages?: number;
  coverUrl?: string;
  genres: string[];
};

type RawDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
};

const FIELDS =
  "key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject";

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "L") {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function normalize(doc: RawDoc): OpenLibraryBook {
  return {
    externalId: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Autor desconocido",
    year: doc.first_publish_year,
    pages: doc.number_of_pages_median,
    coverUrl: doc.cover_i ? coverUrl(doc.cover_i) : undefined,
    // Keep a few subjects as "genres" (Open Library has hundreds; trim noise).
    genres: (doc.subject ?? []).slice(0, 3),
  };
}

/** Search Open Library and return normalized results. */
export async function searchBooks(query: string, limit = 20): Promise<OpenLibraryBook[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    q
  )}&limit=${limit}&fields=${FIELDS}`;

  const res = await fetch(url, {
    // Cache popular searches for an hour at the edge.
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { docs?: RawDoc[] };
  return (data.docs ?? []).filter((d) => d.title && d.key).map(normalize);
}
