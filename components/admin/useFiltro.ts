"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FILTRO_VAZIO, lerFiltro, type Filtro } from "@/lib/admin/modelo";

export function useFiltroConsulta() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filtro = useMemo(() => lerFiltro(params), [params]);
  const arquivadas = params.get("arquivadas") === "1";

  const gravar = useCallback(
    (proximo: Filtro, comArquivadas: boolean) => {
      const busca = new URLSearchParams();
      for (const [chave, valor] of Object.entries(proximo)) {
        if (valor.trim()) busca.set(chave, valor);
      }
      if (comArquivadas) busca.set("arquivadas", "1");
      const consulta = busca.toString();
      router.replace(consulta ? `${pathname}?${consulta}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const atualizar = useCallback(
    (parcial: Partial<Filtro>) => gravar({ ...filtro, ...parcial }, arquivadas),
    [arquivadas, filtro, gravar],
  );
  const definirArquivadas = useCallback((valor: boolean) => gravar(filtro, valor), [filtro, gravar]);
  const limpar = useCallback(() => gravar(FILTRO_VAZIO, false), [gravar]);

  return { filtro, arquivadas, atualizar, definirArquivadas, limpar };
}
