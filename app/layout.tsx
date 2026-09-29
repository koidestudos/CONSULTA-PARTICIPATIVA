import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Consulta Participativa · Plano de Ação CEPMMIF-PI 2027–2028",
  description:
    "Contribua para a construção das ações do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí.",
  applicationName: "Consulta Participativa CEPMMIF-PI",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0f3d5e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="pular" href="#conteudo">
          Ir para o conteúdo
        </a>
        {children}
        <noscript>
          <p className="moldura painel" style={{ padding: 24 }}>
            Ative o JavaScript do navegador para participar da consulta.
          </p>
        </noscript>
      </body>
    </html>
  );
}
