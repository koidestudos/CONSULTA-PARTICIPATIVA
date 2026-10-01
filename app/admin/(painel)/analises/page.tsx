import type { Metadata } from "next";
import { Analises } from "@/components/admin/Analises";

export const metadata: Metadata = { title: "Análises" };

export default function Pagina() {
  return <Analises />;
}
