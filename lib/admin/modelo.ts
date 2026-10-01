import {
  ACOES_D1,
  ACOES_D2,
  ACOES_D4,
  DIRETRIZ_1,
  DIRETRIZ_2,
  DIRETRIZ_3,
  DIRETRIZ_4,
  DIRETRIZES,
  FORMATOS_D3,
  PERGUNTAS_ABERTO,
  SUGESTAO_D3,
  TEMAS_D3,
  TEXTO_PRIORIDADES,
} from "@/lib/conteudo";

export const FUSO = "America/Fortaleza";

export type Contribuicao = {
  id: string;
  enviadoEm: string;
  excluidaEm: string | null;
  d1Acoes: string[];
  d1Outra: string;
  d1Sugestao: string;
  d2Acoes: string[];
  d2Outra: string;
  d2Sugestao: string;
  d3Temas: string[];
  d3OutroTema: string;
  d3Formatos: string[];
  d3OutroFormato: string;
  d3Sugestao: string;
  d4Acoes: string[];
  d4Outra: string;
  d4Sugestao: string;
  prioridades: string[];
  motivoPrioridades: string;
  mudancaUnica: string;
  manterOuAmpliar: string;
  revisarOuEncerrar: string;
};

export type Filtro = {
  diretriz: string;
  acao: string;
  prioridade: string;
  de: string;
  ate: string;
  texto: string;
};

export const FILTRO_VAZIO: Filtro = {
  diretriz: "",
  acao: "",
  prioridade: "",
  de: "",
  ate: "",
  texto: "",
};

export type LinhaResposta = {
  id: string;
  tema: string;
  diretriz: string;
  acao: string;
  pergunta: string;
  resposta: string;
  prioridade: "Sim" | "Não";
  data: string;
  hora: string;
  enviadoEm: string;
};

export type ContagemAcao = {
  diretriz: string;
  grupo: "Ações" | "Temas" | "Formatos";
  acao: string;
  selecionada: number;
  priorizada: number;
  percentualPrioridade: number;
};

export type Resumo = {
  participantes: number;
  respostas: number;
  concluidas: number;
  pendentes: number;
  percentual: number | null;
  acoesAvaliadas: number;
  ultimaResposta: string | null;
  contagens: ContagemAcao[];
};

type Catalogo = {
  diretriz: string;
  grupo: ContagemAcao["grupo"];
  acao: string;
  etiqueta?: "Tema" | "Formato";
  tem: (item: Contribuicao) => boolean;
  complemento: (item: Contribuicao) => string;
};

const PERGUNTA_TEMAS = "Quais temas devem ser priorizados?";
const PERGUNTA_FORMATOS = "Quais formatos de qualificação você considera mais adequados?";
const PERGUNTA_MOTIVO = "Por que essas três ações são prioritárias?";

const CATALOGO: Catalogo[] = [
  ...ACOES_D1.map((acao) => ({
    diretriz: DIRETRIZ_1,
    grupo: "Ações" as const,
    acao,
    tem: (item: Contribuicao) => item.d1Acoes.includes(acao),
    complemento: (item: Contribuicao) => (acao === "Outra" ? item.d1Outra : ""),
  })),
  ...ACOES_D2.map((acao) => ({
    diretriz: DIRETRIZ_2,
    grupo: "Ações" as const,
    acao,
    tem: (item: Contribuicao) => item.d2Acoes.includes(acao),
    complemento: (item: Contribuicao) => (acao === "Outra" ? item.d2Outra : ""),
  })),
  ...TEMAS_D3.map((acao) => ({
    diretriz: DIRETRIZ_3,
    grupo: "Temas" as const,
    acao,
    etiqueta: "Tema" as const,
    tem: (item: Contribuicao) => item.d3Temas.includes(acao),
    complemento: (item: Contribuicao) => (acao === "Outro" ? item.d3OutroTema : ""),
  })),
  ...FORMATOS_D3.map((acao) => ({
    diretriz: DIRETRIZ_3,
    grupo: "Formatos" as const,
    acao,
    etiqueta: "Formato" as const,
    tem: (item: Contribuicao) => item.d3Formatos.includes(acao),
    complemento: (item: Contribuicao) => (acao === "Outro" ? item.d3OutroFormato : ""),
  })),
  ...ACOES_D4.map((acao) => ({
    diretriz: DIRETRIZ_4,
    grupo: "Ações" as const,
    acao,
    tem: (item: Contribuicao) => item.d4Acoes.includes(acao),
    complemento: (item: Contribuicao) => (acao === "Outra" ? item.d4Outra : ""),
  })),
];

export function ativas(lista: Contribuicao[]) {
  return lista.filter((item) => !item.excluidaEm);
}

export function formatarDataHora(iso: string | null) {
  if (!iso) return "Nenhuma resposta recebida";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatarHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function prioridadeLegivel(valor: "Sim" | "Não") {
  return valor === "Sim" ? "Entre as 3 prioridades" : "Não está entre as 3 prioridades";
}

function partes(iso: string) {
  const data = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
  const hora = formatarHora(iso);
  const chave = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  return { data, hora, chave };
}

function estaNasPrioridades(prioridades: string[], diretriz: string, acao: string, etiqueta?: string) {
  const valor = etiqueta ? `${diretriz} — ${etiqueta}: ${acao}` : `${diretriz} — ${acao}`;
  return prioridades.includes(valor);
}

function nomeAcao(acao: string, complemento: string) {
  const texto = complemento.trim();
  if ((acao === "Outra" || acao === "Outro") && texto) return `${acao}: ${texto}`;
  return acao;
}

function limpo(valor: string) {
  return valor.trim();
}

export function linhasDaContribuicao(item: Contribuicao): LinhaResposta[] {
  const { data, hora } = partes(item.enviadoEm);
  const linhas: LinhaResposta[] = [];
  const base = { id: item.id, data, hora, enviadoEm: item.enviadoEm };

  function adicionar(parcial: Omit<LinhaResposta, "id" | "data" | "hora" | "enviadoEm">) {
    linhas.push({ ...base, ...parcial });
  }

  for (const definicao of DIRETRIZES) {
    const bloco =
      definicao.id === "d1"
        ? { acoes: item.d1Acoes, outra: item.d1Outra, sugestao: item.d1Sugestao }
        : definicao.id === "d2"
          ? { acoes: item.d2Acoes, outra: item.d2Outra, sugestao: item.d2Sugestao }
          : { acoes: item.d4Acoes, outra: item.d4Outra, sugestao: item.d4Sugestao };
    for (const acao of bloco.acoes) {
      adicionar({
        tema: definicao.titulo,
        diretriz: definicao.titulo,
        acao: nomeAcao(acao, acao === "Outra" ? bloco.outra : ""),
        pergunta: definicao.pergunta,
        resposta: "Selecionada",
        prioridade: estaNasPrioridades(item.prioridades, definicao.titulo, acao) ? "Sim" : "Não",
      });
    }
    if (limpo(bloco.sugestao)) {
      adicionar({
        tema: definicao.titulo,
        diretriz: definicao.titulo,
        acao: "Nova ação sugerida",
        pergunta: definicao.sugestao,
        resposta: limpo(bloco.sugestao),
        prioridade: "Não",
      });
    }
  }

  for (const tema of item.d3Temas) {
    adicionar({
      tema: DIRETRIZ_3,
      diretriz: DIRETRIZ_3,
      acao: nomeAcao(tema, tema === "Outro" ? item.d3OutroTema : ""),
      pergunta: PERGUNTA_TEMAS,
      resposta: "Selecionada",
      prioridade: estaNasPrioridades(item.prioridades, DIRETRIZ_3, tema, "Tema") ? "Sim" : "Não",
    });
  }
  for (const formato of item.d3Formatos) {
    adicionar({
      tema: DIRETRIZ_3,
      diretriz: DIRETRIZ_3,
      acao: nomeAcao(formato, formato === "Outro" ? item.d3OutroFormato : ""),
      pergunta: PERGUNTA_FORMATOS,
      resposta: "Selecionada",
      prioridade: estaNasPrioridades(item.prioridades, DIRETRIZ_3, formato, "Formato") ? "Sim" : "Não",
    });
  }
  if (limpo(item.d3Sugestao)) {
    adicionar({
      tema: DIRETRIZ_3,
      diretriz: DIRETRIZ_3,
      acao: "Nova ação sugerida",
      pergunta: SUGESTAO_D3,
      resposta: limpo(item.d3Sugestao),
      prioridade: "Não",
    });
  }

  for (const prioridade of item.prioridades) {
    const [diretriz, resto] = prioridade.split(" — ");
    adicionar({
      tema: "Prioridades",
      diretriz: diretriz || "Prioridades",
      acao: resto || prioridade,
      pergunta: TEXTO_PRIORIDADES,
      resposta: "Escolhida entre as 3 prioridades",
      prioridade: "Sim",
    });
  }
  if (limpo(item.motivoPrioridades)) {
    adicionar({
      tema: "Prioridades",
      diretriz: "Prioridades",
      acao: "Motivo",
      pergunta: PERGUNTA_MOTIVO,
      resposta: limpo(item.motivoPrioridades),
      prioridade: "Não",
    });
  }

  const abertos = [
    ["Mudança única", PERGUNTAS_ABERTO.mudanca, item.mudancaUnica],
    ["Manter ou ampliar", PERGUNTAS_ABERTO.manter, item.manterOuAmpliar],
    ["Rever ou encerrar", PERGUNTAS_ABERTO.revisar, item.revisarOuEncerrar],
  ] as const;
  for (const [acao, pergunta, resposta] of abertos) {
    if (!limpo(resposta)) continue;
    adicionar({
      tema: "Espaço aberto",
      diretriz: "Espaço aberto",
      acao,
      pergunta,
      resposta: limpo(resposta),
      prioridade: "Não",
    });
  }

  return linhas;
}

export function linhaCombina(linha: LinhaResposta, filtro: Filtro) {
  if (filtro.diretriz && linha.diretriz !== filtro.diretriz && linha.tema !== filtro.diretriz) return false;
  if (filtro.acao && linha.acao !== filtro.acao && !linha.acao.startsWith(`${filtro.acao}:`)) return false;
  if (filtro.prioridade === "sim" && linha.prioridade !== "Sim") return false;
  if (filtro.prioridade === "nao" && linha.prioridade !== "Não") return false;
  const { chave } = partes(linha.enviadoEm);
  if (filtro.de && chave < filtro.de) return false;
  if (filtro.ate && chave > filtro.ate) return false;
  if (filtro.texto) {
    const busca = filtro.texto.trim().toLocaleLowerCase("pt-BR");
    const conjunto = [linha.tema, linha.diretriz, linha.acao, linha.pergunta, linha.resposta, linha.id]
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    if (!conjunto.includes(busca)) return false;
  }
  return true;
}

export function linhasFiltradas(lista: Contribuicao[], filtro: Filtro, incluirArquivadas = false) {
  const base = incluirArquivadas ? lista : ativas(lista);
  return base.flatMap(linhasDaContribuicao).filter((linha) => linhaCombina(linha, filtro));
}

export function contribuicoesVisiveis(lista: Contribuicao[], filtro: Filtro, incluirArquivadas = false) {
  const base = incluirArquivadas ? lista : ativas(lista);
  return base.filter((item) => linhasDaContribuicao(item).some((linha) => linhaCombina(linha, filtro)));
}

export function contarAcoes(lista: Contribuicao[]): ContagemAcao[] {
  const total = lista.length;
  return CATALOGO.map((item) => {
    const selecionada = lista.filter(item.tem).length;
    const priorizada = lista.filter(
      (contribuicao) =>
        item.tem(contribuicao) &&
        estaNasPrioridades(contribuicao.prioridades, item.diretriz, item.acao, item.etiqueta),
    ).length;
    return {
      diretriz: item.diretriz,
      grupo: item.grupo,
      acao: item.acao,
      selecionada,
      priorizada,
      percentualPrioridade: total === 0 ? 0 : Math.round((priorizada / total) * 100),
    };
  });
}

export function resumir(lista: Contribuicao[], totalMembros: number | null): Resumo {
  const vigentes = ativas(lista);
  const linhas = vigentes.flatMap(linhasDaContribuicao);
  const contagens = contarAcoes(vigentes);
  const ultima = vigentes.reduce<string | null>(
    (maior, item) => (!maior || item.enviadoEm > maior ? item.enviadoEm : maior),
    null,
  );
  return {
    participantes: vigentes.length,
    respostas: linhas.length,
    concluidas: vigentes.length,
    pendentes: 0,
    percentual:
      totalMembros && totalMembros > 0 ? Math.round((vigentes.length / totalMembros) * 100) : null,
    acoesAvaliadas: contagens.filter((item) => item.selecionada > 0).length,
    ultimaResposta: ultima,
    contagens,
  };
}

export type Slide =
  | { id: string; tipo: "capa" }
  | {
      id: string;
      tipo: "panorama";
      participantes: number;
      acoes: number;
      ultima: string | null;
      percentual: number | null;
    }
  | {
      id: string;
      tipo: "resumo";
      numero: string;
      diretriz: string;
      recebidas: number;
      participantesTema: number;
      marcacoes: number;
      priorizadas: number;
      itens: { nome: string; grupo: string; selecionada: number; priorizada: number }[];
    }
  | {
      id: string;
      tipo: "textos";
      diretriz: string;
      titulo: string;
      itens: { rotulo: string; texto: string }[];
    }
  | { id: string; tipo: "abertura"; titulo: string; texto: string }
  | {
      id: string;
      tipo: "consolidado";
      diretriz: string;
      grupo: string;
      acao: string;
      selecionada: number;
      priorizada: number;
      total: number;
      textos: string[];
    };

function textosCurtos(itens: { rotulo: string; texto: string }[], tamanho = 220) {
  const grupos: { rotulo: string; texto: string }[][] = [];
  let atual: { rotulo: string; texto: string }[] = [];
  for (const item of itens) {
    const cabe = atual.length < 2 && item.texto.length <= tamanho && atual.every((existente) => existente.texto.length <= tamanho);
    if (atual.length > 0 && !cabe) {
      grupos.push(atual);
      atual = [];
    }
    atual.push(item);
    if (item.texto.length > tamanho) {
      grupos.push(atual);
      atual = [];
    }
  }
  if (atual.length) grupos.push(atual);
  return grupos;
}

function sugestoesDaDiretriz(lista: Contribuicao[], diretriz: string) {
  const itens: { rotulo: string; texto: string }[] = [];
  for (const item of lista) {
    if (diretriz === DIRETRIZ_1 && limpo(item.d1Sugestao)) itens.push({ rotulo: "Nova ação", texto: limpo(item.d1Sugestao) });
    if (diretriz === DIRETRIZ_1 && limpo(item.d1Outra)) itens.push({ rotulo: "Outra ação", texto: limpo(item.d1Outra) });
    if (diretriz === DIRETRIZ_2 && limpo(item.d2Sugestao)) itens.push({ rotulo: "Nova ação", texto: limpo(item.d2Sugestao) });
    if (diretriz === DIRETRIZ_2 && limpo(item.d2Outra)) itens.push({ rotulo: "Outra ação", texto: limpo(item.d2Outra) });
    if (diretriz === DIRETRIZ_3 && limpo(item.d3Sugestao)) itens.push({ rotulo: "Educação permanente", texto: limpo(item.d3Sugestao) });
    if (diretriz === DIRETRIZ_3 && limpo(item.d3OutroTema)) itens.push({ rotulo: "Outro tema", texto: limpo(item.d3OutroTema) });
    if (diretriz === DIRETRIZ_3 && limpo(item.d3OutroFormato)) itens.push({ rotulo: "Outro formato", texto: limpo(item.d3OutroFormato) });
    if (diretriz === DIRETRIZ_4 && limpo(item.d4Sugestao)) itens.push({ rotulo: "Informação ou ferramenta", texto: limpo(item.d4Sugestao) });
    if (diretriz === DIRETRIZ_4 && limpo(item.d4Outra)) itens.push({ rotulo: "Outra informação", texto: limpo(item.d4Outra) });
  }
  return itens;
}

const DIRETRIZES_TELAO = [
  { numero: "Diretriz 1", titulo: DIRETRIZ_1 },
  { numero: "Diretriz 2", titulo: DIRETRIZ_2 },
  { numero: "Diretriz 3", titulo: DIRETRIZ_3 },
  { numero: "Diretriz 4", titulo: DIRETRIZ_4 },
];

export function montarSlides(lista: Contribuicao[], totalMembros: number | null): Slide[] {
  const vigentes = ativas(lista);
  const resumo = resumir(vigentes, totalMembros);
  const slides: Slide[] = [
    { id: "capa", tipo: "capa" },
    {
      id: "panorama",
      tipo: "panorama",
      participantes: resumo.participantes,
      acoes: resumo.acoesAvaliadas,
      ultima: resumo.ultimaResposta,
      percentual: resumo.percentual,
    },
  ];

  for (const diretriz of DIRETRIZES_TELAO) {
    const itens = resumo.contagens
      .filter((item) => item.diretriz === diretriz.titulo && (item.selecionada > 0 || item.priorizada > 0))
      .sort((a, b) => b.selecionada - a.selecionada || b.priorizada - a.priorizada);
    const participantesTema = vigentes.filter((contribuicao) =>
      CATALOGO.some((entrada) => entrada.diretriz === diretriz.titulo && entrada.tem(contribuicao)),
    ).length;
    slides.push({
      id: `resumo-${diretriz.numero}`,
      tipo: "resumo",
      numero: diretriz.numero,
      diretriz: diretriz.titulo,
      recebidas: vigentes.length,
      participantesTema,
      marcacoes: itens.reduce((soma, item) => soma + item.selecionada, 0),
      priorizadas: itens.reduce((soma, item) => soma + item.priorizada, 0),
      itens: itens.map((item) => ({
        nome: item.acao,
        grupo: item.grupo,
        selecionada: item.selecionada,
        priorizada: item.priorizada,
      })),
    });
    const grupos = textosCurtos(sugestoesDaDiretriz(vigentes, diretriz.titulo));
    grupos.forEach((grupo, indice) => {
      slides.push({
        id: `textos-${diretriz.numero}-${indice}`,
        tipo: "textos",
        diretriz: diretriz.titulo,
        titulo: "Contribuições dos membros",
        itens: grupo,
      });
    });
  }

  const abertos = vigentes.flatMap((item) => {
    const pares = [
      ["Mudança única", item.mudancaUnica],
      ["Manter ou ampliar", item.manterOuAmpliar],
      ["Rever ou encerrar", item.revisarOuEncerrar],
      ["Motivo das 3 prioridades", item.motivoPrioridades],
    ] as const;
    return pares
      .filter(([, texto]) => limpo(texto))
      .map(([rotulo, texto]) => ({ rotulo, texto: limpo(texto) }));
  });
  textosCurtos(abertos).forEach((grupo, indice) => {
    slides.push({
      id: `aberto-${indice}`,
      tipo: "textos",
      diretriz: "Espaço aberto",
      titulo: "Contribuições dos membros",
      itens: grupo,
    });
  });

  slides.push({
    id: "abertura-consolidado",
    tipo: "abertura",
    titulo: "Resultado consolidado",
    texto:
      "Contagem direta das marcações. Prioridade significa a escolha entre as 3 ações prioritárias, não uma escala alta, média ou baixa. Os textos, quando aparecem, são os originais escritos pelos membros, sem resumo automático.",
  });

  const ordenadas = resumo.contagens
    .filter((contagem) => contagem.selecionada > 0 || contagem.priorizada > 0)
    .sort(
      (a, b) =>
        b.priorizada - a.priorizada ||
        b.selecionada - a.selecionada ||
        a.acao.localeCompare(b.acao, "pt-BR"),
    );

  for (const item of ordenadas) {
    const definicao = CATALOGO.find(
      (entrada) => entrada.diretriz === item.diretriz && entrada.acao === item.acao && entrada.grupo === item.grupo,
    );
    const textos = [
      ...new Set(
        vigentes
          .map((contribuicao) => definicao?.complemento(contribuicao).trim() ?? "")
          .filter((texto) => texto.length > 0),
      ),
    ];
    slides.push({
      id: `consolidado-${item.diretriz}-${item.grupo}-${item.acao}`,
      tipo: "consolidado",
      diretriz: item.diretriz,
      grupo: item.grupo,
      acao: item.acao,
      selecionada: item.selecionada,
      priorizada: item.priorizada,
      total: vigentes.length,
      textos,
    });
  }

  return slides;
}

export function indiceConsolidado(slides: Slide[]) {
  return slides.findIndex((slide) => slide.tipo === "abertura");
}

export const DIRETRIZES_FILTRO = [
  DIRETRIZ_1,
  DIRETRIZ_2,
  DIRETRIZ_3,
  DIRETRIZ_4,
  "Prioridades",
  "Espaço aberto",
];

export const ACOES_FILTRO = CATALOGO.map((item) => item.acao).filter(
  (acao, indice, lista) => lista.indexOf(acao) === indice,
);

export function percentualDe(parte: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((parte / total) * 100);
}

function campo(origem: { get(nome: string): string | null }, nome: string, limite = 180) {
  return (origem.get(nome) ?? "").trim().slice(0, limite);
}

export function lerFiltro(origem: { get(nome: string): string | null }): Filtro {
  const conhecidas = DIRETRIZES_FILTRO as readonly string[];
  const direta = campo(origem, "diretriz");
  const tema = campo(origem, "tema");
  const acao = campo(origem, "acao");
  const prioridade = campo(origem, "prioridade", 8);
  const de = campo(origem, "de", 10);
  const ate = campo(origem, "ate", 10);
  return {
    diretriz: conhecidas.includes(direta) ? direta : conhecidas.includes(tema) ? tema : "",
    acao: ACOES_FILTRO.includes(acao) ? acao : "",
    prioridade: prioridade === "sim" || prioridade === "nao" ? prioridade : "",
    de: /^\d{4}-\d{2}-\d{2}$/.test(de) ? de : "",
    ate: /^\d{4}-\d{2}-\d{2}$/.test(ate) ? ate : "",
    texto: campo(origem, "texto", 200),
  };
}
