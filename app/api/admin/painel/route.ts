import { exigirAdmin, json } from "@/lib/admin/acesso";
import { lerTotalMembros, listarContribuicoes } from "@/lib/admin/dados";
import { BancoNaoConfigurado } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(pedido: Request) {
  const negado = await exigirAdmin(pedido);
  if (negado) return negado;
  try {
    const [contribuicoes, totalMembros] = await Promise.all([listarContribuicoes(), lerTotalMembros()]);
    return json({ contribuicoes, totalMembros, agora: new Date().toISOString() });
  } catch (erro) {
    if (erro instanceof BancoNaoConfigurado) {
      return json({ erro: "O banco da consulta não está configurado." }, 503);
    }
    console.error("Falha ao ler o painel administrativo");
    return json({ erro: "Não foi possível carregar as respostas." }, 500);
  }
}
