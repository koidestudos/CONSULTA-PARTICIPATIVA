import type { Ref } from "react";
import { CampoOpcoes } from "@/components/CampoOpcoes";
import { AvisoPrivacidade, CampoTexto } from "@/components/CampoTexto";
import { Titulo } from "@/components/Titulo";
import { GRUPOS_PRIORIDADE, TEXTO_PRIORIDADES } from "@/lib/conteudo";
import type { AlterarEstado, Estado } from "@/lib/tipos";

export function Prioridades({
  estado,
  alterar,
  tituloRef,
}: {
  estado: Estado;
  alterar: AlterarEstado;
  tituloRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="etapa">
      <Titulo kicker="Visão do conjunto" tituloRef={tituloRef}>
        PRIORIDADES PARA 2027–2028
      </Titulo>
      <p className="intro">{TEXTO_PRIORIDADES}</p>
      <nav className="atalhos" aria-label="Ir para uma diretriz">
        {GRUPOS_PRIORIDADE.map((grupo) => (
          <button
            key={grupo.id}
            type="button"
            onClick={() => {
              const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById(`grupo-${grupo.id}`)?.scrollIntoView({
                behavior: reduzir ? "auto" : "smooth",
                block: "start",
              });
            }}
          >
            {grupo.atalho}
          </button>
        ))}
      </nav>
      {estado.prioridades.length === 3 ? (
        <p className="nota-limite">Você já escolheu 3 prioridades. Desmarque uma para trocar.</p>
      ) : null}
      {GRUPOS_PRIORIDADE.map((grupo) => (
        <section key={grupo.id} id={`grupo-${grupo.id}`} className="grupo-prioridade">
          {grupo.secoes.some((secao) => secao.titulo) ? <h2>{grupo.diretriz}</h2> : null}
          {grupo.secoes.map((secao) => (
            <CampoOpcoes
              key={secao.titulo ?? grupo.id}
              nome={`prioridade-${grupo.id}-${secao.titulo ?? "acoes"}`}
              legenda={secao.titulo ?? grupo.diretriz}
              opcoes={secao.itens}
              selecionadas={estado.prioridades}
              onChange={(prioridades) => alterar((atual) => ({ ...atual, prioridades }))}
              maximo={3}
              enumerar
            />
          ))}
        </section>
      ))}
      <AvisoPrivacidade />
      <CampoTexto
        id="motivo-prioridades"
        rotulo="Por que essas três ações são prioritárias?"
        valor={estado.motivoPrioridades}
        onChange={(motivoPrioridades) => alterar((atual) => ({ ...atual, motivoPrioridades }))}
        linhas={5}
      />
    </div>
  );
}
