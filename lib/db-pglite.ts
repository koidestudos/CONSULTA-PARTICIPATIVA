import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { Executor, Linha } from "@/lib/executor";

export async function criarExecutorPglite(dataDir?: string): Promise<Executor> {
  const pasta = dataDir ?? path.join(process.cwd(), ".data", "consulta");
  if (pasta !== "memory://") mkdirSync(pasta, { recursive: true });
  const db = new PGlite(pasta);
  await db.waitReady;
  return {
    async query(sql, params = []) {
      const resultado = await db.query<Linha>(sql, params);
      return resultado.rows;
    },
    async exec(sql) {
      await db.exec(sql);
    },
  };
}
