"use client";

import { useMemo } from "react";
import { usePainel } from "@/components/admin/Painel";
import { DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4 } from "@/lib/conteudo";
import { ativas, linhasDaContribuicao, percentualDe, resumir, type ContagemAcao } from "@/lib/admin/modelo";

const DIRETRIZES = [DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4];

function Barra({
  rotulo,
  valor,
  maximo,
  detalhe,
  verde = false,
}: {
  rotulo: string;
  valor: number;
  maximo: number;
  detalhe: string;
  verde?: boolean;
}) {
  const largura = maximo <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((valor / maximo) * 100)));
  return (
    <div className="adm-barra">
      <div className="adm-barra-topo">
        <span>{rotulo}</span>
        <strong>{detalhe}</strong>
      </div>
      <div className={verde ? "adm-trilho verde" : "adm-trilho"} role="img" aria-label={`${rotulo}: ${detalhe}`}>
        <span style={{ width: `${largura}%` }} />
      </div>
    </div>
  );
}

function topo(lista: ContagemAcao[], campo: "selecionada" | "priorizada") {
  return [...lista]
    .filter((item) => item[campo] > 0)
    .sort((a, b) => b[campo] - a[campo] || b.selecionada - a.selecionada)
    .slice(0, 8);
}

export function Analises() {
  const { contribuicoes, totalMembros, carregando, erro } = usePainel();
  const quadro = useMemo(() => {
    const vigentes = ativas(contribuicoes);
    const resumo = resumir(vigentes, totalMembros);
    const temas = ["Prioridades", "Espaço aberto", ...DIRETRIZES].map((tema) => {
      const linhas = vigentes.flatMap(linhasDaContribuicao).filter((linha) => linha.tema === tema);
      const pessoas = new Set(linhas.map((linha) => linha.id)).size;
      return { tema, linhas: linhas.length, pessoas, percentual: percentualDe(pessoas, vigentes.length) };
    });
    const escolhas = vigentes.flatMap((item) => item.prioridades);
    const prioridades = DIRETRIZES.map((diretriz) => ({
      diretriz,
      quantidade: escolhas.filter((item) => item.startsWith(`${diretriz} —`)).length,
    }));
    return { vigentes: vigentes.length, temas, prioridades, contagens: resumo.contagens };
  }, [contribuicoes, totalMembros]);

  const citadas = topo(quadro.contagens, "selecionada");
  const prioritarias = topo(quadro.contagens, "priorizada");
  const maxTema = Math.max(1, ...quadro.temas.map((item) => item.pessoas));
  const maxAcao = Math.max(1, ...citadas.map((item) => item.selecionada));
  const maxPrioridade = Math.max(1, ...quadro.prioridades.map((item) => item.quantidade), ...prioritarias.map((item) => item.priorizada));

  return (
    <section className="adm-painel">
      <h2>Análise das contribuições</h2>
      <p className="adm-nota">
        Os gráficos contam as marcações reais. Não há resumo automático dos textos e não há escala alta, média ou baixa.
      </p>
      {erro ? (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      ) : null}
      {carregando ? <p>Carregando os gráficos…</p> : null}
      {!carregando && quadro.vigentes === 0 ? <p>Ainda não há contribuições para analisar.</p> : null}

      <div className="adm-duas">
        <article>
          <h3>Participação por tema</h3>
          <div className="adm-barras">
            {quadro.temas.map((item) => (
              <Barra
                key={item.tema}
                rotulo={item.tema}
                valor={item.pessoas}
                maximo={maxTema}
                detalhe={`${item.pessoas} contribuições · ${item.linhas} linhas`}
              />
            ))}
          </div>
        </article>
        <article>
          <h3>Percentual de participação por tema</h3>
          <div className="adm-barras">
            {quadro.temas.map((item) => (
              <Barra
                key={item.tema}
                rotulo={item.tema}
                valor={item.percentual}
                maximo={100}
                detalhe={`${item.percentual}%`}
                verde
              />
            ))}
          </div>
        </article>
      </div>

      <article>
        <h3>Quantidade de respostas por ação</h3>
        <p className="adm-nota">Ações mais citadas, pelas marcações recebidas.</p>
        {citadas.length === 0 ? (
          <p>Ainda não há marcações.</p>
        ) : (
          <div className="adm-barras">
            {citadas.map((item) => (
              <Barra
                key={`${item.diretriz}-${item.grupo}-${item.acao}`}
                rotulo={item.acao}
                valor={item.selecionada}
                maximo={maxAcao}
                detalhe={`${item.selecionada} marcações`}
              />
            ))}
          </div>
        )}
      </article>

      <div className="adm-duas">
        <article>
          <h3>Distribuição das prioridades</h3>
          <p className="adm-nota">Cada contribuição escolhe 3 ações. O gráfico mostra em qual diretriz essas escolhas caíram.</p>
          <div className="adm-barras">
            {quadro.prioridades.map((item) => (
              <Barra
                key={item.diretriz}
                rotulo={item.diretriz}
                valor={item.quantidade}
                maximo={maxPrioridade}
                detalhe={`${item.quantidade} escolhas · ${percentualDe(item.quantidade, quadro.vigentes * 3)}%`}
                verde
              />
            ))}
          </div>
        </article>
        <article>
          <h3>Ações com maior prioridade</h3>
          <div className="adm-barras">
            {prioritarias.length === 0 ? <p>Nenhuma ação foi escolhida entre as 3 prioridades.</p> : null}
            {prioritarias.map((item) => (
              <Barra
                key={`${item.grupo}-${item.acao}`}
                rotulo={item.acao}
                valor={item.priorizada}
                maximo={maxPrioridade}
                detalhe={`${item.priorizada} · ${percentualDe(item.priorizada, quadro.vigentes)}%`}
                verde
              />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
