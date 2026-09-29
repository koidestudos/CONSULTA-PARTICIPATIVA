import { useEffect, useRef } from "react";
import { MARCOS, percentual, rotuloEtapa, situacaoMarco } from "@/lib/fluxo";
import type { Etapa } from "@/lib/tipos";

export function BarraProgresso({
  etapa,
  onIr,
}: {
  etapa: Etapa;
  onIr?: (etapa: Etapa) => void;
}) {
  const listaRef = useRef<HTMLOListElement>(null);
  const valor = percentual(etapa);

  useEffect(() => {
    const lista = listaRef.current;
    const destaque = lista?.querySelector<HTMLElement>("[data-destaque='true']");
    if (!lista || !destaque) return;
    const esquerda = destaque.offsetLeft - lista.clientWidth / 2 + destaque.clientWidth / 2;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ left: Math.max(0, esquerda), behavior: reduzir ? "auto" : "smooth" });
  }, [etapa]);

  return (
    <div className="progresso-envolve">
      <nav className="moldura progresso" aria-label="Etapas da consulta">
        <p id="progresso-rotulo" className="progresso-rotulo">
          <strong>{valor}%</strong> concluído · {rotuloEtapa(etapa)}
        </p>
        <div
          className="trilho"
          role="progressbar"
          aria-valuenow={valor}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-labelledby="progresso-rotulo"
        >
          <span style={{ width: `${valor}%` }} />
        </div>
        <ol className="passos" ref={listaRef}>
          {MARCOS.map((marco, indice) => {
            const situacao = situacaoMarco(indice, etapa);
            const destaque =
              situacao === "atual" || (etapa === "aberto" && marco.id === "prioridades");
            const clicavel = situacao === "feito" && Boolean(onIr);
            const classe = `passo ${situacao}`;
            return (
              <li key={marco.id}>
                {clicavel ? (
                  <button
                    type="button"
                    className={classe}
                    data-destaque={destaque ? "true" : undefined}
                    onClick={() => onIr?.(marco.etapa)}
                  >
                    {marco.rotulo}
                  </button>
                ) : (
                  <span
                    className={classe}
                    data-destaque={destaque ? "true" : undefined}
                    aria-current={situacao === "atual" ? "step" : undefined}
                  >
                    {marco.rotulo}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
