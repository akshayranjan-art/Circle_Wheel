import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Orbit" },
      { name: "description", content: "Browse everything Orbit has to offer." },
      { property: "og:title", content: "Explore — Orbit" },
      { property: "og:description", content: "Browse everything Orbit has to offer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

function Explore() {
  return (
    <PageShell
      eyebrow="Explore"
      title="Wander the collection."
      description="Fresh picks, trending pieces and hidden gems — all one tap away from the ring."
    />
  );
}
