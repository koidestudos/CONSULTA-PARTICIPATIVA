"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Atualizacao } from "@/components/admin/Atualizacao";
import { BotaoTelao } from "@/components/admin/BotaoTelao";

const ITENS = [
  { href: "/admin/dashboard", rotulo: "Dashboard" },
  { href: "/admin/respostas", rotulo: "Respostas" },
  { href: "/admin/analises", rotulo: "Análises" },
  { href: "/admin/telao", rotulo: "Apresentação / Telão" },
  { href: "/admin/exportacoes", rotulo: "Exportações" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
];

export function Shell({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  async function sair() {
    await fetch("/api/admin/sair", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="adm-app">
      {aberto ? (
        <button type="button" className="adm-vela" aria-label="Fechar o menu" onClick={() => setAberto(false)} />
      ) : null}
      <aside className={aberto ? "adm-lado aberto" : "adm-lado"} id="menu-admin">
        <div className="adm-marca-bloco">
          <Image
            src="/marca-cepmmif.png"
            alt=""
            width={58}
            height={58}
            className="adm-login-marca"
          />
          <p className="adm-sigla">CEPMMIF-PI</p>
        </div>
        <nav aria-label="Menu administrativo">
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={caminho === item.href ? "ativo" : undefined}
              aria-current={caminho === item.href ? "page" : undefined}
              onClick={() => setAberto(false)}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <button type="button" className="adm-sair" onClick={() => void sair()}>
          Sair
        </button>
      </aside>
      <div className="adm-miolo">
        <header className="adm-topo">
          <div>
            <p className="adm-sigla">CEPMMIF-PI</p>
            <h1>Painel Administrativo – Consulta Participativa</h1>
            <p className="adm-sub">Plano de Ação 2027–2028</p>
            <Atualizacao />
          </div>
          <div className="adm-topo-acoes">
            <BotaoTelao />
            <button
              type="button"
              className="adm-menu"
              aria-expanded={aberto}
              aria-controls="menu-admin"
              onClick={() => setAberto((valor) => !valor)}
            >
              Menu
            </button>
          </div>
        </header>
        <div className="adm-faixa" aria-hidden="true" />
        <main id="conteudo" className="adm-conteudo">
          {children}
        </main>
      </div>
    </div>
  );
}
