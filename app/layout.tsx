import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentos",
  description:
    "Colección de fotos para explorar, ampliar, descargar e imprimir.",
  openGraph: {
    title: "Fotos de Recuerdos · Momentos",
    description:
      "Colección de fotos para explorar, ampliar, descargar e imprimir.",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary",
    title: "Fotos de Recuerdos · Momentos",
    // description: ".",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
