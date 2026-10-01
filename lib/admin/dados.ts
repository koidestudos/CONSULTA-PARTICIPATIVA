import type { Executor } from "@/lib/executor";
import { prepararBanco } from "@/lib/salvar";
import type { Contribuicao } from "@/lib/admin/modelo";

function lista(valor: unknown) {
  if (Array.isArray(valor)) return valor.map(String);
  if (typeof valor === "string") {
    try {
      const lido = JSON.parse(valor) as unknown;
      if (Array.isArray(lido)) return lido.map(String);
    } catch {
      return [];
    }
  }
  return [];
}

function texto(valor: unknown) {
  return valor == null ? "" : String(valor);
}

function iso(valor: unknown) {
  if (valor == null) return null;
  if (valor instanceof Date) return valor.toISOString();
  const data = new Date(String(valor));
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

function mapear(linha: Record<string, unknown>): Contribuicao {
  const enviada = iso(linha.enviado_em);
  if (!enviada) throw new Error("Contribuição sem data");
  return {
    id: String(linha.id),
    enviadoEm: enviada,
    excluidaEm: iso(linha.excluida_em),
    d1Acoes: lista(linha.d1_acoes),
    d1Outra: texto(linha.d1_outra),
    d1Sugestao: texto(linha.d1_sugestao),
    d2Acoes: lista(linha.d2_acoes),
    d2Outra: texto(linha.d2_outra),
    d2Sugestao: texto(linha.d2_sugestao),
    d3Temas: lista(linha.d3_temas),
    d3OutroTema: texto(linha.d3_outro_tema),
    d3Formatos: lista(linha.d3_formatos),
    d3OutroFormato: texto(linha.d3_outro_formato),
    d3Sugestao: texto(linha.d3_sugestao),
    d4Acoes: lista(linha.d4_acoes),
    d4Outra: texto(linha.d4_outra),
    d4Sugestao: texto(linha.d4_sugestao),
    prioridades: lista(linha.prioridades),
    motivoPrioridades: texto(linha.motivo_prioridades),
    mudancaUnica: texto(linha.mudanca_unica),
    manterOuAmpliar: texto(linha.manter_ou_ampliar),
    revisarOuEncerrar: texto(linha.revisar_ou_encerrar),
  };
}

const COLUNAS = `
  id, enviado_em, excluida_em,
  d1_acoes, d1_outra, d1_sugestao,
  d2_acoes, d2_outra, d2_sugestao,
  d3_temas, d3_outro_tema, d3_formatos, d3_outro_formato, d3_sugestao,
  d4_acoes, d4_outra, d4_sugestao,
  prioridades, motivo_prioridades, mudanca_unica, manter_ou_ampliar, revisar_ou_encerrar
`;

export async function listarContribuicoes(execInformado?: Executor) {
  const exec = await prepararBanco(execInformado);
  const linhas = await exec.query(`SELECT ${COLUNAS} FROM contribuicoes ORDER BY enviado_em DESC`);
  return linhas.map(mapear);
}

export async function lerTotalMembros(execInformado?: Executor) {
  const exec = await prepararBanco(execInformado);
  const linhas = await exec.query("SELECT valor FROM configuracoes WHERE chave = 'total_membros'");
  const valor = Number(linhas[0]?.valor);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

export async function salvarTotalMembros(total: number | null, execInformado?: Executor) {
  const exec = await prepararBanco(execInformado);
  if (!total) {
    await exec.exec("DELETE FROM configuracoes WHERE chave = 'total_membros'");
    return null;
  }
  await exec.query(
    `INSERT INTO configuracoes (chave, valor) VALUES ('total_membros', $1)
     ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor`,
    [String(total)],
  );
  return total;
}

export async function arquivarContribuicao(id: string, execInformado?: Executor) {
  const exec = await prepararBanco(execInformado);
  const linhas = await exec.query(
    "UPDATE contribuicoes SET excluida_em = now() WHERE id = $1::uuid AND excluida_em IS NULL RETURNING id",
    [id],
  );
  return linhas.length === 1;
}
