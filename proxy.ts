import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_ADMIN, sessaoValida } from "@/lib/admin/sessao";

export async function proxy(pedido: NextRequest) {
  const caminho = pedido.nextUrl.pathname;
  const token = pedido.cookies.get(COOKIE_ADMIN)?.value;
  const valida = await sessaoValida(token);

  if (caminho === "/api/admin/login" && pedido.method === "POST") return NextResponse.next();
  if (caminho === "/api/admin/sair" && pedido.method === "POST") return NextResponse.next();

  if (caminho.startsWith("/api/admin")) {
    if (!valida) {
      return NextResponse.json(
        { erro: "Acesso restrito." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.next();
  }

  if (caminho === "/admin") {
    if (valida) return NextResponse.redirect(new URL("/admin/dashboard", pedido.url));
    return NextResponse.next();
  }

  if (!valida) return NextResponse.redirect(new URL("/admin", pedido.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
