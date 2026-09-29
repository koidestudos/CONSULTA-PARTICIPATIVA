import type { Etapa } from "@/lib/tipos";
import { ETAPAS } from "@/lib/tipos";

export const MARCOS: { id: string; rotulo: string; etapa: Etapa }[] = [
  { id: "inicio", rotulo: "Início", etapa: "inicio" },
  { id: "d1", rotulo: "Diretriz 1", etapa: "d1" },
  { id: "d2", rotulo: "Diretriz 2", etapa: "d2" },
  { id: "d3", rotulo: "Diretriz 3", etapa: "d3" },
  { id: "d4", rotulo: "Diretriz 4", etapa: "d4" },
  { id: "prioridades", rotulo: "Prioridades", etapa: "prioridades" },
  { id: "revisao", rotulo: "Revisão", etapa: "revisao" },
  { id: "concluido", rotulo: "Concluído", etapa: "concluido" },
];

export function rotuloEtapa(etapa: Etapa): string {
  switch (etapa) {
    case "inicio":
      return "Início";
    case "como":
      return "Como participar";
    case "d1":
      return "Diretriz 1";
    case "d2":
      return "Diretriz 2";
    case "d3":
      return "Diretriz 3";
    case "d4":
      return "Diretriz 4";
    case "prioridades":
      return "Prioridades";
    case "aberto":
      return "Espaço aberto";
    case "revisao":
      return "Revisão";
    case "concluido":
      return "Concluído";
  }
}

export function percentual(etapa: Etapa): number {
  const indice = ETAPAS.indexOf(etapa);
  if (indice < 0) return 0;
  return Math.round((indice / (ETAPAS.length - 1)) * 100);
}

export function etapaSeguinte(etapa: Etapa): Etapa | null {
  const indice = ETAPAS.indexOf(etapa);
  if (indice < 0 || indice >= ETAPAS.length - 1) return null;
  return ETAPAS[indice + 1];
}

export function etapaAnterior(etapa: Etapa): Etapa | null {
  const indice = ETAPAS.indexOf(etapa);
  if (indice <= 0) return null;
  return ETAPAS[indice - 1];
}

export function indiceMarco(etapa: Etapa): number {
  switch (etapa) {
    case "inicio":
    case "como":
      return 0;
    case "d1":
      return 1;
    case "d2":
      return 2;
    case "d3":
      return 3;
    case "d4":
      return 4;
    case "prioridades":
      return 5;
    case "aberto":
      return 5.5;
    case "revisao":
      return 6;
    case "concluido":
      return 7;
  }
}

export function situacaoMarco(indice: number, etapa: Etapa): "feito" | "atual" | "futuro" {
  const atual = indiceMarco(etapa);
  if (atual === 5.5) return indice <= 5 ? "feito" : "futuro";
  if (indice < atual) return "feito";
  if (indice === atual) return "atual";
  return "futuro";
}
