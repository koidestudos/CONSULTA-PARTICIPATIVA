import type { Estado, Etapa, Recibo } from "@/lib/tipos";
import { ETAPAS } from "@/lib/tipos";
import { ID_RESERVADO } from "@/lib/validacao";

const CHAVE = "cepmmif-pi.consulta.2027.v1";

export function criarEstado(id?: string): Estado {
  return {
    id: id ?? crypto.randomUUID(),
    etapa: "inicio",
    retornoRevisao: false,
    d1: { acoes: [], outra: "", sugestao: "" },
    d2: { acoes: [], outra: "", sugestao: "" },
    d3: { temas: [], outroTema: "", formatos: [], outroFormato: "", sugestao: "" },
    d4: { acoes: [], outra: "", sugestao: "" },
    prioridades: [],
    motivoPrioridades: "",
    mudancaUnica: "",
    manterOuAmpliar: "",
    revisarOuEncerrar: "",
  };
}

export function estadoInicial(): Estado {
  return criarEstado(ID_RESERVADO);
}

function ehEtapa(valor: unknown): valor is Etapa {
  return typeof valor === "string" && ETAPAS.includes(valor as Etapa);
}

function lista(valor: unknown): string[] | null {
  if (!Array.isArray(valor) || valor.some((item) => typeof item !== "string")) return null;
  return valor;
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" ? valor : null;
}

export function ehEstado(valor: unknown): valor is Estado {
  if (typeof valor !== "object" || valor === null) return false;
  const estado = valor as Partial<Estado>;
  if (!ehEtapa(estado.etapa) || typeof estado.id !== "string" || typeof estado.retornoRevisao !== "boolean") {
    return false;
  }
  const blocos = [estado.d1, estado.d2, estado.d4];
  for (const bloco of blocos) {
    if (!bloco || !lista(bloco.acoes) || texto(bloco.outra) === null || texto(bloco.sugestao) === null) {
      return false;
    }
  }
  const educacao = estado.d3;
  if (
    !educacao ||
    !lista(educacao.temas) ||
    !lista(educacao.formatos) ||
    texto(educacao.outroTema) === null ||
    texto(educacao.outroFormato) === null ||
    texto(educacao.sugestao) === null ||
    !lista(estado.prioridades) ||
    texto(estado.motivoPrioridades) === null ||
    texto(estado.mudancaUnica) === null ||
    texto(estado.manterOuAmpliar) === null ||
    texto(estado.revisarOuEncerrar) === null
  ) {
    return false;
  }
  return true;
}

export function lerRascunho(): { estado: Estado | null; recibo: Recibo | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const json = JSON.parse(bruto) as { versao?: number; estado?: unknown; recibo?: Partial<Recibo> };
    if (json.versao !== 1) return null;
    if (typeof json.recibo?.id === "string" && typeof json.recibo.enviadoEm === "string") {
      return { estado: null, recibo: { id: json.recibo.id, enviadoEm: json.recibo.enviadoEm } };
    }
    if (ehEstado(json.estado)) return { estado: json.estado, recibo: null };
    return null;
  } catch {
    return null;
  }
}

export function gravarRascunho(estado: Estado, recibo: Recibo | null) {
  if (typeof window === "undefined" || estado.id === ID_RESERVADO) return;
  try {
    if (recibo) {
      window.localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, recibo }));
      return;
    }
    window.localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, estado }));
  } catch {
    // O aparelho pode recusar o armazenamento. A visita atual segue na memória.
  }
}

export function limparRascunho() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // Ignora falha de armazenamento local.
  }
}
