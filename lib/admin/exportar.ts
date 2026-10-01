import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { filtroAtivo, nomeArquivo } from "@/lib/admin/arquivo";
import { prioridadeLegivel, type LinhaResposta } from "@/lib/admin/modelo";

export { filtroAtivo, nomeArquivo };

export const COLUNAS = [
  "Tema",
  "Diretriz",
  "Ação",
  "Pergunta",
  "Resposta",
  "Prioridade",
  "Participante",
  "Registro anônimo",
  "Data",
  "Hora",
] as const;

const NOTA =
  "Consulta anônima do CEPMMIF-PI. A coluna Participante fica como “Não identificado” porque o formulário não coleta nome nem outro dado pessoal. O registro anônimo só permite agrupar as linhas da mesma contribuição. Prioridade indica se a ação foi escolhida entre as 3 prioridades gerais. Os textos são os originais, sem resumo automático.";

function valores(linha: LinhaResposta) {
  return [
    linha.tema,
    linha.diretriz,
    linha.acao,
    linha.pergunta,
    linha.resposta,
    prioridadeLegivel(linha.prioridade),
    "Não identificado",
    linha.id,
    linha.data,
    linha.hora,
  ];
}

export function gerarCsv(linhas: LinhaResposta[]) {
  const escapar = (valor: string) => `"${valor.replaceAll('"', '""')}"`;
  const corpo = [COLUNAS.join(";"), ...linhas.map((linha) => valores(linha).map(escapar).join(";"))];
  return `\uFEFF${corpo.join("\n")}\n`;
}

export async function gerarExcel(linhas: LinhaResposta[]) {
  const pasta = new ExcelJS.Workbook();
  pasta.creator = "CEPMMIF-PI";
  const folha = pasta.addWorksheet("Respostas");
  folha.addRow([...COLUNAS]);
  for (const linha of linhas) folha.addRow(valores(linha));
  folha.getRow(1).font = { bold: true, color: { argb: "FF0F3D5E" } };
  folha.columns.forEach((coluna) => {
    coluna.width = 28;
  });
  folha.getColumn(4).width = 42;
  folha.getColumn(5).width = 48;
  folha.views = [{ state: "frozen", ySplit: 1 }];
  const nota = pasta.addWorksheet("Leitura");
  nota.addRow([NOTA]);
  nota.getColumn(1).width = 120;
  const buffer = await pasta.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function gerarPdf(linhas: LinhaResposta[]) {
  const documento = new PDFDocument({ size: "A4", layout: "landscape", margin: 36 });
  const pedacos: Buffer[] = [];
  documento.on("data", (pedaco: Buffer) => pedacos.push(pedaco));
  const concluido = new Promise<void>((resolver) => documento.on("end", () => resolver()));

  documento.font("Helvetica-Bold").fontSize(16).fillColor("#0f3d5e").text("Consulta Participativa CEPMMIF-PI 2027–2028");
  documento.moveDown(0.3);
  documento.font("Helvetica").fontSize(10).fillColor("#163044").text(NOTA);
  documento.moveDown(0.4);
  documento.text(`Registros neste arquivo: ${linhas.length}`);
  documento.moveDown(0.8);

  for (const linha of linhas) {
    if (documento.y > 520) documento.addPage();
    documento.font("Helvetica-Bold").fontSize(11).fillColor("#0f3d5e").text(`${linha.diretriz} · ${linha.acao}`);
    documento
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#5c6e7e")
      .text(`${linha.data} às ${linha.hora} · ${prioridadeLegivel(linha.prioridade)}`);
    documento.font("Helvetica").fontSize(10).fillColor("#163044").text(linha.pergunta);
    documento.font("Helvetica").fontSize(11).text(linha.resposta);
    documento.moveDown(0.6);
  }

  if (linhas.length === 0) {
    documento.font("Helvetica").fontSize(12).text("Nenhuma resposta no filtro selecionado.");
  }

  documento.end();
  await concluido;
  return Buffer.concat(pedacos);
}
