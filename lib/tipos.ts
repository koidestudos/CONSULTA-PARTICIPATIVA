export const ETAPAS = [
  "inicio",
  "como",
  "d1",
  "d2",
  "d3",
  "d4",
  "prioridades",
  "aberto",
  "revisao",
  "concluido",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export type BlocoAcoes = {
  acoes: string[];
  outra: string;
  sugestao: string;
};

export type BlocoEducacao = {
  temas: string[];
  outroTema: string;
  formatos: string[];
  outroFormato: string;
  sugestao: string;
};

export type Estado = {
  id: string;
  etapa: Etapa;
  retornoRevisao: boolean;
  d1: BlocoAcoes;
  d2: BlocoAcoes;
  d3: BlocoEducacao;
  d4: BlocoAcoes;
  prioridades: string[];
  motivoPrioridades: string;
  mudancaUnica: string;
  manterOuAmpliar: string;
  revisarOuEncerrar: string;
};

export type Recibo = {
  id: string;
  enviadoEm: string;
};

export type DadosContribuicao = {
  id: string;
  d1Acoes: string[];
  d1Outra: string | null;
  d1Sugestao: string | null;
  d2Acoes: string[];
  d2Outra: string | null;
  d2Sugestao: string | null;
  d3Temas: string[];
  d3OutroTema: string | null;
  d3Formatos: string[];
  d3OutroFormato: string | null;
  d3Sugestao: string | null;
  d4Acoes: string[];
  d4Outra: string | null;
  d4Sugestao: string | null;
  prioridades: string[];
  motivoPrioridades: string | null;
  mudancaUnica: string | null;
  manterOuAmpliar: string | null;
  revisarOuEncerrar: string | null;
};

export type AlterarEstado = (atualizar: (estado: Estado) => Estado) => void;
