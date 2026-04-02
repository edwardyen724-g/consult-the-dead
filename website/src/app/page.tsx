import { getAllFrameworks } from "@/lib/content";
import { HomeClient } from "@/components/HomeClient";

export default function HomePage() {
  const frameworks = getAllFrameworks();

  return <HomeClient frameworks={frameworks} />;
}
