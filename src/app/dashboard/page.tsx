import type { Metadata } from "next";
import { loadInstance } from "@/lib/instance";
import Console from "./Console";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Démo",
  description: "Démo interactive du dashboard AI OS, façon système d'exploitation rétro.",
  robots: { index: false, follow: true },
};

export default async function DashboardPage() {
  const data = await loadInstance("acme-corp");
  return <Console data={data} />;
}
