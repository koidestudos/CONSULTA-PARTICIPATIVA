export const SENTENCAS = [
  `
CREATE TABLE IF NOT EXISTS contribuicoes (
  id uuid PRIMARY KEY,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  d1_acoes jsonb NOT NULL,
  d1_outra text,
  d1_sugestao text,
  d2_acoes jsonb NOT NULL,
  d2_outra text,
  d2_sugestao text,
  d3_temas jsonb NOT NULL,
  d3_outro_tema text,
  d3_formatos jsonb NOT NULL,
  d3_outro_formato text,
  d3_sugestao text,
  d4_acoes jsonb NOT NULL,
  d4_outra text,
  d4_sugestao text,
  prioridades jsonb NOT NULL,
  motivo_prioridades text,
  mudanca_unica text,
  manter_ou_ampliar text,
  revisar_ou_encerrar text,
  CONSTRAINT contribuicoes_prioridades_tres CHECK (
    jsonb_typeof(prioridades) = 'array' AND jsonb_array_length(prioridades) = 3
  ),
  CONSTRAINT contribuicoes_listas_validas CHECK (
    jsonb_typeof(d1_acoes) = 'array'
    AND jsonb_typeof(d2_acoes) = 'array'
    AND jsonb_typeof(d3_temas) = 'array'
    AND jsonb_typeof(d3_formatos) = 'array'
    AND jsonb_typeof(d4_acoes) = 'array'
    AND jsonb_array_length(d1_acoes) BETWEEN 1 AND 20
    AND jsonb_array_length(d2_acoes) BETWEEN 1 AND 20
    AND jsonb_array_length(d3_temas) BETWEEN 1 AND 20
    AND jsonb_array_length(d3_formatos) BETWEEN 1 AND 20
    AND jsonb_array_length(d4_acoes) BETWEEN 1 AND 20
  ),
  CONSTRAINT contribuicoes_textos_tamanho CHECK (
    (d1_outra IS NULL OR char_length(d1_outra) <= 300)
    AND (d1_sugestao IS NULL OR char_length(d1_sugestao) <= 2000)
    AND (d2_outra IS NULL OR char_length(d2_outra) <= 300)
    AND (d2_sugestao IS NULL OR char_length(d2_sugestao) <= 2000)
    AND (d3_outro_tema IS NULL OR char_length(d3_outro_tema) <= 300)
    AND (d3_outro_formato IS NULL OR char_length(d3_outro_formato) <= 300)
    AND (d3_sugestao IS NULL OR char_length(d3_sugestao) <= 2000)
    AND (d4_outra IS NULL OR char_length(d4_outra) <= 300)
    AND (d4_sugestao IS NULL OR char_length(d4_sugestao) <= 2000)
    AND (motivo_prioridades IS NULL OR char_length(motivo_prioridades) <= 2000)
    AND (mudanca_unica IS NULL OR char_length(mudanca_unica) <= 2000)
    AND (manter_ou_ampliar IS NULL OR char_length(manter_ou_ampliar) <= 2000)
    AND (revisar_ou_encerrar IS NULL OR char_length(revisar_ou_encerrar) <= 2000)
  )
)
`.trim(),
  `
COMMENT ON TABLE contribuicoes IS 'Contribuições anônimas da consulta do Plano de Ação CEPMMIF-PI 2027-2028.'
`.trim(),
  `
CREATE INDEX IF NOT EXISTS contribuicoes_enviado_em_idx ON contribuicoes (enviado_em DESC)
`.trim(),
  `
ALTER TABLE contribuicoes ADD COLUMN IF NOT EXISTS excluida_em timestamptz
`.trim(),
  `
COMMENT ON COLUMN contribuicoes.excluida_em IS
  'Preenchido quando a administração arquiva a contribuição. O registro original permanece na tabela.'
`.trim(),
  `
CREATE TABLE IF NOT EXISTS configuracoes (
  chave text PRIMARY KEY,
  valor text NOT NULL,
  CONSTRAINT configuracoes_tamanho CHECK (char_length(chave) <= 40 AND char_length(valor) <= 40)
)
`.trim(),
  `
COMMENT ON TABLE configuracoes IS
  'Ajustes do painel administrativo, sem dados de participantes.'
`.trim(),
  `DROP VIEW IF EXISTS vw_frequencia_sugestoes`,
  `DROP VIEW IF EXISTS vw_sugestoes_abertas`,
  `DROP VIEW IF EXISTS vw_acoes_mais_escolhidas`,
  `DROP VIEW IF EXISTS vw_temas_capacitacao`,
  `DROP VIEW IF EXISTS vw_formatos_capacitacao`,
  `DROP VIEW IF EXISTS vw_prioridades`,
  `DROP VIEW IF EXISTS vw_total_respostas`,
  `
CREATE VIEW vw_total_respostas AS
SELECT
  COUNT(*)::int AS total,
  MIN(enviado_em) AS primeira_resposta,
  MAX(enviado_em) AS ultima_resposta
FROM contribuicoes
WHERE excluida_em IS NULL
`.trim(),
  `
CREATE VIEW vw_acoes_mais_escolhidas AS
SELECT 'diretriz_1'::text AS origem, acao, COUNT(*)::int AS frequencia
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(d1_acoes) AS acao
WHERE excluida_em IS NULL
GROUP BY acao
UNION ALL
SELECT 'diretriz_2'::text, acao, COUNT(*)::int
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(d2_acoes) AS acao
WHERE excluida_em IS NULL
GROUP BY acao
UNION ALL
SELECT 'diretriz_4'::text, acao, COUNT(*)::int
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(d4_acoes) AS acao
WHERE excluida_em IS NULL
GROUP BY acao
`.trim(),
  `
CREATE VIEW vw_temas_capacitacao AS
SELECT tema, COUNT(*)::int AS frequencia
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(d3_temas) AS tema
WHERE excluida_em IS NULL
GROUP BY tema
`.trim(),
  `
CREATE VIEW vw_formatos_capacitacao AS
SELECT formato, COUNT(*)::int AS frequencia
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(d3_formatos) AS formato
WHERE excluida_em IS NULL
GROUP BY formato
`.trim(),
  `
CREATE VIEW vw_prioridades AS
SELECT prioridade, COUNT(*)::int AS frequencia
FROM contribuicoes
CROSS JOIN LATERAL jsonb_array_elements_text(prioridades) AS prioridade
WHERE excluida_em IS NULL
GROUP BY prioridade
`.trim(),
  `
CREATE VIEW vw_sugestoes_abertas AS
SELECT id, enviado_em, 'diretriz_1'::text AS origem, 'nova_acao'::text AS campo, d1_sugestao AS texto
FROM contribuicoes
WHERE excluida_em IS NULL AND d1_sugestao IS NOT NULL AND btrim(d1_sugestao) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_1', 'outra', d1_outra
FROM contribuicoes
WHERE excluida_em IS NULL AND d1_outra IS NOT NULL AND btrim(d1_outra) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_2', 'nova_acao', d2_sugestao
FROM contribuicoes
WHERE excluida_em IS NULL AND d2_sugestao IS NOT NULL AND btrim(d2_sugestao) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_2', 'outra', d2_outra
FROM contribuicoes
WHERE excluida_em IS NULL AND d2_outra IS NOT NULL AND btrim(d2_outra) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_3', 'educacao_permanente', d3_sugestao
FROM contribuicoes
WHERE excluida_em IS NULL AND d3_sugestao IS NOT NULL AND btrim(d3_sugestao) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_3', 'outro_tema', d3_outro_tema
FROM contribuicoes
WHERE excluida_em IS NULL AND d3_outro_tema IS NOT NULL AND btrim(d3_outro_tema) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_3', 'outro_formato', d3_outro_formato
FROM contribuicoes
WHERE excluida_em IS NULL AND d3_outro_formato IS NOT NULL AND btrim(d3_outro_formato) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_4', 'informacao_ou_ferramenta', d4_sugestao
FROM contribuicoes
WHERE excluida_em IS NULL AND d4_sugestao IS NOT NULL AND btrim(d4_sugestao) <> ''
UNION ALL
SELECT id, enviado_em, 'diretriz_4', 'outra', d4_outra
FROM contribuicoes
WHERE excluida_em IS NULL AND d4_outra IS NOT NULL AND btrim(d4_outra) <> ''
UNION ALL
SELECT id, enviado_em, 'prioridades', 'motivo', motivo_prioridades
FROM contribuicoes
WHERE excluida_em IS NULL AND motivo_prioridades IS NOT NULL AND btrim(motivo_prioridades) <> ''
UNION ALL
SELECT id, enviado_em, 'espaco_aberto', 'mudanca_unica', mudanca_unica
FROM contribuicoes
WHERE excluida_em IS NULL AND mudanca_unica IS NOT NULL AND btrim(mudanca_unica) <> ''
UNION ALL
SELECT id, enviado_em, 'espaco_aberto', 'manter_ou_ampliar', manter_ou_ampliar
FROM contribuicoes
WHERE excluida_em IS NULL AND manter_ou_ampliar IS NOT NULL AND btrim(manter_ou_ampliar) <> ''
UNION ALL
SELECT id, enviado_em, 'espaco_aberto', 'revisar_ou_encerrar', revisar_ou_encerrar
FROM contribuicoes
WHERE excluida_em IS NULL AND revisar_ou_encerrar IS NOT NULL AND btrim(revisar_ou_encerrar) <> ''
`.trim(),
  `
CREATE VIEW vw_frequencia_sugestoes AS
SELECT
  origem,
  campo,
  lower(btrim(texto)) AS texto_normalizado,
  COUNT(*)::int AS frequencia,
  min(texto) AS exemplo
FROM vw_sugestoes_abertas
GROUP BY origem, campo, lower(btrim(texto))
`.trim(),
];

export async function aplicarSchema(exec: { exec: (sql: string) => Promise<void> }) {
  for (const sentenca of SENTENCAS) {
    await exec.exec(sentenca);
  }
}
