"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { consultaExportacao, filtroAtivo, nomeArquivo } from "@/lib/admin/arquivo";
import type { Filtro } from "@/lib/admin/modelo";

function nomeDoCabecalho(cabecalho: string | null, reserva: string) {
  const estrela = cabecalho?.match(/filename\*=UTF-8''([^;]+)/);
  if (estrela?.[1]) return decodeURIComponent(estrela[1]);
  const simples = cabecalho?.match(/filename="([^"]+)"/);
  return simples?.[1] ?? reserva;
}

export function BotoesDownload({
  filtro,
  aplicar,
  arquivadas,
}: {
  filtro: Filtro;
  aplicar: boolean;
  arquivadas: boolean;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function baixar(formato: "xlsx" | "csv" | "pdf") {
    setOcupado(formato);
    setErro("");
    try {
      const params = consultaExportacao(formato, filtro, aplicar, arquivadas);
      const resposta = await fetch(`/api/admin/exportar?${params}`, { method: "POST" });
      if (resposta.status === 401) {
        router.push("/admin");
        return;
      }
      if (!resposta.ok) {
        setErro("Não foi possível gerar o arquivo.");
        return;
      }
      const blob = await resposta.blob();
      const nome = nomeDoCabecalho(
        resposta.headers.get("Content-Disposition"),
        nomeArquivo(formato, aplicar && filtroAtivo(filtro)),
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nome;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não foi possível gerar o arquivo.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="adm-linha">
      <button type="button" className="adm-botao" onClick={() => void baixar("xlsx")} disabled={ocupado !== null}>
        {ocupado === "xlsx" ? "Gerando Excel…" : "Baixar Excel"}
      </button>
      <button type="button" className="adm-botao secundario" onClick={() => void baixar("csv")} disabled={ocupado !== null}>
        {ocupado === "csv" ? "Gerando CSV…" : "Baixar CSV"}
      </button>
      <button type="button" className="adm-botao secundario" onClick={() => void baixar("pdf")} disabled={ocupado !== null}>
        {ocupado === "pdf" ? "Gerando PDF…" : "Baixar PDF"}
      </button>
      {erro ? (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
