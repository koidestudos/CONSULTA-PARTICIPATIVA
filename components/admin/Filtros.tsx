"use client";

import { useEffect, useId, useState } from "react";
import { ACOES_FILTRO, DIRETRIZES_FILTRO, type Filtro } from "@/lib/admin/modelo";

type Props = {
  filtro: Filtro;
  arquivadas: boolean;
  atualizar: (parcial: Partial<Filtro>) => void;
  definirArquivadas: (valor: boolean) => void;
  limpar: () => void;
};

export function Filtros({ filtro, arquivadas, atualizar, definirArquivadas, limpar }: Props) {
  const base = useId();
  const [texto, setTexto] = useState(filtro.texto);
  const [sincronizado, setSincronizado] = useState(filtro.texto);
  if (filtro.texto !== sincronizado) {
    setSincronizado(filtro.texto);
    setTexto(filtro.texto);
  }

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      if (texto !== filtro.texto) atualizar({ texto });
    }, 300);
    return () => window.clearTimeout(temporizador);
  }, [atualizar, filtro.texto, texto]);

  return (
    <div className="adm-filtros">
      <label htmlFor={`${base}-tema`}>
        Tema ou diretriz
        <select
          id={`${base}-tema`}
          value={filtro.diretriz}
          onChange={(evento) => atualizar({ diretriz: evento.target.value })}
        >
          <option value="">Todos</option>
          {DIRETRIZES_FILTRO.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${base}-acao`}>
        Ação
        <select id={`${base}-acao`} value={filtro.acao} onChange={(evento) => atualizar({ acao: evento.target.value })}>
          <option value="">Todas</option>
          {ACOES_FILTRO.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${base}-prioridade`}>
        Prioridade
        <select
          id={`${base}-prioridade`}
          value={filtro.prioridade}
          onChange={(evento) => atualizar({ prioridade: evento.target.value })}
        >
          <option value="">Todas</option>
          <option value="sim">Entre as 3 prioridades</option>
          <option value="nao">Não está entre as 3 prioridades</option>
        </select>
      </label>
      <label htmlFor={`${base}-de`}>
        Data inicial
        <input id={`${base}-de`} type="date" value={filtro.de} onChange={(evento) => atualizar({ de: evento.target.value })} />
      </label>
      <label htmlFor={`${base}-ate`}>
        Data final
        <input
          id={`${base}-ate`}
          type="date"
          value={filtro.ate}
          onChange={(evento) => atualizar({ ate: evento.target.value })}
        />
      </label>
      <label htmlFor={`${base}-texto`}>
        Busca por texto
        <input
          id={`${base}-texto`}
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Palavra da resposta ou da ação"
        />
      </label>
      <p className="adm-nota">Participante: a consulta não identifica quem respondeu.</p>
      <label className="adm-check">
        <input type="checkbox" checked={arquivadas} onChange={(evento) => definirArquivadas(evento.target.checked)} />
        Mostrar respostas retiradas das contagens
      </label>
      <button type="button" className="adm-botao secundario" onClick={limpar}>
        Limpar filtros
      </button>
    </div>
  );
}
