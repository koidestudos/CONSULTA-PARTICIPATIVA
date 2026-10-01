import type { Metadata } from "next";
import { Login } from "@/components/admin/Login";

export const metadata: Metadata = { title: "Entrar" };

export default function Pagina() {
  return <Login />;
}
