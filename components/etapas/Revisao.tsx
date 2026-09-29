import type { ReactNode, Ref } from "react";
import { Titulo } from "@/components/Titulo";
import { descreverPrioridade, DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4 } from "@/lib/conteudo";
import type { Estado, Etapa } from "@/lib/tipos";

function Lista({ itens }: { itens: string[] }) {
  if (itens.length === 0) return <p className="vazio">Não informado</p>;
  return (
    <ul className="chips">
      {itens.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Texto({ valor }: { valor: string }) {
  const limpo = valor.trim();
  if (!limpo) return <p className="vazio">Não informado</p>;
  return <p className="texto-revisao">{limpo}</p>;
}

function comComplemento(acoes: string[], complemento: string, rotulo: string) {
  const texto = complemento.trim();
  return acoes.map((acao) => (acao === rotulo && texto ? `${rotulo}: ${texto}` : acao));
}

function Secao({
  titulo,
  etapa,
  onEditar,
  children,
}: {
  titulo: string;
  etapa: Etapa;
  onEditar: (etapa: Etapa) => void;
  children: ReactNode;
}) {
  return (
    <section className="resumo">
      <div className="resumo-topo">
        <h2>{titulo}</h2>
        <button type="button" onClick={() => onEditar(etapa)}>
          Editar
        </button>
      </div>
      {children}
    </section>
  );
}

export function Revisao({
  estado,
  onEditar,
  tituloRef,
}: {
  estado: Estado;
  onEditar: (etapa: Etapa) => void;
  tituloRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="etapa">
      <Titulo kicker="Antes do envio" tituloRef={tituloRef}>
        REVISE SUA CONTRIBUIÇÃO
      </Titulo>
      <p className="texto">Confira o que será registrado. A contribuição continua anônima.</p>
      <Secao titulo={`Diretriz 1 · ${DIRETRIZ_1}`} etapa="d1" onEditar={onEditar}>
        <Lista itens={comComplemento(estado.d1.acoes, estado.d1.outra, "Outra")} />
        <Texto valor={estado.d1.sugestao} />
      </Secao>
      <Secao titulo={`Diretriz 2 · ${DIRETRIZ_2}`} etapa="d2" onEditar={onEditar}>
        <Lista itens={comComplemento(estado.d2.acoes, estado.d2.outra, "Outra")} />
        <Texto valor={estado.d2.sugestao} />
      </Secao>
      <Secao titulo={`Diretriz 3 · ${DIRETRIZ_3}`} etapa="d3" onEditar={onEditar}>
        <h3>Temas</h3>
        <Lista itens={comComplemento(estado.d3.temas, estado.d3.outroTema, "Outro")} />
        <h3>Formatos</h3>
        <Lista itens={comComplemento(estado.d3.formatos, estado.d3.outroFormato, "Outro")} />
        <Texto valor={estado.d3.sugestao} />
      </Secao>
      <Secao titulo={`Diretriz 4 · ${DIRETRIZ_4}`} etapa="d4" onEditar={onEditar}>
        <Lista itens={comComplemento(estado.d4.acoes, estado.d4.outra, "Outra")} />
        <Texto valor={estado.d4.sugestao} />
      </Secao>
      <Secao titulo="Prioridades para 2027–2028" etapa="prioridades" onEditar={onEditar}>
        <ol className="lista-prioridades">
          {estado.prioridades.map((valor, indice) => {
            const descricao = descreverPrioridade(valor);
            return (
              <li key={valor}>
                <span>{indice + 1}</span>
                <div>
                  <strong>{descricao.rotulo}</strong>
                  <small>{descricao.grupo}</small>
                </div>
              </li>
            );
          })}
        </ol>
        <Texto valor={estado.motivoPrioridades} />
      </Secao>
      <Secao titulo="Espaço aberto" etapa="aberto" onEditar={onEditar}>
        <h3>Mudança ou ação única</h3>
        <Texto valor={estado.mudancaUnica} />
        <h3>Manter ou ampliar</h3>
        <Texto valor={estado.manterOuAmpliar} />
        <h3>Rever, modificar ou encerrar</h3>
        <Texto valor={estado.revisarOuEncerrar} />
      </Secao>
    </div>
  );
}
