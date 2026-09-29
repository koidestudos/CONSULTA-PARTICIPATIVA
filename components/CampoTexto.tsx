import { LIMITE_CURTO, LIMITE_LONGO } from "@/lib/validacao";

export function CampoTexto({
  id,
  rotulo,
  valor,
  onChange,
  linhas = 5,
  maximo = LIMITE_LONGO,
  opcional = true,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  linhas?: number;
  maximo?: number;
  opcional?: boolean;
}) {
  const contadorId = `${id}-contador`;
  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}
        {opcional ? <span className="opcional"> opcional</span> : null}
      </label>
      <textarea
        id={id}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        rows={linhas}
        maxLength={maximo}
        lang="pt-BR"
        autoComplete="off"
        spellCheck
        aria-describedby={contadorId}
      />
      <p id={contadorId} className="contador-texto">
        {valor.length} de {maximo}
      </p>
    </div>
  );
}

export function CampoCurto({
  id,
  rotulo,
  valor,
  onChange,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="campo campo-curto">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        maxLength={LIMITE_CURTO}
        lang="pt-BR"
        autoComplete="off"
        enterKeyHint="done"
      />
    </div>
  );
}

export function AvisoPrivacidade() {
  return (
    <p className="aviso-privacidade">
      Não escreva nome, telefone, e-mail ou qualquer outro dado pessoal.
    </p>
  );
}
