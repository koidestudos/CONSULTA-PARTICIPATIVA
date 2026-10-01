"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePainel } from "@/components/admin/Painel";

function Formulario({
  inicial,
  recarregar,
}: {
  inicial: number | null;
  recarregar: () => Promise<void>;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(inicial ? String(inicial) : "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function gravar(evento: FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    setMensagem("");
    setErro("");
    try {
      const resposta = await fetch("/api/admin/configuracao", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ totalMembros: valor.trim() === "" ? null : Number(valor) }),
      });
      const dados = (await resposta.json()) as { erro?: string };
      if (resposta.status === 401) {
        router.push("/admin");
        return;
      }
      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível gravar.");
        return;
      }
      setMensagem("Configuração gravada.");
      await recarregar();
    } catch {
      setErro("Não foi possível gravar.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="adm-painel">
      <h2>Configurações</h2>
      <p className="adm-nota">
        O percentual de participação só aparece quando este total está preenchido. Ele não identifica ninguém e não
        altera as respostas já recebidas. Rascunhos interrompidos continuam apenas no aparelho de quem participa.
      </p>
      <form className="adm-form" onSubmit={(evento) => void gravar(evento)}>
        <label>
          Total de membros esperado
          <input
            inputMode="numeric"
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
            placeholder="Ex.: 40"
          />
        </label>
        {mensagem ? <p className="adm-ok">{mensagem}</p> : null}
        {erro ? (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        ) : null}
        <button className="adm-botao" type="submit" disabled={ocupado}>
          {ocupado ? "Gravando…" : "Gravar"}
        </button>
      </form>
    </section>
  );
}

export function Configuracoes() {
  const { totalMembros, carregando, atualizadoEm, recarregar } = usePainel();
  if (carregando && !atualizadoEm) return <p className="adm-espera">Carregando as configurações…</p>;
  return <Formulario inicial={totalMembros} recarregar={recarregar} />;
}
