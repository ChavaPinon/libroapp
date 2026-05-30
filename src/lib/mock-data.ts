import type { ActivityItem, Book, Review, UserBook } from "./types";

// Covers use Open Library's cover API (the real source we'll use in prod).
const cover = (id: number) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;

export const BOOKS: Book[] = [
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    pages: 688,
    coverUrl: cover(11481354),
    genres: ["Ciencia ficción", "Aventura"],
    communityRating: 4.3,
    synopsis:
      "En el desértico planeta Arrakis, único origen de la especia más valiosa del universo, el joven Paul Atreides se ve arrastrado a una guerra por el poder, la religión y la supervivencia.",
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    pages: 328,
    coverUrl: cover(7222246),
    genres: ["Distopía", "Clásico"],
    communityRating: 4.5,
    synopsis:
      "En un futuro totalitario vigilado por el Gran Hermano, Winston Smith intenta conservar su humanidad frente a un régimen que controla incluso el pensamiento.",
  },
  {
    id: "casa-espiritus",
    title: "La Casa de los Espíritus",
    author: "Isabel Allende",
    year: 1982,
    pages: 433,
    coverUrl: cover(8231856),
    genres: ["Realismo mágico", "Familiar"],
    communityRating: 4.4,
    synopsis:
      "La saga de la familia Trueba a lo largo de tres generaciones, entre pasiones, política y lo sobrenatural, en un país latinoamericano convulso.",
  },
  {
    id: "hobbit",
    title: "El Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    pages: 310,
    coverUrl: cover(6979861),
    genres: ["Fantasía", "Aventura"],
    communityRating: 4.6,
    synopsis:
      "Bilbo Bolsón abandona la comodidad de su hogar para acompañar a trece enanos en la búsqueda del tesoro custodiado por el dragón Smaug.",
  },
  {
    id: "cien-anos",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    year: 1967,
    pages: 471,
    coverUrl: cover(8479576),
    genres: ["Realismo mágico", "Clásico"],
    communityRating: 4.7,
    synopsis:
      "La historia de la familia Buendía en el mítico pueblo de Macondo, donde lo extraordinario y lo cotidiano se entrelazan a lo largo de un siglo.",
  },
  {
    id: "name-wind",
    title: "El Nombre del Viento",
    author: "Patrick Rothfuss",
    year: 2007,
    pages: 662,
    coverUrl: cover(8267079),
    genres: ["Fantasía"],
    communityRating: 4.5,
    synopsis:
      "Kvothe, posadero de día y leyenda de noche, narra cómo pasó de niño huérfano a el mago más buscado y temido de su tiempo.",
  },
  {
    id: "fahrenheit",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    year: 1953,
    pages: 256,
    coverUrl: cover(8225261),
    genres: ["Distopía", "Ciencia ficción"],
    communityRating: 4.2,
  },
  {
    id: "principito",
    title: "El Principito",
    author: "Antoine de Saint-Exupéry",
    year: 1943,
    pages: 96,
    coverUrl: cover(10522681),
    genres: ["Fábula", "Clásico"],
    communityRating: 4.6,
  },
];

const byId = (id: string) => BOOKS.find((b) => b.id === id)!;

export const MY_BOOKS: UserBook[] = [
  {
    book: byId("casa-espiritus"),
    status: "reading",
    currentPage: 240,
    startedAt: "2026-05-12",
    tags: ["favoritos-2026"],
  },
  { book: byId("name-wind"), status: "reading", currentPage: 410, startedAt: "2026-05-20" },
  {
    book: byId("dune"),
    status: "read",
    rating: 5,
    startedAt: "2026-01-12",
    finishedAt: "2026-02-03",
  },
  { book: byId("1984"), status: "read", rating: 4.5, finishedAt: "2025-11-18" },
  { book: byId("cien-anos"), status: "read", rating: 5, finishedAt: "2025-09-02" },
  { book: byId("principito"), status: "read", rating: 4, finishedAt: "2025-08-15" },
  { book: byId("hobbit"), status: "want" },
  { book: byId("fahrenheit"), status: "want" },
];

const u = (username: string, name: string, avatarColor: string) => ({
  username,
  name,
  avatarColor,
});

export const FEED: ActivityItem[] = [
  {
    id: "a1",
    user: u("ana", "Ana Rivera", "#7c3aed"),
    type: "reviewed",
    book: { id: "dune", title: "Dune", coverUrl: byId("dune").coverUrl },
    rating: 5,
    snippet: "Una obra maestra del worldbuilding. La política de Arrakis te atrapa por completo.",
    at: "hace 2 h",
  },
  {
    id: "a2",
    user: u("luis", "Luis Mora", "#0ea5e9"),
    type: "started",
    book: { id: "1984", title: "1984", coverUrl: byId("1984").coverUrl },
    at: "hace 5 h",
  },
  {
    id: "a3",
    user: u("sofia", "Sofía Lara", "#16a34a"),
    type: "finished",
    book: { id: "hobbit", title: "El Hobbit", coverUrl: byId("hobbit").coverUrl },
    rating: 4.5,
    at: "ayer",
  },
  {
    id: "a4",
    user: u("diego", "Diego Paz", "#c2703d"),
    type: "rated",
    book: { id: "fahrenheit", title: "Fahrenheit 451", coverUrl: byId("fahrenheit").coverUrl },
    rating: 4,
    at: "ayer",
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    user: u("ana", "Ana Rivera", "#7c3aed"),
    book: { id: "dune", title: "Dune", author: "Frank Herbert", coverUrl: byId("dune").coverUrl },
    rating: 5,
    body: "Releí Dune por tercera vez y sigue revelando capas nuevas. La construcción ecológica de Arrakis y la crítica al mesianismo son brutales.",
    likes: 42,
    comments: 8,
    createdAt: "hace 2 h",
  },
  {
    id: "r2",
    user: u("salvador", "Salvador P.", "#a855f7"),
    book: { id: "cien-anos", title: "Cien años de soledad", author: "Gabriel García Márquez", coverUrl: byId("cien-anos").coverUrl },
    rating: 5,
    body: "No hay nada como perderse en Macondo. García Márquez convierte lo imposible en cotidiano con una prosa que hipnotiza.",
    likes: 31,
    comments: 5,
    createdAt: "hace 3 d",
  },
  {
    id: "r3",
    user: u("sofia", "Sofía Lara", "#16a34a"),
    book: { id: "hobbit", title: "El Hobbit", author: "J.R.R. Tolkien", coverUrl: byId("hobbit").coverUrl },
    rating: 4.5,
    body: "La aventura perfecta para reconectar con la lectura. El final con Smaug me dejó sin aliento.",
    hasSpoilers: true,
    likes: 18,
    comments: 2,
    createdAt: "ayer",
  },
];

// Profile-level stats for the public profile + stats page.
export const PROFILE = {
  username: "salvador",
  name: "Salvador P.",
  avatarColor: "#a855f7",
  bio: "Sci-fi y fantasía. Reseño todo lo que leo. Coleccionista de mundos imposibles.",
  followers: 56,
  following: 38,
  streakDays: 23,
  booksThisYear: 12,
  avgRating: 4.3,
  pagesThisYear: 38120,
  challengeGoal: 30,
};
