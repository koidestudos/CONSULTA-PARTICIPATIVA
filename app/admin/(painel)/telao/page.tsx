import type { Metadata } from "next";
import { GuiaTelao } from "@/components/admin/GuiaTelao";

export const metadata: Metadata = { title: "Apresentação" };

export default function Pagina() {
  return <GuiaTelao />;
}
