import assert from "node:assert/strict";
import test from "node:test";
import {
  ACOES_D1,
  ACOES_D2,
  ACOES_D4,
  DIRETRIZ_1,
  DIRETRIZ_2,
  DIRETRIZ_3,
  DIRETRIZ_4,
  FORMATOS_D3,
  TEMAS_D3,
  valoresPrioridade,
} from "./conteudo";
import { percentual } from "./fluxo";
import { criarEstado } from "./rascunho";
import { dadosDoEstado, validarDados, validarEtapa } from "./validacao";

function base() {
  return {
    id: crypto.randomUUID(),
    d1Acoes: [ACOES_D1[0]],
    d1Outra: "",
    d1Sugestao: "Criar um calendário integrado de reuniões.",
    d2Acoes: [ACOES_D2[0]],
    d2Outra: "",
    d2Sugestao: "",
    d3Temas: [TEMAS_D3[0]],
    d3OutroTema: "",
    d3Formatos: [FORMATOS_D3[0]],
    d3OutroFormato: "",
    d3Sugestao: "",
    d4Acoes: [ACOES_D4[0]],
    d4Outra: "",
    d4Sugestao: "",
    prioridades: valoresPrioridade().slice(0, 3),
    motivoPrioridades: "",
    mudancaUnica: "",
    manterOuAmpliar: "",
    revisarOuEncerrar: "",
  };
}

test("mantém as quatro diretrizes do plano", () => {
  assert.deepEqual([DIRETRIZ_1, DIRETRIZ_2, DIRETRIZ_3, DIRETRIZ_4], [
    "Organização e Sistematização",
    "Investigação, discussão e monitoramento dos óbitos",
    "Educação continuada e qualificações",
    "Divulgação de Informações",
  ]);
  assert.deepEqual([...ACOES_D1], [
    "Fortalecimento dos Comitês Regionais",
    "Fortalecimento dos Comitês Municipais",
    "Fortalecimento dos Comitês Hospitalares",
    "Organização dos fluxos de trabalho",
    "Padronização de instrumentos",
    "Monitoramento do funcionamento dos Comitês",
    "Integração entre os Comitês",
    "Reuniões periódicas",
    "Outra",
  ]);
  assert.equal(new Set(valoresPrioridade()).size, valoresPrioridade().length);
  assert.equal(percentual("inicio"), 0);
  assert.equal(percentual("concluido"), 100);
});

test("aceita contribuição anônima completa", () => {
  const resultado = validarDados(base());
  assert.equal(resultado.ok, true);
  if (resultado.ok) {
    assert.equal(resultado.dados.d1Outra, null);
    assert.equal(resultado.dados.prioridades.length, 3);
  }
});

test("recusa dados pessoais e opções fora da consulta", () => {
  const comNome = { ...base(), nome: "Maria" };
  const nome = validarDados(comNome);
  assert.equal(nome.ok, false);

  const comEmail = { ...base(), email: "a@b.c" };
  assert.equal(validarDados(comEmail).ok, false);

  const invalida = { ...base(), d1Acoes: ["Ação inventada"] };
  assert.equal(validarDados(invalida).ok, false);

  const quatro = { ...base(), prioridades: valoresPrioridade().slice(0, 4) };
  assert.equal(validarDados(quatro).ok, false);
});

test("exige texto quando a opção Outra está marcada", () => {
  const estado = criarEstado("11111111-1111-4111-8111-111111111111");
  estado.etapa = "d1";
  estado.d1.acoes = ["Outra"];
  assert.match(validarEtapa("d1", estado) ?? "", /Descreva/);
  estado.d1.outra = "Rodas regionais de alinhamento";
  assert.equal(validarEtapa("d1", estado), null);

  const dados = { ...base(), d1Acoes: ["Outra"], d1Outra: "Rodas regionais de alinhamento" };
  const resultado = validarDados(dados);
  assert.equal(resultado.ok, true);
  if (resultado.ok) assert.equal(resultado.dados.d1Outra, "Rodas regionais de alinhamento");
});

test("exige exatamente três prioridades na etapa", () => {
  const estado = criarEstado("11111111-1111-4111-8111-111111111111");
  estado.prioridades = valoresPrioridade().slice(0, 2);
  assert.match(validarEtapa("prioridades", estado) ?? "", /exatamente 3/);
  estado.prioridades = valoresPrioridade().slice(0, 3);
  assert.equal(validarEtapa("prioridades", estado), null);
  const resultado = validarDados(dadosDoEstado({ ...estado, ...camposMinimos(estado) }));
  assert.equal(resultado.ok, true);
});

function camposMinimos(estado: ReturnType<typeof criarEstado>) {
  return {
    ...estado,
    d1: { ...estado.d1, acoes: [ACOES_D1[0]] },
    d2: { ...estado.d2, acoes: [ACOES_D2[0]] },
    d3: { ...estado.d3, temas: [TEMAS_D3[0]], formatos: [FORMATOS_D3[0]] },
    d4: { ...estado.d4, acoes: [ACOES_D4[0]] },
  };
}
