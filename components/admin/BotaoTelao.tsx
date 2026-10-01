"use client";

export function abrirTelao() {
  window.open("/admin/apresentacao", "_blank", "noopener");
}

export function BotaoTelao({ grande = false }: { grande?: boolean }) {
  return (
    <button type="button" className={grande ? "adm-botao telao grande" : "adm-botao telao"} onClick={abrirTelao}>
      Apresentar no Telão
    </button>
  );
}
