import type { Metadata } from "next";
import { Suspense } from "react";
import { Respostas } from "@/components/admin/Respostas";

export const metadata: Metadata = { title: "Respostas" };

export default function Pagina() {
  return (
    <Suspense fallback={<p className="adm-espera">Carregando as respostas…</p>}>
      <Respostas />
    </Suspense>
  );
}
