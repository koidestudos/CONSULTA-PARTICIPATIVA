"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProvedorPainel, usePainel } from "@/components/admin/Painel";
import { formatarDataHora, indiceConsolidado, montarSlides, percentualDe, type Slide } from "@/lib/admin/modelo";

function rotuloItem(grupo: string, nome: string) {
  if (grupo === "Temas") return `Tema · ${nome}`;
  if (grupo === "Formatos") return `Formato · ${nome}`;
  return nome;
}

function Corpo({ slide }: { slide: Slide }) {
  if (slide.tipo === "capa") {
    return (
      <div className="telao-capa">
        <Image
          src="/marca-cepmmif.png"
          alt="Marca do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí"
          width={120}
          height={120}
          priority
        />
        <h1>CONSULTA PARTICIPATIVA</h1>
        <p className="telao-plano">Plano de Ação CEPMMIF-PI 2027–2028</p>
        <p className="telao-frase">“Construindo coletivamente as ações do Comitê”</p>
        <p className="telao-kicker">CEPMMIF-PI</p>
      </div>
    );
  }

  if (slide.tipo === "panorama") {
    return (
      <>
        <p className="telao-numero">PANORAMA</p>
        <h1>Consulta em andamento</h1>
        <div className="telao-metricas">
          <div>
            <strong>{slide.participantes}</strong>
            <span>contribuições recebidas</span>
          </div>
          <div>
            <strong>{slide.acoes}</strong>
            <span>ações avaliadas</span>
          </div>
          <div>
            <strong>{slide.percentual === null ? "—" : `${slide.percentual}%`}</strong>
            <span>participação</span>
          </div>
        </div>
        <p>Última resposta: {formatarDataHora(slide.ultima)}</p>
      </>
    );
  }

  if (slide.tipo === "resumo") {
    return (
      <>
        <p className="telao-numero">{slide.numero.toUpperCase()}</p>
        <h1>{slide.diretriz}</h1>
        <div className="telao-metricas">
          <div>
            <span>Participação</span>
            <strong>{slide.participantesTema}</strong>
            <span>de {slide.recebidas} contribuições marcaram esta diretriz</span>
          </div>
          <div>
            <span>Prioridade</span>
            <strong>{slide.priorizadas}</strong>
            <span>marcações entre as 3 prioridades</span>
          </div>
          <div>
            <span>Marcações</span>
            <strong>{slide.marcacoes}</strong>
            <span>escolhas nesta diretriz</span>
          </div>
        </div>
        {slide.itens.length === 0 ? (
          <p>Ainda não há marcações nesta diretriz.</p>
        ) : (
          <ul className="telao-lista">
            {slide.itens.map((item) => (
              <li key={`${item.grupo}-${item.nome}`}>
                <span>{rotuloItem(item.grupo, item.nome)}</span>
                <strong>
                  {item.selecionada} · {item.priorizada} prioridades
                </strong>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  if (slide.tipo === "textos") {
    return (
      <>
        <p className="telao-numero">{slide.diretriz.toUpperCase()}</p>
        <h1>{slide.titulo.toUpperCase()}</h1>
        <div className="telao-cartoes">
          {slide.itens.map((item, indice) => (
            <article key={`${item.rotulo}-${indice}`} className="telao-cartao">
              <small>{item.rotulo} · texto original</small>
              {item.texto}
            </article>
          ))}
        </div>
      </>
    );
  }

  if (slide.tipo === "abertura") {
    return (
      <div className="telao-centro">
        <p className="telao-numero">RESULTADO CONSOLIDADO</p>
        <h1>{slide.titulo}</h1>
        <p className="telao-frase">{slide.texto}</p>
      </div>
    );
  }

  const percentualPrioridade = percentualDe(slide.priorizada, slide.total);
  const percentualMarcacao = percentualDe(slide.selecionada, slide.total);
  return (
    <>
      <p className="telao-numero">
        {slide.diretriz.toUpperCase()} · {slide.grupo.toUpperCase()}
      </p>
      <h1>{slide.acao}</h1>
      <div className="telao-metricas">
        <div>
          <span>Marcações</span>
          <strong>
            {slide.selecionada} · {percentualMarcacao}%
          </strong>
        </div>
        <div>
          <span>Entre as 3 prioridades</span>
          <strong>
            {slide.priorizada} · {percentualPrioridade}%
          </strong>
        </div>
      </div>
      {slide.textos.length > 0 ? (
        <div className="telao-cartoes">
          <p className="adm-nota">Textos originais associados a esta ação, sem resumo automático.</p>
          {slide.textos.map((texto) => (
            <article key={texto} className="telao-cartao">
              {texto}
            </article>
          ))}
        </div>
      ) : (
        <p>Não há texto livre associado a esta ação. A contagem acima vem só das marcações.</p>
      )}
    </>
  );
}

function Apresentacao() {
  const router = useRouter();
  const { contribuicoes, totalMembros, carregando, erro } = usePainel();
  const slides = useMemo(() => montarSlides(contribuicoes, totalMembros), [contribuicoes, totalMembros]);
  const [indice, setIndice] = useState(0);
  const limite = Math.max(slides.length - 1, 0);
  const indiceSeguro = Math.min(indice, limite);
  const consolidado = indiceConsolidado(slides);
  const atual = slides[indiceSeguro];

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        setIndice(Math.min(indiceSeguro + 1, limite));
      } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        setIndice(Math.max(indiceSeguro - 1, 0));
      } else if (evento.key === "Escape") {
        evento.preventDefault();
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
        router.push("/admin/dashboard");
      } else if (evento.key === "f" || evento.key === "F") {
        evento.preventDefault();
        void alternarTelaCheia();
      }
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [indiceSeguro, limite, router]);

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      return;
    }
  }

  if (!atual) return null;

  return (
    <div className="telao">
      <section className="telao-quadro" aria-live="polite">
        {carregando ? <p className="telao-centro">Carregando a apresentação…</p> : null}
        {erro ? <p className="adm-erro">{erro}</p> : null}
        {!carregando && !erro ? <Corpo slide={atual} /> : null}
      </section>
      <div className="telao-controles">
        <button type="button" onClick={() => setIndice(Math.max(indiceSeguro - 1, 0))} disabled={indiceSeguro === 0}>
          ← Anterior
        </button>
        <span className="telao-indice">
          {indiceSeguro + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => setIndice(Math.min(indiceSeguro + 1, limite))}
          disabled={indiceSeguro >= limite}
        >
          → Próximo
        </button>
        <button type="button" onClick={() => setIndice(consolidado)} disabled={consolidado < 0}>
          Resultado consolidado
        </button>
        <button type="button" onClick={() => void alternarTelaCheia()}>
          Tela cheia
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard")}>
          Sair
        </button>
      </div>
    </div>
  );
}

export function Telao() {
  return (
    <ProvedorPainel>
      <Apresentacao />
    </ProvedorPainel>
  );
}
