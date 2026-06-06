import { loadInstance } from "@/lib/instance";
import Console from "./Console";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await loadInstance("acme-corp");
  return <Console data={data} />;
}
