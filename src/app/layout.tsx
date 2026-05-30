import type { Metadata } from "next";
import { Source_Sans_3, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";

// Body: a warm, highly legible humanist sans.
const sourceSans = Source_Sans_3({
  variable: "--font-sans-app",
  subsets: ["latin"],
});

// Headings: a classic literary serif for the "study / library" feel.
const lora = Lora({
  variable: "--font-serif-app",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LibroApp — Tu bitácora de lectura",
  description:
    "Lleva el rastro de tus libros, escribe reseñas, sigue tu progreso y comparte tu perfil lector con la comunidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sourceSans.variable} ${lora.variable} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
