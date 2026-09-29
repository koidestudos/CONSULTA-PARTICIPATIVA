import { CampoCurto } from "@/components/CampoTexto";

export type OpcaoMarcada = {
  valor: string;
  rotulo: string;
  etiqueta?: string;
};

function fraseAcoes(quantidade: number) {
  if (quantidade === 0) return "Nenhuma ação selecionada";
  if (quantidade === 1) return "1 ação selecionada";
  return `${quantidade} ações selecionadas`;
}

export function CampoOpcoes({
  nome,
  legenda,
  legendaOculta = false,
  opcoes,
  selecionadas,
  onChange,
  rotuloOutra,
  valorOutra = "",
  onChangeOutra,
  perguntaOutra = "Qual?",
  maximo,
  enumerar = false,
  contagem = fraseAcoes,
}: {
  nome: string;
  legenda: string;
  legendaOculta?: boolean;
  opcoes: readonly OpcaoMarcada[];
  selecionadas: string[];
  onChange: (selecionadas: string[]) => void;
  rotuloOutra?: string;
  valorOutra?: string;
  onChangeOutra?: (valor: string) => void;
  perguntaOutra?: string;
  maximo?: number;
  enumerar?: boolean;
  contagem?: (quantidade: number) => string;
}) {
  const atingiuMaximo = typeof maximo === "number" && selecionadas.length >= maximo;
  const contadorId = `${nome}-contador`;
  const quantidade = opcoes.filter((opcao) => selecionadas.includes(opcao.valor)).length;

  return (
    <fieldset className="grupo" aria-describedby={enumerar ? undefined : contadorId}>
      <legend className={legendaOculta ? "somente-leitura" : "legenda"}>{legenda}</legend>
      {enumerar ? null : (
        <p id={contadorId} className="selecionadas" aria-live="polite">
          {contagem(quantidade)}
        </p>
      )}
      <div className="opcoes">
        {opcoes.map((opcao) => {
          const ativa = selecionadas.includes(opcao.valor);
          const bloqueada = !ativa && atingiuMaximo;
          const ehOutra = rotuloOutra === opcao.valor;
          const campoId = `${nome}-qual`;
          return (
            <div key={opcao.valor} className={ativa ? "opcao-bloco ativa" : "opcao-bloco"}>
              <label className="opcao">
                <input
                  type="checkbox"
                  name={nome}
                  value={opcao.valor}
                  checked={ativa}
                  disabled={bloqueada}
                  aria-controls={ehOutra ? campoId : undefined}
                  onChange={() => {
                    if (ativa) onChange(selecionadas.filter((item) => item !== opcao.valor));
                    else if (!bloqueada) onChange([...selecionadas, opcao.valor]);
                  }}
                />
                <span className="texto-opcao">
                  {opcao.etiqueta ? <small className="etiqueta">{opcao.etiqueta}</small> : null}
                  {opcao.rotulo}
                </span>
                {enumerar && ativa ? (
                  <span className="ordem" aria-hidden="true">
                    {selecionadas.indexOf(opcao.valor) + 1}
                  </span>
                ) : null}
              </label>
              {ehOutra && ativa && onChangeOutra ? (
                <div className="qual">
                  <CampoCurto id={campoId} rotulo={perguntaOutra} valor={valorOutra} onChange={onChangeOutra} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
