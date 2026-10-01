"use client";

import type { ReactNode } from "react";
import { ProvedorPainel } from "@/components/admin/Painel";
import { Shell } from "@/components/admin/Shell";

export function Moldura({ children }: { children: ReactNode }) {
  return (
    <ProvedorPainel>
      <Shell>{children}</Shell>
    </ProvedorPainel>
  );
}
