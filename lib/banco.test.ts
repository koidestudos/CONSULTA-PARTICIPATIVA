import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { ACOES_D1, ACOES_D2, ACOES_D4, FORMATOS_D3, TEMAS_D3, valoresPrioridade } from "./conteudo";
import { criarExecutorPglite } from "./db-pglite";
import { montarSintese } from "./relatorio";
import { SQL_INSERIR, salvarContribuicao } from "./salvar";
import { SENTENCAS } from "./schema";
import type { DadosContribuicao } from "./tipos";
import { origemPermitida } from "./origem";

function arquivos(diretorio: string): string[] {
  return readdirSync(diretorio).flatMap((nome) => {
    const completo = path.join(diretorio, nome);
    return statSync(completo).isDirectory() ? arquivos(completo) : [completo];
  });
}

function contribuicao(id: string, sugestao: string, prioridades: string[]): DadosContribuicao {
  return {
    id,
    d1Acoes: [ACOES_D1[0], ACOES_D1[1]],
    d1Outra: null,
    d1Sugestao: sugestao,
    d2Acoes: [ACOES_D2[0]],
    d2Outra: null,
    d2Sugestao: null,
    d3Temas: [TEMAS_D3[0], TEMAS_D3[3]],
    d3OutroTema: null,
    d3Formatos: [FORMATOS_D3[0]],
    d3OutroFormato: null,
    d3Sugestao: null,
    d4Acoes: [ACOES_D4[0]],
    d4Outra: null,
    d4Sugestao: null,
    prioridades,
    motivoPrioridades: null,
    mudancaUnica: null,
    manterOuAmpliar: null,
    revisarOuEncerrar: null,
  };
}

test("o banco guarda só a contribuição anônima e prepara a síntese", async () => {
  const tabela = SENTENCAS.find((sentenca) => sentenca.includes("CREATE TABLE")) ?? "";
  assert.match(tabela, /id uuid PRIMARY KEY/);
  assert.match(tabela, /enviado_em/);
  assert.doesNotMatch(tabela.toLowerCase(), /\b(email|cpf|telefone|municipio|cargo|user_agent)\b/);
  assert.doesNotMatch(SQL_INSERIR.toLowerCase(), /\b(email|cpf|telefone|ip|user_agent)\b/);

  const publicos = [...arquivos("app"), ...arquivos("components")]
    .filter((arquivo) => arquivo.endsWith(".ts") || arquivo.endsWith(".tsx"))
    .map((arquivo) => readFileSync(arquivo, "utf8"))
    .join("\n");
  assert.doesNotMatch(publicos, /montarSintese|vw_total_respostas|vw_sugestoes_abertas/);
  assert.doesNotMatch(readFileSync("app/api/contribuicoes/route.ts", "utf8"), /x-forwarded-for|user-agent|geolocation/i);

  const exec = await criarExecutorPglite("memory://");
  const prioridades = valoresPrioridade();
  const primeira = crypto.randomUUID();
  const segunda = crypto.randomUUID();
  await salvarContribuicao(contribuicao(primeira, "Oficinas itinerantes", prioridades.slice(0, 3)), exec);
  await salvarContribuicao(contribuicao(segunda, "oficinas itinerantes", prioridades.slice(1, 4)), exec);
  await salvarContribuicao(contribuicao(primeira, "Oficinas itinerantes", prioridades.slice(0, 3)), exec);

  const sintese = await montarSintese(exec);
  assert.equal(sintese.total, 2);
  assert.equal(sintese.sintesePorDiretriz.length, 4);
  assert.equal(sintese.sintesePorDiretriz[0]?.diretriz, "Organização e Sistematização");
  const acao = sintese.acoesMaisEscolhidas.find((item) => item.acao === ACOES_D1[0]);
  assert.equal(acao?.frequencia, 2);
  const tema = sintese.temasMaisEscolhidos.find((item) => item.tema === TEMAS_D3[3]);
  assert.equal(tema?.frequencia, 2);
  const formato = sintese.formatosMaisEscolhidos.find((item) => item.formato === FORMATOS_D3[0]);
  assert.equal(formato?.frequencia, 2);
  const prioridade = sintese.prioridadesMaisEscolhidas.find((item) => item.acao === prioridades[1]);
  assert.ok(prioridade && prioridade.frequencia >= 2);
  const frequencia = sintese.frequenciaSugestoes.find((item) => item.campo === "nova_acao");
  assert.equal(frequencia?.frequencia, 2);
  assert.equal(sintese.sugestoesAbertas.length, 2);

  await assert.rejects(() =>
    salvarContribuicao(contribuicao(crypto.randomUUID(), null as unknown as string, prioridades.slice(0, 2)), exec),
  );
});

test("só aceita envio da mesma origem", () => {
  const mesmo = new Request("https://consulta.exemplo.gov.br/api/contribuicoes", {
    headers: { origin: "https://consulta.exemplo.gov.br", host: "consulta.exemplo.gov.br" },
  });
  const outro = new Request("https://consulta.exemplo.gov.br/api/contribuicoes", {
    headers: { origin: "https://outro.exemplo", host: "consulta.exemplo.gov.br" },
  });
  const semOrigem = new Request("https://consulta.exemplo.gov.br/api/contribuicoes", {
    headers: { host: "consulta.exemplo.gov.br" },
  });
  assert.equal(origemPermitida(mesmo), true);
  assert.equal(origemPermitida(outro), false);
  assert.equal(origemPermitida(semOrigem), false);
});
