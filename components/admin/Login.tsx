"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    setErro("");
    try {
      const resposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const dados = (await resposta.json()) as { erro?: string };
      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível entrar.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErro("Não foi possível entrar.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-faixa" aria-hidden="true" />
        <div className="adm-login-corpo">
          <Image
            src="/marca-cepmmif.png"
            alt="Marca do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí"
            width={84}
            height={84}
            priority
            className="adm-login-marca"
          />
          <p className="adm-kicker">CEPMMIF-PI</p>
          <h1>Área administrativa</h1>
          <p className="orgao">Consulta Participativa · Plano de Ação 2027–2028</p>
          <form className="adm-form" onSubmit={(evento) => void entrar(evento)}>
            <label>
              E-mail ou usuário
              <input
                name="usuario"
                autoComplete="username"
                spellCheck={false}
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                required
              />
            </label>
            <label>
              Senha
              <input
                name="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
              />
            </label>
            {erro ? (
              <p className="adm-erro" role="alert">
                {erro}
              </p>
            ) : null}
            <button className="adm-botao" type="submit" disabled={ocupado}>
              {ocupado ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <Link className="adm-voltar" href="/">
            Voltar à consulta
          </Link>
        </div>
      </div>
    </div>
  );
}
