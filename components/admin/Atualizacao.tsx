"use client";

import { formatarHora } from "@/lib/admin/modelo";
import { usePainel } from "@/components/admin/Painel";

export function Atualizacao() {
  const { atualizadoEm, novidade, carregando } = usePainel();
  if (carregando && !atualizadoEm) return null;
  return (
    <p className={novidade ? "adm-atualizacao" : "adm-atualizacao quieta"} aria-live="polite">
      {novidade ? "● Atualizado agora" : `Última atualização: ${atualizadoEm ? formatarHora(atualizadoEm) : ""}`}
    </p>
  );
}
