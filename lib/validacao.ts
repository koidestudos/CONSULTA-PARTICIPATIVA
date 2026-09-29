import {
  ACOES_D1,
  ACOES_D2,
  ACOES_D4,
  FORMATOS_D3,
  TEMAS_D3,
  valoresPrioridade,
} from "@/lib/conteudo";
import type { DadosContribuicao, Estado, Etapa } from "@/lib/tipos";

export const ID_RESERVADO = "00000000-0000-4000-8000-000000000000";
export const LIMITE_CURTO = 300;
export const LIMITE_LONGO = 2000;
const MIN_OUTRA = 3;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CHAVES_PERMITIDAS = [
  "id",
  "d1Acoes",
  "d1Outra",
  "d1Sugestao",
  "d2Acoes",
  "d2Outra",
  "d2Sugestao",
  "d3Temas",
  "d3OutroTema",
  "d3Formatos",
  "d3OutroFormato",
  "d3Sugestao",
  "d4Acoes",
  "d4Outra",
  "d4Sugestao",
  "prioridades",
  "motivoPrioridades",
  "mudancaUnica",
  "manterOuAmpliar",
  "revisarOuEncerrar",
] as const;

const CHAVES_PROIBIDAS = new Set(
  [
    "nome",
    "name",
    "cpf",
    "email",
    "e-mail",
    "telefone",
    "phone",
    "celular",
    "municipio",
    "município",
    "cidade",
    "instituicao",
    "instituição",
    "institution",
    "cargo",
    "funcao",
    "função",
    "regiao",
    "região",
    "macrorregiao",
    "macrorregião",
    "ip",
    "ip_address",
    "user_agent",
    "useragent",
    "localizacao",
    "localização",
    "geolocalizacao",
    "endereco",
    "endereço",
    "identificacao",
    "identificação",
    "participante",
    "usuario",
    "usuário",
  ].map((chave) => chave.toLowerCase()),
);

export type ResultadoValidacao =
  | { ok: true; dados: DadosContribuicao }
  | { ok: false; erro: string };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function lerLista(
  valor: unknown,
  permitidas: readonly string[],
): { ok: true; lista: string[] } | { ok: false } {
  if (!Array.isArray(valor)) return { ok: false };
  const conjunto = new Set(permitidas);
  const vistos = new Set<string>();
  const lista: string[] = [];
  for (const item of valor) {
    if (typeof item !== "string" || !conjunto.has(item) || vistos.has(item)) return { ok: false };
    vistos.add(item);
    lista.push(item);
  }
  return { ok: true, lista };
}

function lerTexto(valor: unknown, maximo: number): { ok: true; texto: string } | { ok: false } {
  if (valor == null || valor === "") return { ok: true, texto: "" };
  if (typeof valor !== "string") return { ok: false };
  if (valor.length > maximo + 40) return { ok: false };
  const limpo = valor.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").normalize("NFC").trim();
  if (limpo.length > maximo) return { ok: false };
  return { ok: true, texto: limpo };
}

function outraInformada(
  lista: string[],
  rotulo: string,
  texto: string,
): { ok: true; valor: string | null } | { ok: false; erro: string } {
  if (!lista.includes(rotulo)) return { ok: true, valor: null };
  if (texto.length < MIN_OUTRA) {
    return { ok: false, erro: "Descreva a outra opção para continuar." };
  }
  return { ok: true, valor: texto };
}

function nulo(texto: string): string | null {
  return texto.length > 0 ? texto : null;
}

export function validarDados(entrada: unknown): ResultadoValidacao {
  if (!ehObjeto(entrada)) {
    return { ok: false, erro: "A contribuição está incompleta ou inválida." };
  }

  for (const chave of Object.keys(entrada)) {
    if (CHAVES_PROIBIDAS.has(chave.toLowerCase())) {
      return { ok: false, erro: "A consulta não aceita dados pessoais." };
    }
    if (!CHAVES_PERMITIDAS.includes(chave as (typeof CHAVES_PERMITIDAS)[number])) {
      return {
        ok: false,
        erro: "A contribuição contém informações que não fazem parte da consulta.",
      };
    }
  }

  if (typeof entrada.id !== "string" || !UUID.test(entrada.id) || entrada.id === ID_RESERVADO) {
    return {
      ok: false,
      erro: "Não foi possível identificar esta contribuição anônima. Recarregue a página e tente novamente.",
    };
  }

  const d1 = lerLista(entrada.d1Acoes, ACOES_D1);
  const d2 = lerLista(entrada.d2Acoes, ACOES_D2);
  const temas = lerLista(entrada.d3Temas, TEMAS_D3);
  const formatos = lerLista(entrada.d3Formatos, FORMATOS_D3);
  const d4 = lerLista(entrada.d4Acoes, ACOES_D4);
  const prioridades = lerLista(entrada.prioridades, valoresPrioridade());
  if (!d1.ok || !d2.ok || !temas.ok || !formatos.ok || !d4.ok || !prioridades.ok) {
    return { ok: false, erro: "Há uma opção inválida na contribuição." };
  }

  const textos = {
    d1Outra: lerTexto(entrada.d1Outra, LIMITE_CURTO),
    d1Sugestao: lerTexto(entrada.d1Sugestao, LIMITE_LONGO),
    d2Outra: lerTexto(entrada.d2Outra, LIMITE_CURTO),
    d2Sugestao: lerTexto(entrada.d2Sugestao, LIMITE_LONGO),
    d3OutroTema: lerTexto(entrada.d3OutroTema, LIMITE_CURTO),
    d3OutroFormato: lerTexto(entrada.d3OutroFormato, LIMITE_CURTO),
    d3Sugestao: lerTexto(entrada.d3Sugestao, LIMITE_LONGO),
    d4Outra: lerTexto(entrada.d4Outra, LIMITE_CURTO),
    d4Sugestao: lerTexto(entrada.d4Sugestao, LIMITE_LONGO),
    motivo: lerTexto(entrada.motivoPrioridades, LIMITE_LONGO),
    mudanca: lerTexto(entrada.mudancaUnica, LIMITE_LONGO),
    manter: lerTexto(entrada.manterOuAmpliar, LIMITE_LONGO),
    revisar: lerTexto(entrada.revisarOuEncerrar, LIMITE_LONGO),
  };
  if (Object.values(textos).some((item) => !item.ok)) {
    return { ok: false, erro: "Um dos textos excede o limite." };
  }

  if (d1.lista.length === 0) return { ok: false, erro: "Selecione ao menos uma ação na Diretriz 1." };
  if (d2.lista.length === 0) return { ok: false, erro: "Selecione ao menos uma ação na Diretriz 2." };
  if (temas.lista.length === 0) return { ok: false, erro: "Selecione ao menos um tema na Diretriz 3." };
  if (formatos.lista.length === 0) {
    return { ok: false, erro: "Selecione ao menos um formato na Diretriz 3." };
  }
  if (d4.lista.length === 0) return { ok: false, erro: "Selecione ao menos uma ação na Diretriz 4." };
  if (prioridades.lista.length !== 3) {
    return { ok: false, erro: "Escolha exatamente 3 prioridades." };
  }

  const outra1 = outraInformada(d1.lista, "Outra", textos.d1Outra.ok ? textos.d1Outra.texto : "");
  const outra2 = outraInformada(d2.lista, "Outra", textos.d2Outra.ok ? textos.d2Outra.texto : "");
  const outroTema = outraInformada(
    temas.lista,
    "Outro",
    textos.d3OutroTema.ok ? textos.d3OutroTema.texto : "",
  );
  const outroFormato = outraInformada(
    formatos.lista,
    "Outro",
    textos.d3OutroFormato.ok ? textos.d3OutroFormato.texto : "",
  );
  const outra4 = outraInformada(d4.lista, "Outra", textos.d4Outra.ok ? textos.d4Outra.texto : "");
  const complementos = [outra1, outra2, outroTema, outroFormato, outra4];
  for (const complemento of complementos) {
    if (!complemento.ok) return complemento;
  }

  return {
    ok: true,
    dados: {
      id: entrada.id.toLowerCase(),
      d1Acoes: d1.lista,
      d1Outra: outra1.ok ? outra1.valor : null,
      d1Sugestao: nulo(textos.d1Sugestao.ok ? textos.d1Sugestao.texto : ""),
      d2Acoes: d2.lista,
      d2Outra: outra2.ok ? outra2.valor : null,
      d2Sugestao: nulo(textos.d2Sugestao.ok ? textos.d2Sugestao.texto : ""),
      d3Temas: temas.lista,
      d3OutroTema: outroTema.ok ? outroTema.valor : null,
      d3Formatos: formatos.lista,
      d3OutroFormato: outroFormato.ok ? outroFormato.valor : null,
      d3Sugestao: nulo(textos.d3Sugestao.ok ? textos.d3Sugestao.texto : ""),
      d4Acoes: d4.lista,
      d4Outra: outra4.ok ? outra4.valor : null,
      d4Sugestao: nulo(textos.d4Sugestao.ok ? textos.d4Sugestao.texto : ""),
      prioridades: prioridades.lista,
      motivoPrioridades: nulo(textos.motivo.ok ? textos.motivo.texto : ""),
      mudancaUnica: nulo(textos.mudanca.ok ? textos.mudanca.texto : ""),
      manterOuAmpliar: nulo(textos.manter.ok ? textos.manter.texto : ""),
      revisarOuEncerrar: nulo(textos.revisar.ok ? textos.revisar.texto : ""),
    },
  };
}

export function validarEtapa(etapa: Etapa, estado: Estado): string | null {
  if (etapa === "d1") return validarBloco(estado.d1.acoes, estado.d1.outra, "ação");
  if (etapa === "d2") return validarBloco(estado.d2.acoes, estado.d2.outra, "ação");
  if (etapa === "d4") return validarBloco(estado.d4.acoes, estado.d4.outra, "ação");
  if (etapa === "d3") {
    if (estado.d3.temas.length === 0) return "Selecione ao menos um tema para continuar.";
    if (estado.d3.temas.includes("Outro") && estado.d3.outroTema.trim().length < MIN_OUTRA) {
      return "Descreva qual é o outro tema.";
    }
    if (estado.d3.formatos.length === 0) return "Selecione ao menos um formato para continuar.";
    if (estado.d3.formatos.includes("Outro") && estado.d3.outroFormato.trim().length < MIN_OUTRA) {
      return "Descreva qual é o outro formato.";
    }
    return null;
  }
  if (etapa === "prioridades" && estado.prioridades.length !== 3) {
    return "Escolha exatamente 3 prioridades para continuar.";
  }
  return null;
}

function validarBloco(acoes: string[], outra: string, substantivo: string): string | null {
  if (acoes.length === 0) return `Selecione ao menos uma ${substantivo} para continuar.`;
  if (acoes.includes("Outra") && outra.trim().length < MIN_OUTRA) {
    return "Descreva qual é a outra ação.";
  }
  return null;
}

export function dadosDoEstado(estado: Estado): Record<string, unknown> {
  return {
    id: estado.id,
    d1Acoes: estado.d1.acoes,
    d1Outra: estado.d1.outra,
    d1Sugestao: estado.d1.sugestao,
    d2Acoes: estado.d2.acoes,
    d2Outra: estado.d2.outra,
    d2Sugestao: estado.d2.sugestao,
    d3Temas: estado.d3.temas,
    d3OutroTema: estado.d3.outroTema,
    d3Formatos: estado.d3.formatos,
    d3OutroFormato: estado.d3.outroFormato,
    d3Sugestao: estado.d3.sugestao,
    d4Acoes: estado.d4.acoes,
    d4Outra: estado.d4.outra,
    d4Sugestao: estado.d4.sugestao,
    prioridades: estado.prioridades,
    motivoPrioridades: estado.motivoPrioridades,
    mudancaUnica: estado.mudancaUnica,
    manterOuAmpliar: estado.manterOuAmpliar,
    revisarOuEncerrar: estado.revisarOuEncerrar,
  };
}
