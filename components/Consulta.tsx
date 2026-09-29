"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BarraProgresso } from "@/components/BarraProgresso";
import { Cabecalho } from "@/components/Cabecalho";
import { Aberto } from "@/components/etapas/Aberto";
import { ComoParticipar } from "@/components/etapas/ComoParticipar";
import { Concluido } from "@/components/etapas/Concluido";
import { Diretriz } from "@/components/etapas/Diretriz";
import { Inicio } from "@/components/etapas/Inicio";
import { Prioridades } from "@/components/etapas/Prioridades";
import { Revisao } from "@/components/etapas/Revisao";
import { etapaAnterior, etapaSeguinte, rotuloEtapa } from "@/lib/fluxo";
import { criarEstado, gravarRascunho, lerRascunho, limparRascunho } from "@/lib/rascunho";
import type { AlterarEstado, Estado, Etapa, Recibo } from "@/lib/tipos";
import { dadosDoEstado, ID_RESERVADO, validarDados, validarEtapa } from "@/lib/validacao";

function semInscricao() {
  return () => {};
}

export function Consulta() {
  const noCliente = useSyncExternalStore(semInscricao, () => true, () => false);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const alertaRef = useRef<HTMLParagraphElement>(null);

  if (noCliente && !pronto) {
    const salvo = lerRascunho();
    if (salvo?.recibo) {
      setRecibo(salvo.recibo);
      setEstado({ ...criarEstado(salvo.recibo.id), etapa: "concluido" });
    } else if (salvo?.estado) {
      setEstado(
        salvo.estado.id && salvo.estado.id !== ID_RESERVADO
          ? salvo.estado
          : { ...salvo.estado, id: crypto.randomUUID() },
      );
    } else {
      setEstado(criarEstado());
    }
    setPronto(true);
  }

  useEffect(() => {
    if (!pronto || !estado) return;
    gravarRascunho(estado, recibo);
  }, [pronto, estado, recibo]);

  const etapaAtual = estado?.etapa;

  useEffect(() => {
    if (!pronto || !etapaAtual) return;
    document.title = `${rotuloEtapa(etapaAtual)} · Consulta Participativa CEPMMIF-PI`;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [pronto, etapaAtual]);

  useEffect(() => {
    if (erro) alertaRef.current?.focus();
  }, [erro]);

  const alterar: AlterarEstado = (atualizar) => {
    setErro(null);
    setEstado((atual) => (atual ? atualizar(atual) : atual));
  };

  function irPara(etapa: Etapa) {
    setErro(null);
    setEstado((atual) =>
      atual
        ? {
            ...atual,
            etapa,
            retornoRevisao: atual.etapa === "revisao" ? true : atual.retornoRevisao,
          }
        : atual,
    );
  }

  function voltar() {
    if (!estado) return;
    setErro(null);
    const destino = etapaAnterior(estado.etapa);
    if (destino) setEstado((atual) => (atual ? { ...atual, etapa: destino } : atual));
  }

  async function enviar() {
    if (!estado) return;
    const id = estado.id === ID_RESERVADO ? crypto.randomUUID() : estado.id;
    const base = id === estado.id ? estado : { ...estado, id };
    if (base !== estado) setEstado(base);
    const resultado = validarDados(dadosDoEstado(base));
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/contribuicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado.dados),
      });
      const json = (await resposta.json().catch(() => null)) as
        | { id?: string; enviadoEm?: string; erro?: string }
        | null;
      if (!resposta.ok || !json?.id || !json.enviadoEm) {
        setErro(
          json?.erro ||
            "Não foi possível registrar a contribuição agora. Suas respostas continuam neste aparelho. Tente novamente.",
        );
        return;
      }
      setRecibo({ id: json.id, enviadoEm: json.enviadoEm });
      setEstado((atual) =>
        atual ? { ...atual, id: json.id ?? atual.id, etapa: "concluido" } : atual,
      );
    } catch {
      setErro(
        "Não foi possível registrar a contribuição agora. Suas respostas continuam neste aparelho. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function avancar() {
    if (!estado) return;
    if (estado.etapa === "concluido") {
      const novo = criarEstado();
      setRecibo(null);
      setErro(null);
      limparRascunho();
      setEstado(novo);
      return;
    }
    if (estado.etapa === "revisao") {
      void enviar();
      return;
    }
    const mensagem = validarEtapa(estado.etapa, estado);
    if (mensagem) {
      setErro(mensagem);
      return;
    }
    setErro(null);
    if (estado.retornoRevisao) {
      setEstado((atual) => (atual ? { ...atual, etapa: "revisao", retornoRevisao: false } : atual));
      return;
    }
    const proxima = etapaSeguinte(estado.etapa);
    if (proxima) setEstado((atual) => (atual ? { ...atual, etapa: proxima } : atual));
  }

  if (!pronto || !estado) {
    return (
      <>
        <Cabecalho />
        <main id="conteudo" className="moldura conteudo-consulta">
          <article className="painel" aria-busy="true">
            <div className="painel-corpo">
              <p className="carregando">Carregando a consulta…</p>
            </div>
          </article>
        </main>
      </>
    );
  }

  const rotuloPrimario = (() => {
    if (enviando) return "Enviando…";
    if (estado.etapa === "concluido") return "FINALIZAR";
    if (estado.etapa === "revisao") return "ENVIAR CONTRIBUIÇÃO";
    if (estado.retornoRevisao) return "VOLTAR À REVISÃO";
    if (estado.etapa === "inicio") return "PARTICIPAR DA CONSULTA";
    if (estado.etapa === "como") return "COMEÇAR";
    return "Continuar";
  })();

  const mostrarVoltar = estado.etapa !== "inicio" && estado.etapa !== "concluido";
  const classePrimario =
    estado.etapa === "revisao" || estado.etapa === "concluido" ? "btn btn-enviar" : "btn btn-primario";

  return (
    <>
      <Cabecalho />
      <BarraProgresso etapa={estado.etapa} onIr={estado.etapa === "concluido" ? undefined : irPara} />
      <main
        id="conteudo"
        tabIndex={-1}
        className={[
          "moldura",
          "conteudo-consulta",
          estado.etapa === "prioridades" ? "com-contador" : "",
          erro ? "com-alerta" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <article className="painel">
          <div className="painel-corpo">
            {estado.etapa === "inicio" ? <Inicio tituloRef={tituloRef} /> : null}
            {estado.etapa === "como" ? <ComoParticipar tituloRef={tituloRef} /> : null}
            {estado.etapa === "d1" || estado.etapa === "d2" || estado.etapa === "d3" || estado.etapa === "d4" ? (
              <Diretriz codigo={estado.etapa} estado={estado} alterar={alterar} tituloRef={tituloRef} />
            ) : null}
            {estado.etapa === "prioridades" ? (
              <Prioridades estado={estado} alterar={alterar} tituloRef={tituloRef} />
            ) : null}
            {estado.etapa === "aberto" ? (
              <Aberto estado={estado} alterar={alterar} tituloRef={tituloRef} />
            ) : null}
            {estado.etapa === "revisao" ? (
              <Revisao estado={estado} onEditar={irPara} tituloRef={tituloRef} />
            ) : null}
            {estado.etapa === "concluido" && recibo ? (
              <Concluido recibo={recibo} tituloRef={tituloRef} />
            ) : null}
            <p className="nota-rodape">
              Consulta anônima. Nenhuma informação pessoal é solicitada ou armazenada.
              <span> CEPMMIF-PI · Plano de Ação 2027–2028</span>
            </p>
          </div>
        </article>
      </main>
      <div className="barra-acoes">
        <div className="moldura">
          {estado.etapa === "prioridades" ? (
            <p className={estado.prioridades.length === 3 ? "contador pronto" : "contador"} aria-live="polite">
              {estado.prioridades.length} de 3 prioridades selecionadas
            </p>
          ) : null}
          {erro ? (
            <p ref={alertaRef} tabIndex={-1} role="alert" className="alerta">
              {erro}
            </p>
          ) : null}
          <div className="botoes">
            {mostrarVoltar ? (
              <button type="button" className="btn btn-secundario" onClick={voltar}>
                {estado.etapa === "revisao" ? "VOLTAR E EDITAR" : "Voltar"}
              </button>
            ) : null}
            <button
              type="button"
              className={classePrimario}
              onClick={avancar}
              disabled={enviando}
            >
              {rotuloPrimario}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
