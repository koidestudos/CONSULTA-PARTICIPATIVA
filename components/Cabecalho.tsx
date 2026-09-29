import Image from "next/image";

export function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="moldura cabecalho-interno">
        <Image
          src="/marca-cepmmif.png"
          alt="Marca do Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí"
          width={256}
          height={256}
          priority
          className="marca"
        />
        <div className="identidade">
          <p className="sigla">CEPMMIF-PI</p>
          <p className="orgao">
            Comitê Estadual de Prevenção de Mortalidade Materna, Infantil e Fetal do Piauí
          </p>
        </div>
      </div>
      <div className="faixa" aria-hidden="true" />
    </header>
  );
}
