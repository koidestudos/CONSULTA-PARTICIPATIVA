import { json } from "@/lib/admin/acesso";
import { cabecalhoCookie } from "@/lib/admin/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST() {
  return json({ ok: true }, 200, { "Set-Cookie": cabecalhoCookie(null) });
}
