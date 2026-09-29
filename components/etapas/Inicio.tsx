import type { Ref } from "react";
import { Icone } from "@/components/Icones";
import { Titulo } from "@/components/Titulo";
import { DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4, TEXTO_INICIO } from "@/lib/conteudo";

const CARDS = [
  { numero: "Diretriz 1", titulo: DIRETRIZ_1, icone: "organizacao" as const },
  { numero: "Diretriz 2", titulo: DIRETRIZ_2, icone: "analise" as const },
  { numero: "Diretriz 3", titulo: DIRETRIZ_3, icone: "educacao" as const },
  { numero: "Diretriz 4", titulo: DIRETRIZ_4, icone: "divulgacao" as const },
];

export function Inicio({ tituloRef }: { tituloRef: Ref<HTMLHeadingElement> }) {
  return (
    <div className="etapa">
      <Titulo kicker="Consulta participativa" tituloRef={tituloRef}>
        Construção Participativa do Plano de Ação 2027–2028
      </Titulo>
      <p className="subtitulo">
        Contribua para a construção das ações do Comitê Estadual de Prevenção de Mortalidade
        Materna, Infantil e Fetal do Piauí.
      </p>
      {TEXTO_INICIO.map((paragrafo) => (
        <p key={paragrafo} className="texto">
          {paragrafo}
        </p>
      ))}
      <h2 className="secao">Diretrizes que serão mantidas</h2>
      <div className="grade-diretrizes">
        {CARDS.map((card) => (
          <article key={card.numero} className="mini-diretriz">
            <span className="emblema" aria-hidden="true">
              <Icone nome={card.icone} />
            </span>
            <div>
              <p className="mini-numero">{card.numero}</p>
              <p className="mini-titulo">{card.titulo}</p>
              <p className="selo-mantida">Será mantida</p>
            </div>
          </article>
        ))}
      </div>
      <aside className="anonima">
        <span className="emblema emblema-escudo" aria-hidden="true">
          <Icone nome="escudo" />
        </span>
        <div>
          <p className="kicker">Consulta anônima</p>
          <p>Não é necessário informar nome ou qualquer dado pessoal.</p>
        </div>
      </aside>
    </div>
  );
}
