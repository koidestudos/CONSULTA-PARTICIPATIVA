import type { Ref } from "react";
import { Icone } from "@/components/Icones";
import { Titulo } from "@/components/Titulo";
import type { Recibo } from "@/lib/tipos";

const formato = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Fortaleza",
});

export function Concluido({
  recibo,
  tituloRef,
}: {
  recibo: Recibo;
  tituloRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="etapa etapa-concluido">
      <div className="selo" aria-hidden="true">
        <Icone nome="check" />
      </div>
      <Titulo tituloRef={tituloRef}>CONTRIBUIÇÃO REGISTRADA!</Titulo>
      <p className="texto">
        Obrigado por participar da construção coletiva do Plano de Ação CEPMMIF-PI 2027–2028.
      </p>
      <p className="texto">
        Suas contribuições serão analisadas e utilizadas na elaboração da proposta do novo Plano de
        Ação.
      </p>
      <p className="recibo">
        Registro anônimo
        <br />
        <span>{recibo.id}</span>
        <br />
        {formato.format(new Date(recibo.enviadoEm))}
      </p>
    </div>
  );
}
