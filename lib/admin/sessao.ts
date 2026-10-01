export const COOKIE_ADMIN = "cepmmif_admin";
const DURACAO_MS = 12 * 60 * 60 * 1000;

function segredo() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

function bytesParaUrl(bytes: Uint8Array) {
  let texto = "";
  for (const byte of bytes) texto += String.fromCharCode(byte);
  return btoa(texto).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function urlParaBytes(valor: string) {
  const complemento = valor.length % 4 === 0 ? "" : "=".repeat(4 - (valor.length % 4));
  const base = valor.replaceAll("-", "+").replaceAll("_", "/") + complemento;
  const binario = atob(base);
  const bytes = new Uint8Array(binario.length);
  for (let indice = 0; indice < binario.length; indice += 1) bytes[indice] = binario.charCodeAt(indice);
  return bytes;
}

async function chave() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function assinaturasIguais(primeira: Uint8Array, segunda: Uint8Array) {
  if (primeira.length !== segunda.length) return false;
  let diferenca = 0;
  for (let indice = 0; indice < primeira.length; indice += 1) {
    diferenca |= primeira[indice] ^ segunda[indice];
  }
  return diferenca === 0;
}

export async function criarSessao(agora = Date.now()) {
  if (!segredo()) throw new Error("Sessão administrativa sem segredo");
  const carga = bytesParaUrl(new TextEncoder().encode(JSON.stringify({ exp: agora + DURACAO_MS })));
  const assinatura = await crypto.subtle.sign("HMAC", await chave(), new TextEncoder().encode(carga));
  return `${carga}.${bytesParaUrl(new Uint8Array(assinatura))}`;
}

export async function sessaoValida(token: string | undefined, agora = Date.now()) {
  if (!token || !segredo()) return false;
  const [carga, assinatura] = token.split(".");
  if (!carga || !assinatura) return false;
  const esperada = await crypto.subtle.sign("HMAC", await chave(), new TextEncoder().encode(carga));
  let recebida: Uint8Array;
  try {
    recebida = urlParaBytes(assinatura);
  } catch {
    return false;
  }
  if (!assinaturasIguais(new Uint8Array(esperada), recebida)) return false;
  try {
    const dados = JSON.parse(new TextDecoder().decode(urlParaBytes(carga))) as { exp?: unknown };
    return typeof dados.exp === "number" && dados.exp > agora;
  } catch {
    return false;
  }
}

export function lerCookie(cabecalho: string | null, nome: string) {
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(";")) {
    const [chaveCookie, ...resto] = parte.trim().split("=");
    if (chaveCookie === nome) return decodeURIComponent(resto.join("="));
  }
  return undefined;
}

export function cabecalhoCookie(token: string | null) {
  const partes = [`${COOKIE_ADMIN}=${token ? encodeURIComponent(token) : ""}`, "HttpOnly", "Path=/", "SameSite=Lax"];
  if (token) partes.push("Max-Age=43200");
  else partes.push("Max-Age=0");
  if (process.env.NODE_ENV === "production") partes.push("Secure");
  return partes.join("; ");
}
