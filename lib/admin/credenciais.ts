import { createHash, timingSafeEqual } from "node:crypto";

let falhas = 0;
let bloqueadoAte = 0;

export function acessoConfigurado() {
  return Boolean(
    process.env.ADMIN_USER?.trim() && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET?.trim(),
  );
}

function discreto(recebido: string, esperado: string) {
  const primeiro = createHash("sha256").update(recebido).digest();
  const segundo = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(primeiro, segundo);
}

export function credenciaisValidas(usuario: string, senha: string) {
  const esperadoUsuario = process.env.ADMIN_USER?.trim() ?? "";
  const esperadaSenha = process.env.ADMIN_PASSWORD ?? "";
  if (!acessoConfigurado()) return false;
  return discreto(usuario.trim(), esperadoUsuario) && discreto(senha, esperadaSenha);
}

export function loginBloqueado(agora = Date.now()) {
  return agora < bloqueadoAte;
}

export function registrarFalha(agora = Date.now()) {
  falhas += 1;
  if (falhas >= 8) bloqueadoAte = agora + 60_000;
}

export function registrarSucesso() {
  falhas = 0;
  bloqueadoAte = 0;
}
