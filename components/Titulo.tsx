import type { ReactNode, Ref } from "react";

export function Titulo({
  kicker,
  children,
  tituloRef,
}: {
  kicker?: string;
  children: ReactNode;
  tituloRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="titulo-bloco">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1 ref={tituloRef} tabIndex={-1} className="titulo">
        {children}
      </h1>
    </div>
  );
}
