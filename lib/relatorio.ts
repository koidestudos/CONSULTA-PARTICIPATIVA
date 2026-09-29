import { DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4 } from "@/lib/conteudo";
import type { Executor } from "@/lib/executor";

export type Sintese = {
  total: number;
  primeiraResposta: string | null;
  ultimaResposta: string | null;
  acoesMaisEscolhidas: { origem: string; acao: string; frequencia: number }[];
  prioridadesMaisEscolhidas: { acao: string; frequencia: number }[];
  temasMaisEscolhidos: { tema: string; frequencia: number }[];
  formatosMaisEscolhidos: { formato: string; frequencia: number }[];
  sugestoesAbertas: {
    id: string;
    enviadoEm: string | null;
    origem: string;
    campo: string;
    texto: string;
  }[];
  frequenciaSugestoes: { origem: string; campo: string; texto: string; frequencia: number }[];
  sintesePorDiretriz: {
    diretriz: string;
    acoes: { acao: string; frequencia: number }[];
    sugestoes: string[];
  }[];
};

function numero(valor: unknown): number {
  return Number(valor);
}

function iso(valor: unknown): string | null {
  if (valor == null) return null;
  if (valor instanceof Date) return valor.toISOString();
  const data = new Date(String(valor));
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

export async function montarSintese(exec: Executor): Promise<Sintese> {
  const [totalLinha] = await exec.query(
    "SELECT total, primeira_resposta, ultima_resposta FROM vw_total_respostas",
  );
  const acoes = await exec.query(
    "SELECT origem, acao, frequencia FROM vw_acoes_mais_escolhidas ORDER BY frequencia DESC, acao ASC",
  );
  const prioridades = await exec.query(
    "SELECT prioridade, frequencia FROM vw_prioridades ORDER BY frequencia DESC, prioridade ASC",
  );
  const temas = await exec.query(
    "SELECT tema, frequencia FROM vw_temas_capacitacao ORDER BY frequencia DESC, tema ASC",
  );
  const formatos = await exec.query(
    "SELECT formato, frequencia FROM vw_formatos_capacitacao ORDER BY frequencia DESC, formato ASC",
  );
  const textos = await exec.query(
    "SELECT id, enviado_em, origem, campo, texto FROM vw_sugestoes_abertas ORDER BY enviado_em ASC",
  );
  const frequencias = await exec.query(
    `SELECT origem, campo, texto_normalizado, frequencia
     FROM vw_frequencia_sugestoes
     ORDER BY frequencia DESC, origem ASC, campo ASC`,
  );

  const acoesMaisEscolhidas = acoes.map((linha) => ({
    origem: String(linha.origem),
    acao: String(linha.acao),
    frequencia: numero(linha.frequencia),
  }));
  const temasMaisEscolhidos = temas.map((linha) => ({
    tema: String(linha.tema),
    frequencia: numero(linha.frequencia),
  }));
  const formatosMaisEscolhidos = formatos.map((linha) => ({
    formato: String(linha.formato),
    frequencia: numero(linha.frequencia),
  }));
  const sugestoesAbertas = textos.map((linha) => ({
    id: String(linha.id),
    enviadoEm: iso(linha.enviado_em),
    origem: String(linha.origem),
    campo: String(linha.campo),
    texto: String(linha.texto),
  }));

  const sugestoesDe = (origem: string) =>
    sugestoesAbertas.filter((item) => item.origem === origem).map((item) => item.texto);

  return {
    total: numero(totalLinha?.total ?? 0),
    primeiraResposta: iso(totalLinha?.primeira_resposta),
    ultimaResposta: iso(totalLinha?.ultima_resposta),
    acoesMaisEscolhidas,
    prioridadesMaisEscolhidas: prioridades.map((linha) => ({
      acao: String(linha.prioridade),
      frequencia: numero(linha.frequencia),
    })),
    temasMaisEscolhidos,
    formatosMaisEscolhidos,
    sugestoesAbertas,
    frequenciaSugestoes: frequencias.map((linha) => ({
      origem: String(linha.origem),
      campo: String(linha.campo),
      texto: String(linha.texto_normalizado),
      frequencia: numero(linha.frequencia),
    })),
    sintesePorDiretriz: [
      {
        diretriz: DIRETRIZ_1,
        acoes: acoesMaisEscolhidas
          .filter((item) => item.origem === "diretriz_1")
          .map(({ acao, frequencia }) => ({ acao, frequencia })),
        sugestoes: sugestoesDe("diretriz_1"),
      },
      {
        diretriz: DIRETRIZ_2,
        acoes: acoesMaisEscolhidas
          .filter((item) => item.origem === "diretriz_2")
          .map(({ acao, frequencia }) => ({ acao, frequencia })),
        sugestoes: sugestoesDe("diretriz_2"),
      },
      {
        diretriz: DIRETRIZ_3,
        acoes: [
          ...temasMaisEscolhidos.map((item) => ({
            acao: `Tema: ${item.tema}`,
            frequencia: item.frequencia,
          })),
          ...formatosMaisEscolhidos.map((item) => ({
            acao: `Formato: ${item.formato}`,
            frequencia: item.frequencia,
          })),
        ],
        sugestoes: sugestoesDe("diretriz_3"),
      },
      {
        diretriz: DIRETRIZ_4,
        acoes: acoesMaisEscolhidas
          .filter((item) => item.origem === "diretriz_4")
          .map(({ acao, frequencia }) => ({ acao, frequencia })),
        sugestoes: sugestoesDe("diretriz_4"),
      },
    ],
  };
}
