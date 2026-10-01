"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Contribuicao } from "@/lib/admin/modelo";

type Estado = {
  contribuicoes: Contribuicao[];
  totalMembros: number | null;
  carregando: boolean;
  erro: string;
  atualizadoEm: string | null;
  novidade: boolean;
  recarregar: () => Promise<void>;
};

const Contexto = createContext<Estado | null>(null);

export function ProvedorPainel({ children }: { children: ReactNode }) {
  const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
  const [totalMembros, setTotalMembros] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [novidade, setNovidade] = useState(false);
  const [marca, setMarca] = useState("");
  const router = useRouter();

  const recarregar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/admin/painel", { cache: "no-store" });
      if (resposta.status === 401) {
        router.push("/admin");
        return;
      }
      const dados = (await resposta.json()) as {
        contribuicoes?: Contribuicao[];
        totalMembros?: number | null;
        erro?: string;
      };
      if (!resposta.ok || !Array.isArray(dados.contribuicoes)) {
        setErro(dados.erro || "Não foi possível carregar as respostas.");
        return;
      }
      setContribuicoes(dados.contribuicoes);
      setTotalMembros(typeof dados.totalMembros === "number" ? dados.totalMembros : null);
      setAtualizadoEm(new Date().toISOString());
      setErro("");
    } catch {
      setErro("Não foi possível carregar as respostas.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    let ativo = true;
    const carregar = () => {
      if (ativo) void recarregar();
    };
    carregar();
    const intervalo = window.setInterval(carregar, 15_000);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") carregar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [recarregar]);

  const assinatura = useMemo(() => {
    const ultima = contribuicoes.reduce<string>((maior, item) => (item.enviadoEm > maior ? item.enviadoEm : maior), "");
    return `${contribuicoes.length}:${ultima}:${totalMembros ?? ""}`;
  }, [contribuicoes, totalMembros]);

  if (atualizadoEm && assinatura !== marca) {
    const primeira = marca === "";
    setMarca(assinatura);
    if (!primeira) setNovidade(true);
  }

  useEffect(() => {
    if (!novidade) return;
    const temporizador = window.setTimeout(() => setNovidade(false), 12_000);
    return () => window.clearTimeout(temporizador);
  }, [novidade]);

  const valor = useMemo(
    () => ({ contribuicoes, totalMembros, carregando, erro, atualizadoEm, novidade, recarregar }),
    [atualizadoEm, carregando, contribuicoes, erro, novidade, recarregar, totalMembros],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePainel() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("O painel administrativo está fora do provedor");
  return contexto;
}
