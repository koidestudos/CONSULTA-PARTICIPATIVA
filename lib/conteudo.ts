export const DIRETRIZ_1 = "Organização e Sistematização";
export const DIRETRIZ_2 = "Investigação, discussão e monitoramento dos óbitos";
export const DIRETRIZ_3 = "Educação continuada e qualificações";
export const DIRETRIZ_4 = "Divulgação de Informações";

export const ACOES_D1 = [
  "Fortalecimento dos Comitês Regionais",
  "Fortalecimento dos Comitês Municipais",
  "Fortalecimento dos Comitês Hospitalares",
  "Organização dos fluxos de trabalho",
  "Padronização de instrumentos",
  "Monitoramento do funcionamento dos Comitês",
  "Integração entre os Comitês",
  "Reuniões periódicas",
  "Outra",
] as const;

export const ACOES_D2 = [
  "Qualificação da investigação dos óbitos",
  "Qualificação da discussão dos casos",
  "Análise dos fatores determinantes",
  "Análise da evitabilidade",
  "Padronização da discussão dos casos",
  "Monitoramento das recomendações",
  "Acompanhamento das medidas de intervenção",
  "Oficinas de vigilância do óbito",
  "Devolutiva aos municípios",
  "Integração entre Comitês e áreas técnicas",
  "Outra",
] as const;

export const TEMAS_D3 = [
  "Investigação de óbitos",
  "Vigilância do óbito",
  "Análise da evitabilidade",
  "Pré-natal",
  "Gestação de alto risco",
  "Parto e nascimento",
  "Urgências e emergências obstétricas",
  "Puerpério",
  "Saúde neonatal",
  "Saúde infantil",
  "Morte fetal",
  "Qualificação dos Comitês",
  "Análise de dados e indicadores",
  "Outro",
] as const;

export const FORMATOS_D3 = [
  "Presencial",
  "Online",
  "Híbrido",
  "Oficinas práticas",
  "Fóruns macrorregionais",
  "Seminários",
  "Webinários",
  "Cursos de curta duração",
  "Outro",
] as const;

export const ACOES_D4 = [
  "Boletim epidemiológico",
  "Relatórios periódicos",
  "Painel/dashboard de indicadores",
  "Indicadores por macrorregião",
  "Indicadores por Região de Saúde",
  "Informações sobre investigação dos óbitos",
  "Informações sobre evitabilidade",
  "Monitoramento das recomendações",
  "Informações para os municípios",
  "Informações para os Comitês",
  "Outra",
] as const;

export const TEXTO_INICIO = [
  "O CEPMMIF-PI está construindo seu Plano de Ação para o período 2027–2028.",
  "Sua contribuição é fundamental para identificar prioridades, desafios e novas ações para o fortalecimento da prevenção da mortalidade materna, infantil e fetal no Estado do Piauí.",
  "As diretrizes estruturantes do Comitê serão mantidas. Nesta consulta, queremos ouvir suas propostas para aprimorar as ações dentro dessas diretrizes.",
] as const;

export const PASSOS_PARTICIPACAO = [
  "Leia cada diretriz.",
  "Escolha as ações que considera prioritárias.",
  "Acrescente suas sugestões.",
  "Ao final, escolha as 3 prioridades gerais para 2027–2028.",
  "Envie sua contribuição.",
] as const;

export const TEXTO_COMO =
  "Não existem respostas certas ou erradas. O objetivo é reunir a experiência e as propostas dos membros do Comitê.";

type ItemPrioridade = {
  valor: string;
  rotulo: string;
  etiqueta?: string;
};

export type GrupoPrioridade = {
  id: "d1" | "d2" | "d3" | "d4";
  diretriz: string;
  atalho: string;
  secoes: { titulo?: string; itens: ItemPrioridade[] }[];
};

function itens(
  diretriz: string,
  opcoes: readonly string[],
  excluir: string,
  etiqueta?: string,
): ItemPrioridade[] {
  return opcoes
    .filter((opcao) => opcao !== excluir)
    .map((opcao) => ({
      rotulo: opcao,
      etiqueta,
      valor: etiqueta ? `${diretriz} — ${etiqueta}: ${opcao}` : `${diretriz} — ${opcao}`,
    }));
}

export const GRUPOS_PRIORIDADE: GrupoPrioridade[] = [
  {
    id: "d1",
    diretriz: DIRETRIZ_1,
    atalho: "Organização",
    secoes: [{ itens: itens(DIRETRIZ_1, ACOES_D1, "Outra") }],
  },
  {
    id: "d2",
    diretriz: DIRETRIZ_2,
    atalho: "Investigação",
    secoes: [{ itens: itens(DIRETRIZ_2, ACOES_D2, "Outra") }],
  },
  {
    id: "d3",
    diretriz: DIRETRIZ_3,
    atalho: "Educação",
    secoes: [
      { titulo: "Temas", itens: itens(DIRETRIZ_3, TEMAS_D3, "Outro", "Tema") },
      { titulo: "Formatos", itens: itens(DIRETRIZ_3, FORMATOS_D3, "Outro", "Formato") },
    ],
  },
  {
    id: "d4",
    diretriz: DIRETRIZ_4,
    atalho: "Divulgação",
    secoes: [{ itens: itens(DIRETRIZ_4, ACOES_D4, "Outra") }],
  },
];

export function valoresPrioridade(): string[] {
  return GRUPOS_PRIORIDADE.flatMap((grupo) =>
    grupo.secoes.flatMap((secao) => secao.itens.map((item) => item.valor)),
  );
}

export function descreverPrioridade(valor: string): { grupo: string; rotulo: string } {
  for (const grupo of GRUPOS_PRIORIDADE) {
    for (const secao of grupo.secoes) {
      const item = secao.itens.find((candidato) => candidato.valor === valor);
      if (item) {
        const prefixo = item.etiqueta ? `${item.etiqueta}: ` : "";
        return { grupo: grupo.diretriz, rotulo: `${prefixo}${item.rotulo}` };
      }
    }
  }
  const [grupo, rotulo] = valor.split(" — ");
  return { grupo: grupo ?? valor, rotulo: rotulo ?? valor };
}

export const DIRETRIZES = [
  {
    id: "d1" as const,
    numero: "Diretriz 1",
    titulo: DIRETRIZ_1,
    texto:
      "Quais ações devem ser priorizadas em 2027–2028 para fortalecer a organização e o funcionamento do CEPMMIF-PI e dos Comitês Regionais, Municipais e Hospitalares?",
    pergunta: "Selecione as ações que você considera prioritárias:",
    opcoes: ACOES_D1,
    outra: "Outra",
    sugestao: "Que nova ação você sugere para fortalecer esta diretriz?",
    icone: "organizacao" as const,
  },
  {
    id: "d2" as const,
    numero: "Diretriz 2",
    titulo: DIRETRIZ_2,
    texto:
      "Quais ações devem ser priorizadas para melhorar a investigação, discussão, análise da evitabilidade e acompanhamento das recomendações relacionadas aos óbitos maternos, infantis e fetais?",
    pergunta: "Selecione as ações que você considera prioritárias:",
    opcoes: ACOES_D2,
    outra: "Outra",
    sugestao: "Que nova ação você sugere para fortalecer esta diretriz?",
    icone: "analise" as const,
  },
  {
    id: "d4" as const,
    numero: "Diretriz 4",
    titulo: DIRETRIZ_4,
    texto:
      "Quais informações, indicadores, relatórios ou ferramentas o CEPMMIF-PI deveria produzir e divulgar para apoiar a gestão e a prevenção de novos óbitos?",
    pergunta: "Selecione as ações que você considera prioritárias:",
    opcoes: ACOES_D4,
    outra: "Outra",
    sugestao: "Que informação ou ferramenta você gostaria que o CEPMMIF disponibilizasse?",
    icone: "divulgacao" as const,
  },
];

export const DIRETRIZ_3_TEXTO =
  "Quais temas e formatos de capacitação devem ser priorizados para qualificar os membros dos Comitês e os profissionais envolvidos na atenção à saúde materna, infantil e neonatal?";

export const SUGESTAO_D3 = "Que nova ação de educação permanente você sugere?";

export const TEXTO_PRIORIDADES =
  "Agora, considerando todas as quatro diretrizes, escolha as 3 ações que você considera mais importantes para o CEPMMIF-PI realizar em 2027–2028.";

export const PERGUNTAS_ABERTO = {
  mudanca:
    "Se você pudesse propor uma única mudança ou ação para fortalecer a prevenção da mortalidade materna, infantil e fetal no Piauí, qual seria?",
  manter:
    "Existe alguma ação do Plano de Ação 2024–2026 que você considera importante manter ou ampliar em 2027–2028?",
  revisar:
    "Existe alguma ação do Plano de Ação 2024–2026 que deveria ser revista, modificada ou encerrada?",
} as const;
