import { BancoNaoConfigurado } from "@/lib/db";
import { origemPermitida } from "@/lib/origem";
import { salvarContribuicao } from "@/lib/salvar";
import { validarDados } from "@/lib/validacao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEM_CACHE = { "Cache-Control": "no-store" };

function json(corpo: unknown, status: number) {
  return Response.json(corpo, { status, headers: SEM_CACHE });
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST", ...SEM_CACHE } });
}

export async function POST(pedido: Request) {
  if (!origemPermitida(pedido)) {
    return json({ erro: "Não foi possível enviar a contribuição." }, 403);
  }

  const tipo = pedido.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    return json({ erro: "Não foi possível ler a contribuição." }, 415);
  }

  let texto = "";
  try {
    texto = await pedido.text();
  } catch {
    return json({ erro: "Não foi possível ler a contribuição." }, 400);
  }
  if (texto.length > 80_000) {
    return json({ erro: "A contribuição excede o tamanho permitido." }, 413);
  }

  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return json({ erro: "Não foi possível ler a contribuição." }, 400);
  }

  const resultado = validarDados(corpo);
  if (!resultado.ok) return json({ erro: resultado.erro }, 400);

  try {
    const recibo = await salvarContribuicao(resultado.dados);
    return json(recibo, 201);
  } catch (erro) {
    if (erro instanceof BancoNaoConfigurado) {
      console.error("DATABASE_URL não configurada. A contribuição não foi armazenada.");
    } else {
      const codigo =
        erro && typeof erro === "object" && "code" in erro
          ? String((erro as { code: unknown }).code)
          : "";
      console.error(`Falha ao registrar contribuição. ${codigo}`.trim());
    }
    return json(
      {
        erro: "Não foi possível registrar a contribuição agora. Suas respostas continuam neste aparelho. Tente novamente.",
      },
      503,
    );
  }
}
