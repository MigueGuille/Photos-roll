import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentos · Recuerdos de graduación",
  description:
    "Una colección de graduación para explorar, ampliar, descargar e imprimir.",
  openGraph: {
    title: "Un día que queda para siempre · Momentos",
    description:
      "Seis fotografías para revivir, compartir y conservar cada instante de la graduación.",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary",
    title: "Un día que queda para siempre · Momentos",
    description: "Una colección íntima de recuerdos de graduación.",
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
