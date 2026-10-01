import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Área administrativa",
    template: "%s · Área administrativa",
  },
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return <div className="adm">{children}</div>;
}
