"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BotoesDownload } from "@/components/admin/BotoesDownload";
import { Filtros } from "@/components/admin/Filtros";
import { usePainel } from "@/components/admin/Painel";
import { useFiltroConsulta } from "@/components/admin/useFiltro";
import {
  contribuicoesVisiveis,
  formatarDataHora,
  linhasDaContribuicao,
  linhasFiltradas,
  prioridadeLegivel,
  type Contribuicao,
  type LinhaResposta,
} from "@/lib/admin/modelo";

const CONFIRMACAO = "Tem certeza que deseja excluir esta resposta? Esta ação não poderá ser desfeita.";

export function Respostas() {
  const router = useRouter();
  const { contribuicoes, carregando, erro, recarregar } = usePainel();
  const { filtro, arquivadas, atualizar, definirArquivadas, limpar } = useFiltroConsulta();
  const [visao, setVisao] = useState<"tabela" | "cards">("tabela");
  const [somenteFiltradas, setSomenteFiltradas] = useState(true);
  const [aberta, setAberta] = useState<Contribuicao | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [falha, setFalha] = useState("");
  const dialogo = useRef<HTMLDialogElement>(null);

  const linhas = useMemo(
    () => linhasFiltradas(contribuicoes, filtro, arquivadas),
    [arquivadas, contribuicoes, filtro],
  );
  const visiveis = useMemo(
    () => contribuicoesVisiveis(contribuicoes, filtro, arquivadas),
    [arquivadas, contribuicoes, filtro],
  );
  const porId = useMemo(() => new Map(contribuicoes.map((item) => [item.id, item])), [contribuicoes]);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (aberta && !elemento.open) elemento.showModal();
    if (!aberta && elemento.open) elemento.close();
  }, [aberta]);

  function abrir(linha: LinhaResposta) {
    const item = porId.get(linha.id);
    if (!item) return;
    setFalha("");
    setConfirmando(false);
    setAberta(item);
  }

  function fechar() {
    setAberta(null);
    setConfirmando(false);
    setFalha("");
  }

  async function excluir() {
    if (!aberta) return;
    setOcupado(true);
    setFalha("");
    try {
      const resposta = await fetch("/api/admin/excluir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: aberta.id }),
      });
      if (resposta.status === 401) {
        router.push("/admin");
        return;
      }
      if (!resposta.ok) {
        const dados = (await resposta.json()) as { erro?: string };
        setFalha(dados.erro || "Não foi possível retirar esta resposta.");
        return;
      }
      fechar();
      await recarregar();
    } catch {
      setFalha("Não foi possível retirar esta resposta.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <section className="adm-painel">
        <div className="adm-linha">
          <h2>Respostas dos membros</h2>
          <div className="adm-visoes" role="group" aria-label="Formato da lista">
            <button
              type="button"
              className={visao === "tabela" ? "adm-botao" : "adm-botao secundario"}
              aria-pressed={visao === "tabela"}
              onClick={() => setVisao("tabela")}
            >
              Tabela
            </button>
            <button
              type="button"
              className={visao === "cards" ? "adm-botao" : "adm-botao secundario"}
              aria-pressed={visao === "cards"}
              onClick={() => setVisao("cards")}
            >
              Cards
            </button>
          </div>
        </div>
        <Filtros
          filtro={filtro}
          arquivadas={arquivadas}
          atualizar={atualizar}
          definirArquivadas={definirArquivadas}
          limpar={limpar}
        />
        <p className="adm-nota">
          {carregando
            ? "Carregando as respostas…"
            : `${linhas.length} linhas no filtro, em ${visiveis.length} contribuições.`}
          Nesta consulta, tema e diretriz usam a mesma organização.
        </p>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={somenteFiltradas}
            onChange={(evento) => setSomenteFiltradas(evento.target.checked)}
          />
          Exportar somente respostas filtradas
        </label>
        <BotoesDownload filtro={filtro} aplicar={somenteFiltradas} arquivadas={arquivadas && somenteFiltradas} />
        {erro ? (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        ) : null}
      </section>

      {!carregando && linhas.length === 0 ? (
        <p className="adm-painel">Nenhuma resposta encontrada com esses filtros.</p>
      ) : null}

      {visao === "tabela" ? (
        <div className="adm-tabela-envolve adm-painel">
          <table className="adm-tabela">
            <thead>
              <tr>
                <th>Diretriz</th>
                <th>Ação</th>
                <th>Resposta</th>
                <th>Prioridade</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, indice) => {
                const origem = porId.get(linha.id);
                return (
                  <tr
                    key={`${linha.id}-${indice}`}
                    tabIndex={0}
                    onClick={() => abrir(linha)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault();
                        abrir(linha);
                      }
                    }}
                  >
                    <td>
                      {linha.diretriz}
                      {origem?.excluidaEm ? <span className="adm-chip arquivo"> Retirada</span> : null}
                    </td>
                    <td>{linha.acao}</td>
                    <td className="adm-resposta">{linha.resposta}</td>
                    <td>
                      <span className={linha.prioridade === "Sim" ? "adm-chip sim" : "adm-chip nao"}>
                        {prioridadeLegivel(linha.prioridade)}
                      </span>
                    </td>
                    <td>
                      {linha.data}
                      <br />
                      {linha.hora}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-grade">
          {linhas.map((linha, indice) => (
            <article key={`${linha.id}-${indice}`} className="adm-painel adm-item">
              <span className={linha.prioridade === "Sim" ? "adm-chip sim" : "adm-chip nao"}>
                {prioridadeLegivel(linha.prioridade)}
              </span>
              <h3>{linha.acao}</h3>
              <p className="adm-nota">{linha.diretriz}</p>
              <p>{linha.resposta}</p>
              <p className="adm-nota">
                {linha.data} às {linha.hora}
              </p>
              <button type="button" className="adm-botao secundario" onClick={() => abrir(linha)}>
                Ver detalhes
              </button>
            </article>
          ))}
        </div>
      )}

      <dialog
        ref={dialogo}
        className="adm-dialogo"
        aria-labelledby="titulo-resposta"
        onCancel={(evento) => {
          evento.preventDefault();
          fechar();
        }}
      >
        {aberta ? (
          <div className="adm-dialogo-corpo">
            {confirmando ? (
              <>
                <h2 id="titulo-resposta">{CONFIRMACAO}</h2>
                <div className="adm-linha">
                  <button type="button" className="adm-botao secundario" onClick={() => setConfirmando(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="adm-botao perigo" onClick={() => void excluir()} disabled={ocupado}>
                    {ocupado ? "Retirando…" : "Excluir"}
                  </button>
                </div>
                {falha ? (
                  <p className="adm-erro" role="alert">
                    {falha}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="adm-linha">
                  <h2 id="titulo-resposta">Detalhes da contribuição</h2>
                  <button type="button" className="adm-botao secundario" onClick={fechar}>
                    Fechar
                  </button>
                </div>
                <p>
                  {formatarDataHora(aberta.enviadoEm)}
                  {aberta.excluidaEm ? " · Retirada das contagens" : ""}
                </p>
                <h3>3 prioridades</h3>
                <ol>
                  {aberta.prioridades.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                {linhasDaContribuicao(aberta).map((linha, indice) => (
                  <p key={`${linha.acao}-${indice}`}>
                    <strong>
                      {linha.diretriz} · {linha.acao}
                    </strong>
                    <br />
                    {linha.pergunta}
                    <br />
                    {linha.resposta}
                    <br />
                    <span className="adm-nota">{prioridadeLegivel(linha.prioridade)}</span>
                  </p>
                ))}
                <p className="adm-nota">Registro anônimo: {aberta.id}</p>
                <div className="adm-perigo-zona">
                  <p className="adm-nota">
                    A resposta sai das contagens e da apresentação. O registro original permanece guardado.
                  </p>
                  {aberta.excluidaEm ? (
                    <p>Esta resposta já foi retirada das contagens.</p>
                  ) : (
                    <button type="button" className="adm-botao perigo" onClick={() => setConfirmando(true)}>
                      Excluir esta resposta
                    </button>
                  )}
                  {falha ? (
                    <p className="adm-erro" role="alert">
                      {falha}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
