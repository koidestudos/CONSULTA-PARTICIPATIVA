"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BotaoTelao } from "@/components/admin/BotaoTelao";
import { usePainel } from "@/components/admin/Painel";
import { ativas, formatarDataHora, resumir } from "@/lib/admin/modelo";

export function Dashboard() {
  const { contribuicoes, totalMembros, carregando, erro, recarregar } = usePainel();
  const resumo = useMemo(() => resumir(contribuicoes, totalMembros), [contribuicoes, totalMembros]);
  const retiradas = contribuicoes.length - ativas(contribuicoes).length;

  return (
    <>
      {erro ? (
        <p className="adm-erro" role="alert">
          {erro}{" "}
          <button type="button" className="adm-botao secundario" onClick={() => void recarregar()}>
            Tentar de novo
          </button>
        </p>
      ) : null}
      <section className="adm-chamada">
        <div className="adm-linha">
          <div>
            <h2>Reunião do Comitê</h2>
            <p>Abra a apresentação em outra aba, coloque o navegador em tela cheia e use as setas do teclado.</p>
          </div>
          <BotaoTelao grande />
        </div>
      </section>
      <section className="adm-cards" aria-busy={carregando}>
        <article className="adm-card">
          <span>Total de participantes</span>
          <strong>{carregando ? "…" : resumo.participantes}</strong>
          <small>Contribuições anônimas concluídas.</small>
        </article>
        <article className="adm-card">
          <span>Total de respostas</span>
          <strong>{carregando ? "…" : resumo.respostas}</strong>
          <small>Marcações e textos recebidos.</small>
        </article>
        <article className="adm-card">
          <span>Total de respostas concluídas</span>
          <strong>{carregando ? "…" : resumo.concluidas}</strong>
          <small>Envios concluídos pelo formulário público.</small>
        </article>
        <article className="adm-card">
          <span>Total de respostas pendentes</span>
          <strong>{carregando ? "…" : resumo.pendentes}</strong>
          <small>Rascunhos ficam no aparelho de quem participa e não chegam ao painel.</small>
        </article>
        <article className="adm-card">
          <span>Percentual de participação</span>
          <strong>{carregando ? "…" : resumo.percentual === null ? "—" : `${resumo.percentual}%`}</strong>
          <small>
            {totalMembros
              ? `Sobre ${totalMembros} membros informados em Configurações.`
              : "Informe o total de membros em Configurações para calcular."}
          </small>
        </article>
        <article className="adm-card">
          <span>Quantidade de ações avaliadas</span>
          <strong>{carregando ? "…" : resumo.acoesAvaliadas}</strong>
          <small>Ações, temas ou formatos com ao menos uma marcação.</small>
        </article>
      </section>
      <section className="adm-painel">
        <h2>Última resposta recebida</h2>
        <p>{carregando ? "Carregando…" : formatarDataHora(resumo.ultimaResposta)}</p>
        <p className="adm-nota">
          A consulta não pede nome nem outro dado pessoal. As prioridades são as 3 ações escolhidas ao final, sem escala
          alta, média ou baixa.
          {retiradas > 0 ? ` ${retiradas} contribuição(ões) foram retiradas das contagens e continuam guardadas.` : ""}
        </p>
        <div className="adm-linha">
          <Link className="adm-botao secundario" href="/admin/respostas">
            Ver respostas
          </Link>
          <Link className="adm-botao secundario" href="/admin/exportacoes">
            Baixar planilha
          </Link>
        </div>
      </section>
    </>
  );
}
