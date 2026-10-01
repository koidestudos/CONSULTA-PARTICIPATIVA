"use client";

import { BotaoTelao } from "@/components/admin/BotaoTelao";

export function GuiaTelao() {
  return (
    <section className="adm-painel">
      <h2>Apresentação / Telão</h2>
      <p>Durante a reunião, a apresentação abre em outra aba, sem o menu deste painel.</p>
      <ol className="adm-passos">
        <li>Clique em Apresentar no Telão.</li>
        <li>Na nova aba, escolha Tela cheia ou pressione F.</li>
        <li>Use a seta direita para avançar e a seta esquerda para voltar.</li>
        <li>O indicador mostra em qual tela você está, por exemplo 3 / 12.</li>
        <li>Pressione Esc para voltar a este painel.</li>
      </ol>
      <p className="adm-nota">
        O telão não mostra registro anônimo nem dado pessoal. Os textos exibidos são os originais, sem resumo automático.
      </p>
      <BotaoTelao grande />
    </section>
  );
}
