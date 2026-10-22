import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AJ Fisioterapia | Rehabilitación & Bienestar en San Borja",
  description: "Fisioterapia especializada y humana para recuperar tu bienestar en San Borja, Lima. 6 salas de atención, profesionales licenciados y citas personalizadas.",
};

import { AuthProvider } from "@/lib/auth-context";
import { obtenerConfiguracionClinica } from "@/server/actions/configuracion";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await obtenerConfiguracionClinica();
  const colorPrimario = config.colorPrimario || "#0C3E37";
  const colorSecundario = config.colorSecundario || "#E07052";
  const colorAcento = config.colorAcento || "#0D9488";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --brand-primary: ${colorPrimario};
                --brand-secondary: ${colorSecundario};
                --brand-accent: ${colorAcento};
              }
            `,
          }}
        />
        {config.faviconUrl && <link rel="icon" href={config.faviconUrl} />}
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

