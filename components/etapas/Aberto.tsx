import type { Ref } from "react";
import { AvisoPrivacidade, CampoTexto } from "@/components/CampoTexto";
import { Titulo } from "@/components/Titulo";
import { PERGUNTAS_ABERTO } from "@/lib/conteudo";
import type { AlterarEstado, Estado } from "@/lib/tipos";

export function Aberto({
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
      <Titulo kicker="Contribuição final" tituloRef={tituloRef}>
        ESPAÇO ABERTO
      </Titulo>
      <AvisoPrivacidade />
      <CampoTexto
        id="mudanca-unica"
        rotulo={PERGUNTAS_ABERTO.mudanca}
        valor={estado.mudancaUnica}
        onChange={(mudancaUnica) => alterar((atual) => ({ ...atual, mudancaUnica }))}
        linhas={6}
      />
      <CampoTexto
        id="manter-ampliar"
        rotulo={PERGUNTAS_ABERTO.manter}
        valor={estado.manterOuAmpliar}
        onChange={(manterOuAmpliar) => alterar((atual) => ({ ...atual, manterOuAmpliar }))}
        linhas={5}
      />
      <CampoTexto
        id="revisar-encerrar"
        rotulo={PERGUNTAS_ABERTO.revisar}
        valor={estado.revisarOuEncerrar}
        onChange={(revisarOuEncerrar) => alterar((atual) => ({ ...atual, revisarOuEncerrar }))}
        linhas={5}
      />
    </div>
  );
}
