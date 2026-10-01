import type { Metadata } from "next";
import { Telao } from "@/components/admin/Telao";

export const metadata: Metadata = { title: "Telão" };

export default function Pagina() {
  return <Telao />;
}
