"use client";

import { useState } from "react";
import { BotoesDownload } from "@/components/admin/BotoesDownload";
import { Filtros } from "@/components/admin/Filtros";
import { useFiltroConsulta } from "@/components/admin/useFiltro";
import { nomeArquivo } from "@/lib/admin/arquivo";

export function Exportacoes() {
  const { filtro, arquivadas, atualizar, definirArquivadas, limpar } = useFiltroConsulta();
  const [somenteFiltradas, setSomenteFiltradas] = useState(true);
  const nome = nomeArquivo("xlsx", false);

  return (
    <section className="adm-painel">
      <h2>Exportações</h2>
      <p className="adm-nota">
        O Excel organiza uma linha por marcação ou texto, para análise posterior. O arquivo completo se chama {nome}.
        Quando o filtro está ativo, o nome recebe o sufixo _filtrado. A coluna Participante permanece “Não identificado”.
      </p>
      <Filtros
        filtro={filtro}
        arquivadas={arquivadas}
        atualizar={atualizar}
        definirArquivadas={definirArquivadas}
        limpar={limpar}
      />
      <label className="adm-check">
        <input
          type="checkbox"
          checked={somenteFiltradas}
          onChange={(evento) => setSomenteFiltradas(evento.target.checked)}
        />
        Exportar somente respostas filtradas
      </label>
      <p className="adm-nota">
        Desmarque para baixar todas as contribuições vigentes, ignorando tema, ação, prioridade, data e texto.
      </p>
      <BotoesDownload filtro={filtro} aplicar={somenteFiltradas} arquivadas={arquivadas && somenteFiltradas} />
    </section>
  );
}
