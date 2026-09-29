export function origemPermitida(pedido: { headers: { get(nome: string): string | null } }): boolean {
  const origin = pedido.headers.get("origin");
  const host = pedido.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
