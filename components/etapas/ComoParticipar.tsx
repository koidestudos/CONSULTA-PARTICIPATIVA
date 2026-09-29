import type { Ref } from "react";
import { Titulo } from "@/components/Titulo";
import { PASSOS_PARTICIPACAO, TEXTO_COMO } from "@/lib/conteudo";

export function ComoParticipar({ tituloRef }: { tituloRef: Ref<HTMLHeadingElement> }) {
  return (
    <div className="etapa">
      <Titulo kicker="Antes de começar" tituloRef={tituloRef}>
        Como participar?
      </Titulo>
      <ol className="passos-como">
        {PASSOS_PARTICIPACAO.map((passo, indice) => (
          <li key={passo}>
            <span aria-hidden="true">{indice + 1}</span>
            <p>{passo}</p>
          </li>
        ))}
      </ol>
      <blockquote>{TEXTO_COMO}</blockquote>
    </div>
  );
}
