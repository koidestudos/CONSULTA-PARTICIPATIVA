import { neon } from "@neondatabase/serverless";
import type { Executor, Linha } from "@/lib/executor";

export class BancoNaoConfigurado extends Error {
  constructor() {
    super("Banco não configurado");
    this.name = "BancoNaoConfigurado";
  }
}

function comoLinhas(resultado: unknown): Linha[] {
  if (Array.isArray(resultado)) return resultado as Linha[];
  if (resultado && typeof resultado === "object" && "rows" in resultado) {
    const linhas = (resultado as { rows?: unknown }).rows;
    if (Array.isArray(linhas)) return linhas as Linha[];
  }
  return [];
}

function criarExecutorNeon(url: string): Executor {
  const sql = neon(url);
  return {
    async query(texto, params = []) {
      const resultado = await sql.query(texto, params);
      return comoLinhas(resultado);
    },
    async exec(texto) {
      await sql.query(texto);
    },
  };
}

const globalExec = globalThis as { executorConsulta?: Executor };

export function urlBanco(): string {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
}

export async function obterExecutor(): Promise<Executor> {
  if (globalExec.executorConsulta) return globalExec.executorConsulta;
  const url = urlBanco();
  if (url) {
    globalExec.executorConsulta = criarExecutorNeon(url);
    return globalExec.executorConsulta;
  }
  if (process.env.NODE_ENV === "production") throw new BancoNaoConfigurado();
  const { criarExecutorPglite } = await import("@/lib/db-pglite");
  globalExec.executorConsulta = await criarExecutorPglite();
  return globalExec.executorConsulta;
}
