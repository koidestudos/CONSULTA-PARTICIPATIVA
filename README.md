# Consulta Participativa · Plano de Ação CEPMMIF-PI 2027–2028

Painel público e anônimo para os membros do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí contribuírem com o Plano de Ação 2027–2028.

As quatro diretrizes do Plano de Ação 2024–2026 são mantidas e não podem ser alteradas:

1. Organização e Sistematização
2. Investigação, discussão e monitoramento dos óbitos
3. Educação continuada e qualificações
4. Divulgação de Informações

A consulta coleta apenas sugestões para aprimorar as ações dentro dessas diretrizes.

## Anonimato

O painel não pede nome, CPF, e-mail, telefone, município, instituição, cargo, região ou qualquer outro dado pessoal. Não há login, cadastro ou área administrativa.

Cada contribuição recebe somente:

- um identificador anônimo gerado no aparelho;
- data e hora do envio;
- as respostas das quatro diretrizes, as três prioridades e os textos abertos.

O aplicativo não lê IP, localização, agente do navegador nem cookies. Até o envio, o rascunho fica apenas no navegador da pessoa. Os resultados agregados não aparecem para quem participa.

## Desenvolvimento

```bash
npm install
npm test
npm run dev
```

Sem `DATABASE_URL`, o ambiente local usa um Postgres embutido na pasta `.data/`. Essa pasta não vai para o Git e não é usada em produção.

## Publicar na Vercel

1. Importe este repositório na Vercel.
2. No projeto, adicione o Postgres do Neon pelo Marketplace. A integração preenche `DATABASE_URL` ou `POSTGRES_URL`.
3. Faça o deploy.

Na primeira contribuição, o aplicativo cria a tabela `contribuicoes` e as visões de agregação. Não é preciso rodar uma migração manual.

## Síntese para a equipe, fora do painel

Os participantes não veem totais, rankings nem textos de outras pessoas. A síntese fica no banco, para uma ferramenta futura ou para consulta direta por quem administra os dados:

```bash
DATABASE_URL="postgresql://..." npm run sintese
```

O comando imprime, em JSON:

- quantidade total de respostas;
- ações, prioridades, temas e formatos mais escolhidos;
- sugestões abertas e a frequência dos textos;
- síntese por diretriz.

Não publique essa saída: ela reúne o conteúdo das contribuições.
