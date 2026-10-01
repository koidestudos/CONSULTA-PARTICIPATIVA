import { ehResposta, exigirAdmin, json, lerJson } from "@/lib/admin/acesso";
import { arquivarContribuicao } from "@/lib/admin/dados";
import { BancoNaoConfigurado } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(pedido: Request) {
  const negado = await exigirAdmin(pedido);
  if (negado) return negado;
  const corpo = await lerJson(pedido, 2_000);
  if (ehResposta(corpo)) return corpo;
  const id = corpo && typeof corpo === "object" && "id" in corpo && typeof corpo.id === "string" ? corpo.id : "";
  if (!UUID.test(id)) return json({ erro: "Não foi possível localizar esta resposta." }, 400);
  try {
    const arquivou = await arquivarContribuicao(id);
    if (!arquivou) return json({ erro: "Esta resposta já não está entre as vigentes." }, 404);
    return json({ ok: true });
  } catch (erro) {
    if (erro instanceof BancoNaoConfigurado) {
      return json({ erro: "O banco da consulta não está configurado." }, 503);
    }
    console.error("Falha ao arquivar contribuição");
    return json({ erro: "Não foi possível retirar esta resposta das contagens." }, 500);
  }
}
