import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Consulta Participativa · Plano de Ação CEPMMIF-PI 2027–2028",
    short_name: "CEPMMIF-PI",
    description:
      "Contribua para a construção das ações do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí.",
    start_url: "/",
    display: "browser",
    background_color: "#f4f7f8",
    theme_color: "#0f3d5e",
    lang: "pt-BR",
    icons: [
      {
        src: "/marca-cepmmif.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
