import type { Filtro } from "@/lib/admin/modelo";

export function nomeArquivo(formato: "xlsx" | "csv" | "pdf", filtrado: boolean) {
  const sufixo = filtrado ? "_filtrado" : "";
  return `Consulta_Participativa_CEPMMIF_2027_2028${sufixo}.${formato}`;
}

export function filtroAtivo(filtro: Filtro) {
  return Object.values(filtro).some((valor) => valor.trim() !== "");
}

export function consultaExportacao(
  formato: "xlsx" | "csv" | "pdf",
  filtro: Filtro,
  aplicar: boolean,
  arquivadas: boolean,
) {
  const params = new URLSearchParams({ formato, aplicar: aplicar ? "1" : "0" });
  if (aplicar) {
    for (const [chave, valor] of Object.entries(filtro)) {
      if (valor.trim()) params.set(chave, valor);
    }
  }
  if (arquivadas) params.set("arquivadas", "1");
  return params;
}
