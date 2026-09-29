import type { Ref } from "react";
import { AvisoPrivacidade, CampoTexto } from "@/components/CampoTexto";
import { CampoOpcoes } from "@/components/CampoOpcoes";
import { Icone } from "@/components/Icones";
import { Titulo } from "@/components/Titulo";
import {
  DIRETRIZ_3,
  DIRETRIZ_3_TEXTO,
  DIRETRIZES,
  FORMATOS_D3,
  SUGESTAO_D3,
  TEMAS_D3,
} from "@/lib/conteudo";
import type { AlterarEstado, Estado } from "@/lib/tipos";

function paraOpcoes(opcoes: readonly string[]) {
  return opcoes.map((opcao) => ({ valor: opcao, rotulo: opcao }));
}

function contagemTema(quantidade: number) {
  if (quantidade === 0) return "Nenhum tema selecionado";
  if (quantidade === 1) return "1 tema selecionado";
  return `${quantidade} temas selecionados`;
}

function contagemFormato(quantidade: number) {
  if (quantidade === 0) return "Nenhum formato selecionado";
  if (quantidade === 1) return "1 formato selecionado";
  return `${quantidade} formatos selecionados`;
}

export function Diretriz({
  codigo,
  estado,
  alterar,
  tituloRef,
}: {
  codigo: "d1" | "d2" | "d3" | "d4";
  estado: Estado;
  alterar: AlterarEstado;
  tituloRef: Ref<HTMLHeadingElement>;
}) {
  if (codigo === "d3") {
    return (
      <div className="etapa">
        <span className="emblema" aria-hidden="true">
          <Icone nome="educacao" />
        </span>
        <Titulo kicker="Diretriz 3" tituloRef={tituloRef}>
          {DIRETRIZ_3}
        </Titulo>
        <p className="intro">{DIRETRIZ_3_TEXTO}</p>
        <CampoOpcoes
          nome="temas-d3"
          legenda="Quais temas devem ser priorizados?"
          opcoes={paraOpcoes(TEMAS_D3)}
          selecionadas={estado.d3.temas}
          onChange={(temas) => alterar((atual) => ({ ...atual, d3: { ...atual.d3, temas } }))}
          rotuloOutra="Outro"
          valorOutra={estado.d3.outroTema}
          onChangeOutra={(outroTema) =>
            alterar((atual) => ({ ...atual, d3: { ...atual.d3, outroTema } }))
          }
          perguntaOutra="Qual?"
          contagem={contagemTema}
        />
        <CampoOpcoes
          nome="formatos-d3"
          legenda="Quais formatos de qualificação você considera mais adequados?"
          opcoes={paraOpcoes(FORMATOS_D3)}
          selecionadas={estado.d3.formatos}
          onChange={(formatos) => alterar((atual) => ({ ...atual, d3: { ...atual.d3, formatos } }))}
          rotuloOutra="Outro"
          valorOutra={estado.d3.outroFormato}
          onChangeOutra={(outroFormato) =>
            alterar((atual) => ({ ...atual, d3: { ...atual.d3, outroFormato } }))
          }
          perguntaOutra="Qual?"
          contagem={contagemFormato}
        />
        <AvisoPrivacidade />
        <CampoTexto
          id="sugestao-d3"
          rotulo={SUGESTAO_D3}
          valor={estado.d3.sugestao}
          onChange={(sugestao) => alterar((atual) => ({ ...atual, d3: { ...atual.d3, sugestao } }))}
          linhas={6}
        />
      </div>
    );
  }

  const conteudo = DIRETRIZES.find((item) => item.id === codigo);
  if (!conteudo) return null;
  const bloco = estado[codigo];

  return (
    <div className="etapa">
      <span className="emblema" aria-hidden="true">
        <Icone nome={conteudo.icone} />
      </span>
      <Titulo kicker={conteudo.numero} tituloRef={tituloRef}>
        {conteudo.titulo}
      </Titulo>
      <p className="intro">{conteudo.texto}</p>
      <CampoOpcoes
        nome={`acoes-${codigo}`}
        legenda={conteudo.pergunta}
        opcoes={paraOpcoes(conteudo.opcoes)}
        selecionadas={bloco.acoes}
        onChange={(acoes) => alterar((atual) => ({ ...atual, [codigo]: { ...atual[codigo], acoes } }))}
        rotuloOutra={conteudo.outra}
        valorOutra={bloco.outra}
        onChangeOutra={(outra) =>
          alterar((atual) => ({ ...atual, [codigo]: { ...atual[codigo], outra } }))
        }
        perguntaOutra="Qual?"
      />
      <AvisoPrivacidade />
      <CampoTexto
        id={`sugestao-${codigo}`}
        rotulo={conteudo.sugestao}
        valor={bloco.sugestao}
        onChange={(sugestao) =>
          alterar((atual) => ({ ...atual, [codigo]: { ...atual[codigo], sugestao } }))
        }
        linhas={6}
      />
    </div>
  );
}
