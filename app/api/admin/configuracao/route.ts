import { ehResposta, exigirAdmin, json, lerJson } from "@/lib/admin/acesso";
import { salvarTotalMembros } from "@/lib/admin/dados";
import { BancoNaoConfigurado } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function interpretarTotal(valor: unknown) {
  if (valor === null || valor === "") return null;
  const numero = typeof valor === "number" ? valor : typeof valor === "string" ? Number(valor) : Number.NaN;
  if (!Number.isInteger(numero)) return "invalido" as const;
  if (numero === 0) return null;
  if (numero < 1 || numero > 5000) return "invalido" as const;
  return numero;
}

export async function POST(pedido: Request) {
  const negado = await exigirAdmin(pedido);
  if (negado) return negado;
  const corpo = await lerJson(pedido, 2_000);
  if (ehResposta(corpo)) return corpo;
  const recebido =
    corpo && typeof corpo === "object" && "totalMembros" in corpo
      ? (corpo as { totalMembros?: unknown }).totalMembros
      : undefined;
  const total = interpretarTotal(recebido);
  if (total === "invalido") {
    return json({ erro: "Informe um número inteiro de membros, entre 1 e 5000, ou deixe em branco." }, 400);
  }
  try {
    const guardado = await salvarTotalMembros(total);
    return json({ ok: true, totalMembros: guardado });
  } catch (erro) {
    if (erro instanceof BancoNaoConfigurado) {
      return json({ erro: "O banco da consulta não está configurado." }, 503);
    }
    console.error("Falha ao gravar a configuração administrativa");
    return json({ erro: "Não foi possível gravar a configuração." }, 500);
  }
}
