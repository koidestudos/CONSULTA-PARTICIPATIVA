import { ehResposta, json, lerJson } from "@/lib/admin/acesso";
import {
  acessoConfigurado,
  credenciaisValidas,
  loginBloqueado,
  registrarFalha,
  registrarSucesso,
} from "@/lib/admin/credenciais";
import { cabecalhoCookie, criarSessao } from "@/lib/admin/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(pedido: Request) {
  if (!acessoConfigurado()) {
    return json({ erro: "A área administrativa ainda não foi configurada neste ambiente." }, 503);
  }
  if (loginBloqueado()) {
    return json({ erro: "Muitas tentativas. Aguarde um minuto e tente de novo." }, 429);
  }

  const corpo = await lerJson(pedido, 4_000);
  if (ehResposta(corpo)) return corpo;
  const usuario =
    corpo && typeof corpo === "object" && "usuario" in corpo && typeof corpo.usuario === "string"
      ? corpo.usuario
      : "";
  const senha =
    corpo && typeof corpo === "object" && "senha" in corpo && typeof corpo.senha === "string" ? corpo.senha : "";

  if (usuario.length > 120 || senha.length > 200 || !credenciaisValidas(usuario, senha)) {
    registrarFalha();
    return json({ erro: "Não foi possível entrar. Confira o usuário e a senha." }, 401);
  }

  registrarSucesso();
  return json({ ok: true }, 200, { "Set-Cookie": cabecalhoCookie(await criarSessao()) });
}
