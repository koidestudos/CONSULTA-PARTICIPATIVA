export type Linha = Record<string, unknown>;

export type Executor = {
  query: (sql: string, params?: unknown[]) => Promise<Linha[]>;
  exec: (sql: string) => Promise<void>;
};
