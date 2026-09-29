import type { Executor } from "@/lib/executor";
import { aplicarSchema } from "@/lib/schema";
import type { DadosContribuicao, Recibo } from "@/lib/tipos";
import { obterExecutor } from "@/lib/db";

export const SQL_INSERIR = `
INSERT INTO contribuicoes (
  id,
  d1_acoes, d1_outra, d1_sugestao,
  d2_acoes, d2_outra, d2_sugestao,
  d3_temas, d3_outro_tema, d3_formatos, d3_outro_formato, d3_sugestao,
  d4_acoes, d4_outra, d4_sugestao,
  prioridades, motivo_prioridades, mudanca_unica, manter_ou_ampliar, revisar_ou_encerrar
) VALUES (
  $1,
  $2::jsonb, $3, $4,
  $5::jsonb, $6, $7,
  $8::jsonb, $9, $10::jsonb, $11, $12,
  $13::jsonb, $14, $15,
  $16::jsonb, $17, $18, $19, $20
)
ON CONFLICT (id) DO UPDATE SET
  enviado_em = now(),
  d1_acoes = EXCLUDED.d1_acoes,
  d1_outra = EXCLUDED.d1_outra,
  d1_sugestao = EXCLUDED.d1_sugestao,
  d2_acoes = EXCLUDED.d2_acoes,
  d2_outra = EXCLUDED.d2_outra,
  d2_sugestao = EXCLUDED.d2_sugestao,
  d3_temas = EXCLUDED.d3_temas,
  d3_outro_tema = EXCLUDED.d3_outro_tema,
  d3_formatos = EXCLUDED.d3_formatos,
  d3_outro_formato = EXCLUDED.d3_outro_formato,
  d3_sugestao = EXCLUDED.d3_sugestao,
  d4_acoes = EXCLUDED.d4_acoes,
  d4_outra = EXCLUDED.d4_outra,
  d4_sugestao = EXCLUDED.d4_sugestao,
  prioridades = EXCLUDED.prioridades,
  motivo_prioridades = EXCLUDED.motivo_prioridades,
  mudanca_unica = EXCLUDED.mudanca_unica,
  manter_ou_ampliar = EXCLUDED.manter_ou_ampliar,
  revisar_ou_encerrar = EXCLUDED.revisar_ou_encerrar
RETURNING id, enviado_em
`.trim();

const garantias = new WeakMap<Executor, Promise<void>>();

function esquemaPronto(exec: Executor) {
  let pendente = garantias.get(exec);
  if (!pendente) {
    pendente = aplicarSchema(exec).catch((erro: unknown) => {
      garantias.delete(exec);
      throw erro;
    });
    garantias.set(exec, pendente);
  }
  return pendente;
}

function iso(valor: unknown): string {
  if (valor instanceof Date) return valor.toISOString();
  const data = new Date(String(valor));
  if (Number.isNaN(data.getTime())) throw new Error("Recibo inválido");
  return data.toISOString();
}

export async function salvarContribuicao(
  dados: DadosContribuicao,
  execInformado?: Executor,
): Promise<Recibo> {
  const exec = execInformado ?? (await obterExecutor());
  await esquemaPronto(exec);
  const linhas = await exec.query(SQL_INSERIR, [
    dados.id,
    JSON.stringify(dados.d1Acoes),
    dados.d1Outra,
    dados.d1Sugestao,
    JSON.stringify(dados.d2Acoes),
    dados.d2Outra,
    dados.d2Sugestao,
    JSON.stringify(dados.d3Temas),
    dados.d3OutroTema,
    JSON.stringify(dados.d3Formatos),
    dados.d3OutroFormato,
    dados.d3Sugestao,
    JSON.stringify(dados.d4Acoes),
    dados.d4Outra,
    dados.d4Sugestao,
    JSON.stringify(dados.prioridades),
    dados.motivoPrioridades,
    dados.mudancaUnica,
    dados.manterOuAmpliar,
    dados.revisarOuEncerrar,
  ]);
  const linha = linhas[0];
  if (!linha) throw new Error("Recibo inválido");
  return { id: String(linha.id), enviadoEm: iso(linha.enviado_em) };
}
