import { COOKIE_ADMIN, lerCookie, sessaoValida } from "@/lib/admin/sessao";

export function json(corpo: unknown, status = 200, extras?: Record<string, string>) {
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (extras) {
    for (const [chave, valor] of Object.entries(extras)) headers.set(chave, valor);
  }
  return Response.json(corpo, { status, headers });
}

export function ehResposta(valor: unknown): valor is Response {
  return valor instanceof Response;
}

export async function exigirAdmin(pedido: Request) {
  const token = lerCookie(pedido.headers.get("cookie"), COOKIE_ADMIN);
  if (await sessaoValida(token)) return null;
  return json({ erro: "Acesso restrito." }, 401);
}

export async function lerJson(pedido: Request, limite = 20_000) {
  const tipo = pedido.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    return json({ erro: "Não foi possível ler os dados." }, 415);
  }
  let texto = "";
  try {
    texto = await pedido.text();
  } catch {
    return json({ erro: "Não foi possível ler os dados." }, 400);
  }
  if (texto.length > limite) return json({ erro: "Não foi possível ler os dados." }, 413);
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return json({ erro: "Não foi possível ler os dados." }, 400);
  }
}
