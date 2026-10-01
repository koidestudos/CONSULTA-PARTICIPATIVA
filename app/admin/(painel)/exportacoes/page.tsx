import type { Metadata } from "next";
import { Suspense } from "react";
import { Exportacoes } from "@/components/admin/Exportacoes";

export const metadata: Metadata = { title: "Exportações" };

export default function Pagina() {
  return (
    <Suspense fallback={<p className="adm-espera">Carregando as exportações…</p>}>
      <Exportacoes />
    </Suspense>
  );
}
