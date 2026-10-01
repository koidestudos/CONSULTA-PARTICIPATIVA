import type { ReactNode } from "react";
import { Moldura } from "@/components/admin/Moldura";

export default function LayoutPainel({ children }: { children: ReactNode }) {
  return <Moldura>{children}</Moldura>;
}
