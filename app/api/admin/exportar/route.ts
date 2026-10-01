import { filtroAtivo, nomeArquivo } from "@/lib/admin/arquivo";
import { exigirAdmin, json } from "@/lib/admin/acesso";
import { listarContribuicoes } from "@/lib/admin/dados";
import { gerarCsv, gerarExcel, gerarPdf } from "@/lib/admin/exportar";
import { FILTRO_VAZIO, lerFiltro, linhasFiltradas } from "@/lib/admin/modelo";
import { BancoNaoConfigurado } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function arquivo(nome: string, tipo: string, corpo: BodyInit) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": tipo,
    "Content-Disposition": `attachment; filename="${nome}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
  });
  return new Response(corpo, { status: 200, headers });
}

export async function POST(pedido: Request) {
  const negado = await exigirAdmin(pedido);
  if (negado) return negado;
  const url = new URL(pedido.url);
  const formato = url.searchParams.get("formato");
  if (formato !== "xlsx" && formato !== "csv" && formato !== "pdf") {
    return json({ erro: "Escolha Excel, CSV ou PDF." }, 400);
  }
  const aplicar = url.searchParams.get("aplicar") === "1";
  const filtro = aplicar ? lerFiltro(url.searchParams) : FILTRO_VAZIO;
  const arquivadas = url.searchParams.get("arquivadas") === "1";
  try {
    const lista = await listarContribuicoes();
    const linhas = linhasFiltradas(lista, filtro, arquivadas);
    const nome = nomeArquivo(formato, aplicar && filtroAtivo(filtro));
    if (formato === "csv") return arquivo(nome, "text/csv; charset=utf-8", gerarCsv(linhas));
    if (formato === "xlsx") {
      const buffer = await gerarExcel(linhas);
      return arquivo(
        nome,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        new Uint8Array(buffer),
      );
    }
    const pdf = await gerarPdf(linhas);
    return arquivo(nome, "application/pdf", new Uint8Array(pdf));
  } catch (erro) {
    if (erro instanceof BancoNaoConfigurado) {
      return json({ erro: "O banco da consulta não está configurado." }, 503);
    }
    console.error("Falha ao exportar as respostas");
    return json({ erro: "Não foi possível gerar o arquivo." }, 500);
  }
}
