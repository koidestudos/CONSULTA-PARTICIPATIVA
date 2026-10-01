import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { ACOES_D1, ACOES_D2, ACOES_D4, DIRETRIZ_1, FORMATOS_D3, TEMAS_D3, valoresPrioridade } from "../conteudo";
import { criarExecutorPglite } from "../db-pglite";
import { montarSintese } from "../relatorio";
import { salvarContribuicao } from "../salvar";
import type { DadosContribuicao } from "../tipos";
import { nomeArquivo } from "./arquivo";
import { registrarFalha, registrarSucesso, loginBloqueado } from "./credenciais";
import { arquivarContribuicao, lerTotalMembros, listarContribuicoes, salvarTotalMembros } from "./dados";
import { gerarCsv, gerarExcel, gerarPdf } from "./exportar";
import {
  ativas,
  lerFiltro,
  linhasDaContribuicao,
  linhasFiltradas,
  montarSlides,
  resumir,
  type Contribuicao,
} from "./modelo";
import { criarSessao, sessaoValida } from "./sessao";

function arquivos(diretorio: string): string[] {
  return readdirSync(diretorio).flatMap((nome) => {
    if (nome === "admin") return [];
    const completo = path.join(diretorio, nome);
    return statSync(completo).isDirectory() ? arquivos(completo) : [completo];
  });
}

function vazia(parcial: Partial<Contribuicao> = {}): Contribuicao {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    enviadoEm: "2026-10-01T18:00:00.000Z",
    excluidaEm: null,
    d1Acoes: [ACOES_D1[0]],
    d1Outra: "",
    d1Sugestao: "Oficinas itinerantes",
    d2Acoes: [],
    d2Outra: "",
    d2Sugestao: "",
    d3Temas: [],
    d3OutroTema: "",
    d3Formatos: [],
    d3OutroFormato: "",
    d3Sugestao: "",
    d4Acoes: [],
    d4Outra: "",
    d4Sugestao: "",
    prioridades: [`${DIRETRIZ_1} — ${ACOES_D1[0]}`, `${DIRETRIZ_1} — ${ACOES_D1[1]}`, `${DIRETRIZ_1} — ${ACOES_D1[2]}`],
    motivoPrioridades: "",
    mudancaUnica: "",
    manterOuAmpliar: "",
    revisarOuEncerrar: "",
    ...parcial,
  };
}

function envio(id: string): DadosContribuicao {
  const prioridades = valoresPrioridade();
  return {
    id,
    d1Acoes: [ACOES_D1[0]],
    d1Outra: null,
    d1Sugestao: "Oficinas itinerantes",
    d2Acoes: [ACOES_D2[0]],
    d2Outra: null,
    d2Sugestao: null,
    d3Temas: [TEMAS_D3[0]],
    d3OutroTema: null,
    d3Formatos: [FORMATOS_D3[0]],
    d3OutroFormato: null,
    d3Sugestao: null,
    d4Acoes: [ACOES_D4[0]],
    d4Outra: null,
    d4Sugestao: null,
    prioridades: prioridades.slice(0, 3),
    motivoPrioridades: null,
    mudancaUnica: null,
    manterOuAmpliar: null,
    revisarOuEncerrar: null,
  };
}

test("a consulta pública não aponta para a área administrativa", () => {
  const publicos = [...arquivos("app"), ...arquivos("components")]
    .filter((arquivo) => arquivo.endsWith(".ts") || arquivo.endsWith(".tsx"))
    .map((arquivo) => readFileSync(arquivo, "utf8"))
    .join("\n");
  assert.doesNotMatch(publicos, /\/admin|Painel Administrativo|Administrador/);
});

test("filtros, planilha e telão usam o texto original", async () => {
  const item = vazia();
  const linhas = linhasDaContribuicao(item);
  assert.equal(linhas.some((linha) => linha.resposta === "Oficinas itinerantes"), true);
  assert.equal(linhasFiltradas([item], { ...lerFiltro({ get: () => "" }), texto: "oficinas" }).length > 0, true);
  assert.equal(
    linhasFiltradas([item], {
      diretriz: "",
      acao: "",
      prioridade: "",
      de: "2026-10-02",
      ate: "",
      texto: "",
    }).length,
    0,
  );
  const params = new URLSearchParams({ diretriz: "inexistente", tema: DIRETRIZ_1, prioridade: "alta" });
  assert.equal(lerFiltro(params).diretriz, DIRETRIZ_1);
  assert.equal(lerFiltro(params).prioridade, "");

  const csv = gerarCsv(linhas);
  assert.ok(csv.charCodeAt(0) === 0xfeff);
  assert.match(csv, /Tema;Diretriz;Ação;Pergunta;Resposta;Prioridade;Participante;Registro anônimo;Data;Hora/);
  assert.match(csv, /Não identificado/);
  assert.match(csv, /Oficinas itinerantes/);
  assert.equal(nomeArquivo("xlsx", false), "Consulta_Participativa_CEPMMIF_2027_2028.xlsx");
  assert.match(nomeArquivo("csv", true), /_filtrado\.csv$/);

  const excel = await gerarExcel(linhas);
  assert.equal(excel.subarray(0, 2).toString(), "PK");
  const pdf = await gerarPdf(linhas);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");

  const slides = montarSlides([item], 4);
  assert.equal(slides[0]?.tipo, "capa");
  assert.equal(slides.some((slide) => slide.tipo === "textos" && slide.itens.some((texto) => texto.texto === "Oficinas itinerantes")), true);
  const resumo = resumir([item, vazia({ excluidaEm: "2026-10-02T00:00:00.000Z", id: "22222222-2222-4222-8222-222222222222" })], 4);
  assert.equal(resumo.participantes, 1);
  assert.equal(resumo.pendentes, 0);
  assert.equal(resumo.percentual, 25);
  assert.equal(ativas([item]).length, 1);
});

test("login protege o painel e a leitura pública continua fechada", async () => {
  const anterior = {
    usuario: process.env.ADMIN_USER,
    senha: process.env.ADMIN_PASSWORD,
    segredo: process.env.ADMIN_SESSION_SECRET,
  };
  process.env.ADMIN_USER = "cepmmif";
  process.env.ADMIN_PASSWORD = "senha-de-teste";
  process.env.ADMIN_SESSION_SECRET = "segredo-de-teste-com-tamanho-suficiente";
  registrarSucesso();
  try {
    const token = await criarSessao();
    assert.equal(await sessaoValida(token), true);
    assert.equal(await sessaoValida(`${token}alterado`), false);
    const expirado = await criarSessao(Date.now() - 13 * 60 * 60 * 1000);
    assert.equal(await sessaoValida(expirado), false);

    const { POST } = await import("../../app/api/admin/login/route");
    const ruim = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usuario: "cepmmif", senha: "errada" }),
      }),
    );
    assert.equal(ruim.status, 401);
    const bom = await POST(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usuario: " cepmmif ", senha: "senha-de-teste" }),
      }),
    );
    assert.equal(bom.status, 200);
    assert.match(bom.headers.get("set-cookie") ?? "", /cepmmif_admin=/);
    assert.match(bom.headers.get("set-cookie") ?? "", /HttpOnly/i);

    const { GET } = await import("../../app/api/admin/painel/route");
    const fechado = await GET(new Request("http://localhost/api/admin/painel"));
    assert.equal(fechado.status, 401);
    const { GET: leituraPublica } = await import("../../app/api/contribuicoes/route");
    assert.equal(leituraPublica().status, 405);

    registrarSucesso();
    for (let vez = 0; vez < 8; vez += 1) registrarFalha(1_000);
    assert.equal(loginBloqueado(1_000), true);
    assert.equal(loginBloqueado(61_000), false);
  } finally {
    registrarSucesso();
    if (anterior.usuario === undefined) delete process.env.ADMIN_USER;
    else process.env.ADMIN_USER = anterior.usuario;
    if (anterior.senha === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = anterior.senha;
    if (anterior.segredo === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = anterior.segredo;
  }
});

test("arquivar preserva a contribuição e tira ela das contagens", async () => {
  const exec = await criarExecutorPglite("memory://");
  const id = crypto.randomUUID();
  await salvarContribuicao(envio(id), exec);
  assert.equal(await arquivarContribuicao(id, exec), true);
  const guardadas = await exec.query("SELECT count(*)::int AS total FROM contribuicoes");
  assert.equal(Number(guardadas[0]?.total), 1);
  const sintese = await montarSintese(exec);
  assert.equal(sintese.total, 0);
  const lista = await listarContribuicoes(exec);
  assert.equal(lista.length, 1);
  assert.ok(lista[0]?.excluidaEm);
  assert.equal(resumir(lista, null).participantes, 0);
  assert.equal(montarSlides(lista, null).some((slide) => slide.tipo === "textos"), false);

  await salvarTotalMembros(12, exec);
  assert.equal(await lerTotalMembros(exec), 12);
  await salvarTotalMembros(null, exec);
  assert.equal(await lerTotalMembros(exec), null);

  await salvarContribuicao(envio(id), exec);
  const restaurada = await listarContribuicoes(exec);
  assert.equal(restaurada[0]?.excluidaEm, null);
  assert.equal((await montarSintese(exec)).total, 1);
});
